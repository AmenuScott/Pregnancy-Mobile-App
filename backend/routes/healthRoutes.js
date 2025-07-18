const express = require("express");
const router = express.Router();
const { getHealthTips } = require("../controllers/healthTipsController");

router.get("/tips", getHealthTips);

module.exports = router;
