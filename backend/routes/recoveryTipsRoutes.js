const express = require("express")
const router = express.Router()
const { getRecoveryTips } = require("../controllers/recoveryTipsController")

router.get("/", getRecoveryTips)

module.exports = router
