const mongoose = require("mongoose");

const CarbonAssetSchema = new mongoose.Schema({
  forest_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForestLand", required: true },
  total_carbon_tco2e: { type: Number, required: true },
  carbon_rate: { type: Number, required: true },
  price_per_ton: { type: Number, default: 952 },
  total_value_inr: { type: Number, required: true },
  status: { type: String, default: "ACTIVE" }
});

module.exports = mongoose.model("CarbonAsset", CarbonAssetSchema);
