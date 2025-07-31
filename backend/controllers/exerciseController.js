const db = require("../db") // adjust path if needed

exports.getDailyExercise = async (req, res) => {
  const { userId } = req.params

  try {
    // Get user's trimester
    const profile = await db.oneOrNone(
      "SELECT trimester FROM pregnancy_profiles WHERE user_id = $1",
      [userId]
    )

    if (!profile) {
      return res.status(404).json({ error: "User profile not found" })
    }

    const trimester = profile.trimester

    // Pick one exercise randomly for that trimester
    const exercise = await db.oneOrNone(
      `SELECT * FROM exercises WHERE trimester = $1 ORDER BY RANDOM() LIMIT 1`,
      [trimester]
    )

    if (!exercise) {
      return res.status(404).json({ error: "No exercise found for this trimester" })
    }

    res.json(exercise)
  } catch (err) {
    console.error("Error getting daily exercise:", err)
    res.status(500).json({ error: "Server error" })
  }
}
