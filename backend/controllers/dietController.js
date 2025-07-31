const pool = require("../db"); // Same as your other controllers

exports.getRecommendedFoods = async (req, res) => {
  const { trimester } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM recommended_foods WHERE trimester = $1",
      [trimester]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMealIdeas = async (req, res) => {
  const { trimester } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM meal_ideas WHERE trimester = $1",
      [trimester]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFoodsToAvoid = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM foods_to_avoid");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNutritionTips = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nutrition_tips");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
