const pool = require("../db")

exports.getRecoveryTips = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recovery_tips ORDER BY created_at DESC")
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching recovery tips:", error)
    res.status(500).json({ error: "Failed to fetch tips" })
  }
}
