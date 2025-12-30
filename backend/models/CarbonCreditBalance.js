const mongoose = require("mongoose");

const CarbonCreditBalanceSchema = new mongoose.Schema({
  carbon_id: { type: mongoose.Schema.Types.ObjectId, ref: "CarbonAsset", required: true },
  issued_credits: { type: Number, required: true },
  sold_credits: { type: Number, default: 0 },
  remaining_credits: { type: Number, required: true },
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CarbonCreditBalance", CarbonCreditBalanceSchema);
