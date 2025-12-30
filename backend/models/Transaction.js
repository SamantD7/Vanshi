const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  carbon_id: { type: mongoose.Schema.Types.ObjectId, ref: "CarbonAsset", required: true },
  credits_purchased: { type: Number, required: true },
  amount_paid_inr: { type: Number, required: true },
  transaction_type: { type: String, default: "PURCHASE" },
  ledger_type: { type: String, default: "BLOCKCHAIN_SIMULATED" },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "COMPLETED" }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
