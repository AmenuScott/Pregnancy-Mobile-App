const express = require("express");
const router = express.Router();
const { createMenstrualLog } = require("../controllers/menstrualController");
const { getMenstrualLogs } = require("../controllers/menstrualController");
const { getMenstrualInsights } = require("../controllers/menstrualController");

router.post("/menstrual-logs", createMenstrualLog);
router.get("/menstrual-logs/:user_id", getMenstrualLogs);
router.get("/api/menstrual-insights", menstrualController.getMenstrualInsights)


module.exports = router;
