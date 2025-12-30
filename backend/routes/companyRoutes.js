const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const { auth } = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const company = new Company({ ...req.body, user_id: req.user._id });
    await company.save();
    res.status(201).send(company);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ user_id: req.user._id });
    res.send(company);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
