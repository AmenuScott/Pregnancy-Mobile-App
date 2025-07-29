const express = require("express")
const router = express.Router()
const babyProfileController = require("../controllers/babyProfileController")

// Create baby profile
router.post("/baby-profiles", babyProfileController.createBabyProfile)

// Get baby profile by user ID
router.get("/baby-profiles/:userId", babyProfileController.getBabyProfile)

module.exports = router
