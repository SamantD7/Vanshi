const mongoose = require("mongoose");

const ForestLandSchema = new mongoose.Schema({
  village_name: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  forest_area_ha: { type: Number, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  forest_type: { type: String, required: true },
  owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["PENDING", "VERIFIED"], default: "PENDING" },
  on_chain_project_id: { type: Number },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ForestLand", ForestLandSchema);
