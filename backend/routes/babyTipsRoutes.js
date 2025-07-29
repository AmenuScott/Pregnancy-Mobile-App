// routes/babyTipsRoutes.js
const express = require("express")
const router = express.Router()
const babyTipsController = require("../controllers/babyTipsController")

router.get("/baby-tips", babyTipsController.getAllBabyTips)

module.exports = router
