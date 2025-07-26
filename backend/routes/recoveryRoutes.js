const express = require("express");
const router = express.Router();
const recoveryController = require("../controllers/recoveryController");

// POST /api/recovery
router.post("/", recoveryController.saveRecoveryLog);

// (Optional: Get past logs)
router.get("/:userId", recoveryController.getRecoveryLogs);

module.exports = router;
