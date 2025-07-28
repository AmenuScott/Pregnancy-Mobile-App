const express = require("express");
const router = express.Router();
const { createMenstrualLog } = require("../controllers/menstrualController");

router.post("/menstrual-logs", createMenstrualLog);

module.exports = router;
