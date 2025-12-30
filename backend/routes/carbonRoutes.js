const express = require("express");
const router = express.Router();
const carbonAssetController = require("../controllers/carbonAssetController");
const { auth } = require("../middleware/auth");

router.post("/:forestId/activate", auth, carbonAssetController.activateCarbonAsset);
router.get("/marketplace", auth, carbonAssetController.getMarketplace);

module.exports = router;
