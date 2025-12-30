const Transaction = require("../models/Transaction");
const CarbonCreditBalance = require("../models/CarbonCreditBalance");
const Company = require("../models/Company");
const Settings = require("../models/Settings");

exports.buyCredits = async (req, res) => {
  try {
    const { carbon_id, credits_to_buy } = req.body;

    // Fetch global price
    const settings = await Settings.findOne();
    const price = settings ? settings.price_per_credit : 952;

    let company = await Company.findOne({ user_id: req.user._id });
    if (!company) {
      if (req.user.role === 'COMPANY') {
        company = new Company({
          company_name: req.user.name + " (Corp)",
          industry: "ESG & Sustainability",
          carbon_target_tco2e: 5000,
          user_id: req.user._id
        });
        await company.save();
      } else {
        return res.status(403).json({ message: "Only companies can purchase credits" });
      }
    }

    const balance = await CarbonCreditBalance.findOne({ carbon_id });
    if (!balance || balance.remaining_credits < credits_to_buy) {
      return res.status(400).json({ message: "Insufficient credits available" });
    }

    balance.sold_credits += credits_to_buy;
    balance.remaining_credits -= credits_to_buy;
    balance.last_updated = Date.now();
    await balance.save();

    const transaction = new Transaction({
      company_id: company._id,
      carbon_id: carbon_id,
      credits_purchased: credits_to_buy,
      amount_paid_inr: credits_to_buy * price
    });
    await transaction.save();

    res.send({ transaction, balance });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getHistory = async (req, res) => {
  try {
    const company = await Company.findOne({ user_id: req.user._id });
    const transactions = await Transaction.find({ company_id: company._id })
      .populate({
        path: 'carbon_id',
        populate: { path: 'forest_id' }
      });
    res.send(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
};
