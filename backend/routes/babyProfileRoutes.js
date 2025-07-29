const express = require("express");
const router = express.Router();
const babyProfileController = require("../controllers/babyProfileController");

router.post("/api/baby-profile", babyProfileController.createOrUpdateBabyProfile);
router.get("/api/baby-profile/:userId", babyProfileController.getBabyProfile);

module.exports = router;
