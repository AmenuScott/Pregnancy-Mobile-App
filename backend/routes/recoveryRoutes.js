const express = require("express");
const router = express.Router();
const { addRecoveryLog, getRecoveryLogs } = require("../controllers/recoveryController");

router.post("/recovery/:userId", addRecoveryLog);
router.get("/recovery/:userId", getRecoveryLogs);

module.exports = router;
