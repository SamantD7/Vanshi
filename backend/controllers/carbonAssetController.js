const CarbonAsset = require("../models/CarbonAsset");
const CarbonCreditBalance = require("../models/CarbonCreditBalance");
const ForestLand = require("../models/ForestLand");
const NDVIData = require("../models/NDVIData");
const Settings = require("../models/Settings");
const { calculateCarbon } = require("../services/carbonService");

exports.activateCarbonAsset = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).send("Admin only");

    const settings = await Settings.findOne();
    const price = settings ? settings.price_per_credit : 952;

    const forest = await ForestLand.findById(req.params.forestId);
    if (!forest || forest.status !== "VERIFIED") return res.status(400).send("Forest must be verified");

    let ndvi = await NDVIData.findOne({ forest_id: forest._id });
    if (!ndvi) {
      ndvi = new NDVIData({
        forest_id: forest._id,
        ndvi_value: 0.75,
        forest_health: "Good",
        confidence_score: 0.9
      });
      await ndvi.save();
    }
    const total_carbon = calculateCarbon(forest.forest_area_ha, forest.forest_type, ndvi.ndvi_value);

    const carbonAsset = new CarbonAsset({
      forest_id: forest._id,
      total_carbon_tco2e: total_carbon,
      carbon_rate: 30, // example base rate
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

    res.send({ carbonAsset, balance, current_price: price });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getMarketplace = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const price = settings ? settings.price_per_credit : 952;

    const assets = await CarbonAsset.find({ status: "ACTIVE" }).populate("forest_id");

    // Filter out assets with zero remaining credits
    const filteredAssets = [];
    for (const asset of assets) {
      const balance = await CarbonCreditBalance.findOne({ carbon_id: asset._id });
      if (balance && balance.remaining_credits > 0) {
        // Attach balance info for frontend display convenience
        const assetObj = asset.toObject();
        assetObj.balance = balance;
        assetObj.current_market_price = price; // Provide dynamic price to frontend
        filteredAssets.push(assetObj);
      }
    }

    res.send(filteredAssets);
  } catch (error) {
    res.status(500).send(error);
  }
};
