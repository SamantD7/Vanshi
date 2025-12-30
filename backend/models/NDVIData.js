const mongoose = require("mongoose");

const NDVIDataSchema = new mongoose.Schema({
  forest_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForestLand", required: true },
  satellite_source: { type: String, default: "Sentinel-2" },
  ndvi_value: { type: Number, required: true },
  forest_health: { type: String, required: true },
  confidence_score: { type: Number, required: true },
  calculated_on: { type: Date, default: Date.now }
});

module.exports = mongoose.model("NDVIData", NDVIDataSchema);
