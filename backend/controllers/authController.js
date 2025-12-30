const User = require("../models/User");
const Company = require("../models/Company");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
    }
    const user = new User({ name, email, password, role });
    await user.save();

    // Automatically create a company profile if the user is a company
    if (role === "COMPANY") {
      const company = new Company({
        company_name: name + " (Corp)",
        industry: "ESG & Sustainability",
        carbon_target_tco2e: 5000,
        user_id: user._id
      });
      await company.save();
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || "vanshi_secret_key");
    res.status(201).json({ status: "success", user, token });
  } catch (error) {
    console.error("DEBUG REGISTER ERROR:", error);
    let message = "Registration failed";
    if (error.code === 11000) {
      message = "Email already exists";
    } else if (error.errors) {
      message = Object.values(error.errors).map(val => val.message).join(", ");
    } else if (error.message) {
      message = error.message;
    }
    res.status(400).json({ status: "error", message: String(message) });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: "error", message: "Invalid login credentials" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || "vanshi_secret_key");
    res.status(200).json({ status: "success", user, token });
  } catch (error) {
    console.error("DEBUG LOGIN ERROR:", error);
    res.status(400).json({ status: "error", message: error.message || "Login failed" });
  }
};

exports.test = (req, res) => {
  res.json({ status: "ok", message: "Auth route is working correctly", time: new Date() });
};
