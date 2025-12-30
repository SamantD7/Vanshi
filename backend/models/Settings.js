const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
    price_per_credit: { type: Number, default: 952 },
    base_rates: {
        broadleaf: { type: Number, default: 30 },
        mixed: { type: Number, default: 28 },
        pine: { type: Number, default: 24 },
        degraded: { type: Number, default: 20 }
    },
    last_updated: { type: Date, default: Date.now },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Settings", SettingsSchema);
