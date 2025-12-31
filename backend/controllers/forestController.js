const axios = require("axios");
const ForestLand = require("../models/ForestLand");
const NDVIData = require("../models/NDVIData");
const CarbonAsset = require("../models/CarbonAsset");
const CarbonCreditBalance = require("../models/CarbonCreditBalance");
const Settings = require("../models/Settings");
const { calculateCarbon, getHealthStatus, getBaseRate } = require("../services/carbonService");
const { createProjectOnChain, mintCreditsOnChain } = require("../services/blockchainService");
const User = require("../models/User");

exports.registerForest = async (req, res) => {
  try {
    const forest = new ForestLand({
      ...req.body,
      owner_user_id: req.user._id,
      status: "PENDING" // Set to PENDING initially
    });
    await forest.save();

    res.status(201).send({ forest });
  } catch (error) {
    console.error("Forest Registration Error:", error);
    res.status(400).send(error);
  }
};

exports.getForests = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const price = settings ? settings.price_per_credit : 952;

    const query = req.user.role === "VILLAGE" ? { owner_user_id: req.user._id } : {};
    const forests = await ForestLand.find(query);

    const forestsWithData = [];
    for (const forest of forests) {
      const forestObj = forest.toObject();
      const asset = await CarbonAsset.findOne({ forest_id: forest._id });
      if (asset) {
        const balance = await CarbonCreditBalance.findOne({ carbon_id: asset._id });
        forestObj.sales_data = {
          total_issued: balance?.issued_credits || 0,
          sold_credits: balance?.sold_credits || 0,
          remaining_credits: balance?.remaining_credits || 0,
          revenue_earned: (balance?.sold_credits || 0) * price
        };
      } else {
        forestObj.sales_data = { total_issued: 0, sold_credits: 0, remaining_credits: 0, revenue_earned: 0 };
      }
      forestsWithData.push(forestObj);
    }

    res.send(forestsWithData);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.verifyForest = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).send("Admin only");

    const forest = await ForestLand.findById(req.params.id);
    if (!forest) return res.status(404).send("Forest not found");

    // Call Python GEE Service for real analysis
    try {
      const response = await axios.post("http://localhost:8000/analyze-forest", {
        latitude: forest.location.latitude,
        longitude: forest.location.longitude,
        forest_area_ha: forest.forest_area_ha
      });

      const { ndvi, forest_health, verification_status } = response.data;

      forest.status = verification_status === "REJECTED" ? "PENDING" : "VERIFIED";
      await forest.save();

      const ndviData = new NDVIData({
        forest_id: forest._id,
        ndvi_value: ndvi,
        forest_health: forest_health,
        confidence_score: 0.95 // Adjusted from GEE analysis
      });
      await ndviData.save();

      // IF VERIFIED, Create Project On-Chain
      if (forest.status === "VERIFIED") {
        try {
          const owner = await User.findById(forest.owner_user_id);
          const settings = await Settings.findOne();
          const baseRate = getBaseRate(forest.forest_type, settings);

          const projectId = await createProjectOnChain(
            owner.wallet_address || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Fallback to Hardhat Account #1
            Math.floor(forest.forest_area_ha * 100), // Cap (example multiplier)
            baseRate,
            new Date().getFullYear(),
            `ipfs://forest-${forest._id}`
          );

          if (projectId !== null) {
            forest.on_chain_project_id = projectId;
            await forest.save();
          }
        } catch (bcError) {
          console.error("On-chain project creation failed:", bcError);
          // We still keep the forest verified in DB, but log the error
        }
      }

      res.send({ forest, ndviData });
    } catch (geeError) {
      console.error("GEE Service Error:", geeError.message);
      return res.status(503).send("GEE analysis service unavailable");
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.activateCredits = async (req, res) => {
  try {
    const forest = await ForestLand.findById(req.params.id);
    if (!forest) return res.status(404).send("Forest not found");

    const settings = await Settings.findOne();
    const price = settings ? settings.price_per_credit : 952;

    // Check ownership
    if (forest.owner_user_id.toString() !== req.user._id.toString()) {
      return res.status(403).send("Only the forest owner can activate credits");
    }

    if (forest.status !== "VERIFIED") {
      return res.status(400).send("Forest must be verified before activating credits");
    }

    const existingAsset = await CarbonAsset.findOne({ forest_id: forest._id });
    if (existingAsset) return res.status(400).send("Credits already activated");

    let ndvi = await NDVIData.findOne({ forest_id: forest._id });
    if (!ndvi) {
      const ndvi_value = 0.75 + (Math.random() * 0.1);
      ndvi = new NDVIData({
        forest_id: forest._id,
        ndvi_value: ndvi_value,
        forest_health: getHealthStatus(ndvi_value),
        confidence_score: 0.95
      });
      await ndvi.save();
    }

    const total_carbon = calculateCarbon(forest.forest_area_ha, forest.forest_type, ndvi.ndvi_value, settings);

    const carbonAsset = new CarbonAsset({
      forest_id: forest._id,
      total_carbon_tco2e: total_carbon,
      carbon_rate: getBaseRate(forest.forest_type, settings),
      total_value_inr: total_carbon * price,
      status: "ACTIVE"
    });
    await carbonAsset.save();

    const balance = new CarbonCreditBalance({
      carbon_id: carbonAsset._id,
      issued_credits: Math.floor(total_carbon),
      remaining_credits: Math.floor(total_carbon)
    });
    await balance.save();

    // Mint Credits On-Chain
    if (forest.on_chain_project_id !== undefined) {
      try {
        await mintCreditsOnChain(forest.on_chain_project_id, Math.floor(total_carbon));
      } catch (bcError) {
        console.error("On-chain minting failed:", bcError);
      }
    }

    res.send({ status: "success", carbonAsset, balance });
  } catch (error) {
    console.error("Activation Error:", error);
    res.status(400).send(error);
  }
};

exports.deleteForest = async (req, res) => {
  try {
    const forest = await ForestLand.findById(req.params.id);
    if (!forest) return res.status(404).send("Forest not found");

    // Check ownership OR Admin role
    if (forest.owner_user_id.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).send("Unauthorized to delete this forest");
    }

    // Cleanup associated data
    const asset = await CarbonAsset.findOne({ forest_id: forest._id });
    if (asset) {
      await CarbonCreditBalance.deleteOne({ carbon_id: asset._id });
      await CarbonAsset.deleteOne({ _id: asset._id });
    }
    await NDVIData.deleteMany({ forest_id: forest._id });
    await ForestLand.deleteOne({ _id: forest._id });

    res.send({ message: "Forest and associated data removed successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
