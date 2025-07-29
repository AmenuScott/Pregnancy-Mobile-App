const pool = require("../db")

exports.createBabyProfile = async (req, res) => {
  const { userId, birth_date } = req.body

  if (!userId || !birth_date) {
    return res.status(400).json({ message: "userId and birth_date are required" })
  }

  try {
    const result = await pool.query(
      "INSERT INTO baby_profiles (user_id, birth_date) VALUES ($1, $2) RETURNING *",
      [userId, birth_date]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating baby profile:", error)
    res.status(500).json({ message: "Internal server error" })
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

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error fetching baby profile:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
