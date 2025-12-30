const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { auth } = require("../middleware/auth");

router.get("/settings", auth, adminController.getSettings);
router.post("/settings", auth, adminController.updateSettings);

module.exports = router;
