const express = require("express");
const router = express.Router();
const dietController = require("../controllers/dietController");

router.get("/api/recommended-foods/:trimester", dietController.getRecommendedFoods);
router.get("/api/meal-ideas/:trimester", dietController.getMealIdeas);
router.get("/api/foods-to-avoid", dietController.getFoodsToAvoid);
router.get("/api/nutrition-tips", dietController.getNutritionTips);

module.exports = router;
