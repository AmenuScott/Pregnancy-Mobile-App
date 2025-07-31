const pool = require("../db");

// Helper to calculate trimester
const getTrimester = (lastLMP) => {
  const now = new Date();
  const lmp = new Date(lastLMP);
  const diffWeeks = Math.floor((now - lmp) / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks < 13) return "first";
  if (diffWeeks < 27) return "second";
  return "third";
};

// ✅ Get Daily Exercise by Calculated Trimester
exports.getDailyExercise = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    // Get last menstrual period
    const profileResult = await pool.query(
      "SELECT last_menstrual_period FROM pregnancy_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: "Pregnancy profile not found" });
    }

    const { last_menstrual_period } = profileResult.rows[0];
    const trimester = getTrimester(last_menstrual_period);

    // Get one random exercise for the calculated trimester
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
    res.status(500).json({ error: "Server error while fetching exercise" });
  }
};
