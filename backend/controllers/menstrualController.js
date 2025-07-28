const pool = require("../db");

exports.createMenstrualLog = async (req, res) => {
  try {
    const { user_id, cycle_start_date, flow_intensity, symptoms, notes } = req.body;

    if (!user_id || !cycle_start_date) {
      return res.status(400).json({ error: "User ID and cycle start date are required." });
    }

    const result = await pool.query(
      `INSERT INTO menstrual_logs (user_id, cycle_start_date, flow_intensity, symptoms, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, cycle_start_date, flow_intensity, symptoms, notes]
    );

    res.status(201).json({ message: "Cycle entry saved!", data: result.rows[0] });
  } catch (error) {
    console.error("Error saving menstrual log:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
