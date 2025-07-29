const express = require("express");
const router = express.Router();
const personalizedController = require("../controllers/personalizedController");

// GET tips based on user baby's age
router.get("/api/personalized-tips/:userId", personalizedController.getPersonalizedTips);

module.exports = router;
