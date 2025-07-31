const pool = require("../db");

// Helper to calculate trimester based on last menstrual period
const getTrimester = (lastLMP) => {
  const now = new Date();
  const lmp = new Date(lastLMP);
  const diffWeeks = Math.floor((now - lmp) / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks < 13) return "first";
  if (diffWeeks < 27) return "second";
  return "third";
};

// ✅ GET Daily Exercise Based on Trimester
exports.getDailyExercise = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get LMP from profile
    const profileResult = await pool.query(
      "SELECT last_menstrual_period FROM pregnancy_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: "Pregnancy profile not found" });
    }

    const { last_menstrual_period } = profileResult.rows[0];
    const trimester = getTrimester(last_menstrual_period);

    // Get one random exercise for that trimester
    const exerciseResult = await pool.query(
      `SELECT * FROM exercises WHERE trimester = $1 ORDER BY RANDOM() LIMIT 1`,
      [trimester]
    );

    if (exerciseResult.rows.length === 0) {
      return res.status(404).json({ error: "No exercise found for this trimester" });
    }

    res.status(200).json(exerciseResult.rows[0]);
  } catch (err) {
    console.error("Error getting daily exercise:", err.message);
    res.status(500).json({ error: "Server error while fetching exercise" });
  }
};

// ✅ GET All Exercises by Category
exports.getExercisesByCategory = async (req, res) => {
  const { category } = req.query;

  try {
    let query = "SELECT * FROM exercises";
    let values = [];

    if (category) {
      query += " WHERE LOWER(category) = LOWER($1)";
      values.push(category);
    }

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error getting exercises by category:", err.message);
    res.status(500).json({ error: "Server error while fetching exercises" });
  }
};

// ✅ Add to Favorites
exports.addToFavorites = async (req, res) => {
  const { userId } = req.params;
  const { exercise_id } = req.body;

  if (!exercise_id) {
    return res.status(400).json({ error: "Exercise ID is required" });
  }

  try {
    await pool.query(
      "INSERT INTO favorites (user_id, exercise_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, exercise_id]
    );

    res.status(201).json({ message: "Exercise added to favorites" });
  } catch (err) {
    console.error("Error adding to favorites:", err.message);
    res.status(500).json({ error: "Server error while adding favorite" });
  }
};

// ✅ GET All Favorite Exercises
exports.getFavorites = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT e.*
       FROM exercises e
       JOIN favorites f ON e.id = f.exercise_id
       WHERE f.user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching favorites:", err.message);
    res.status(500).json({ error: "Server error while fetching favorites" });
  }
};
