const express = require("express");
const router = express.Router();
const { createMenstrualLog } = require("../controllers/menstrualController");

router.post("/menstrual-logs", createMenstrualLog);
router.get("/menstrual-logs/:user_id", getMenstrualLogs);

module.exports = router;
