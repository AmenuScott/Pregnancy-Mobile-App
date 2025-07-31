const pool = require("../db");

// ✅ Get Daily Exercise by Trimester
exports.getDailyExercise = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    // Get user's trimester
    const profileResult = await pool.query(
      "SELECT trimester FROM pregnancy_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const trimester = profileResult.rows[0].trimester;

    // Get one random exercise for that trimester
    const exerciseResult = await pool.query(
      `SELECT * FROM exercises 
       WHERE trimester = $1 
       ORDER BY RANDOM() 
       LIMIT 1`,
      [trimester]
    );

    if (exerciseResult.rows.length === 0) {
      return res.status(404).json({ error: "No exercises found for this trimester" });
    }

    res.status(200).json(exerciseResult.rows[0]);
  } catch (err) {
    console.error("Error getting daily exercise:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
