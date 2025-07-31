const express = require("express")
const router = express.Router()
const { getDailyExercise } = require("../controllers/exerciseController")

router.get("/api/exercises/daily/:userId", getDailyExercise)

module.exports = router
