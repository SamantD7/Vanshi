const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching settings" });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin only" });

        const { price_per_credit, base_rates } = req.body;
        let settings = await Settings.findOne();

        if (price_per_credit) settings.price_per_credit = price_per_credit;
        if (base_rates) settings.base_rates = base_rates;

        settings.last_updated = Date.now();
        settings.updated_by = req.user._id;

        await settings.save();
        res.json({ message: "Settings updated successfully", settings });
    } catch (err) {
        res.status(400).json({ message: "Error updating settings", error: err.message });
    }
};
