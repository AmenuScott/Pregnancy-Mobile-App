const pool = require("../db")

exports.createBabyProfile = async (req, res) => {
  const { user_id, baby_dob } = req.body

  if (!user_id || !baby_dob) {
    return res.status(400).json({ message: "user_id and baby_dob are required" })
  }

  try {
    const result = await pool.query(
      "INSERT INTO baby_profiles (user_id, birth_date) VALUES ($1, $2) RETURNING *",
      [user_id, baby_dob]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("💥 CREATE BABY PROFILE ERROR:", error.message)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
}



exports.getBabyProfile = async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      "SELECT * FROM baby_profiles WHERE user_id = $1",
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Baby profile not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("💥 GET BABY PROFILE ERROR:", error.message)
    res.status(500).json({ message: "Internal server error" })
  }
}

