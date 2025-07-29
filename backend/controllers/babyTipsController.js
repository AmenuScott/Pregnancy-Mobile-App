// controllers/babyTipsController.js
const pool = require("../db")

exports.getAllBabyTips = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM baby_tips ORDER BY created_at DESC")
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching baby tips:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
