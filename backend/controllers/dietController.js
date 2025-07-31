const db = require("../db") // Adjust if you're using Supabase or another client

exports.getRecommendedFoods = async (req, res) => {
  const { trimester } = req.params;
  try {
    const foods = await db("recommended_foods").where({ trimester });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMealIdeas = async (req, res) => {
  const { trimester } = req.params;
  try {
    const meals = await db("meal_ideas").where({ trimester });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFoodsToAvoid = async (req, res) => {
  try {
    const list = await db("foods_to_avoid");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNutritionTips = async (req, res) => {
  try {
    const tips = await db("nutrition_tips");
    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
