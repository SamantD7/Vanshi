const express = require("express");
const router = express.Router();
const forestController = require("../controllers/forestController");
const { auth } = require("../middleware/auth");

router.post("/", auth, forestController.registerForest);
router.get("/", auth, forestController.getForests);
router.patch("/:id/verify", auth, forestController.verifyForest);
router.post("/:id/activate", auth, forestController.activateCredits);
router.delete("/:id", auth, forestController.deleteForest);

module.exports = router;
