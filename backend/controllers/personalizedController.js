const db = require("../db");

// Fetch personalized tips based on baby's age
exports.getPersonalizedTips = async (req, res) => {
  const { userId } = req.params;

  try {
    const profileQuery = await db.query(
      "SELECT birth_date FROM baby_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileQuery.rows.length === 0) {
      return res.status(404).json({ message: "Baby profile not found" });
    }

    const birthDate = new Date(profileQuery.rows[0].birth_date);
    const today = new Date();
    const ageInWeeks = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 7));

    const tipsQuery = await db.query(
      "SELECT * FROM personalized_baby_tips WHERE age_min_weeks <= $1 AND age_max_weeks >= $1 ORDER BY created_at DESC",
      [ageInWeeks]
    );

    res.status(200).json({
      babyAgeWeeks: ageInWeeks,
      personalizedTips: tipsQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching personalized tips:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
