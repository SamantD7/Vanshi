const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  industry: { type: String, required: true },
  carbon_target_tco2e: { type: Number, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Company", CompanySchema);
