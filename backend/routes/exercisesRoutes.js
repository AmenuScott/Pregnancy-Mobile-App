const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exerciseController");

// ✅ Get one daily exercise based on user’s trimester
router.get("/api/exercises/daily/:userId", exerciseController.getDailyExercise);

// ✅ Get exercises by category (optional query param: ?category=Stretching)
router.get("/api/exercises", exerciseController.getExercisesByCategory);

// ✅ Add to favorites
router.post("/api/exercises/favorites/:userId", exerciseController.addToFavorites);

// ✅ Get user's favorite exercises
router.get("/api/exercises/favorites/:userId", exerciseController.getFavorites);

module.exports = router;
