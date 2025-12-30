const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { auth } = require("../middleware/auth");

router.post("/buy", auth, transactionController.buyCredits);
router.get("/history", auth, transactionController.getHistory);

module.exports = router;
