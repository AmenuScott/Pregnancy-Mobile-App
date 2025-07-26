const pool = require("../db");

exports.saveRecoveryLog = async (req, res) => {
  const {
    user_id,
    pain_level,
    bleeding_level,
    mood,
    sleep_quality,
    note,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO recovery_logs
       (user_id, pain_level, bleeding_level, mood, sleep_quality, note)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, pain_level, bleeding_level, mood, sleep_quality, note]
    );

    res.status(201).json({ message: "Recovery data saved successfully" });
  } catch (error) {
    console.error("Error saving recovery data:", error);
    res.status(500).json({ message: "Server error while saving recovery data" });
  }
};

exports.getRecoveryLogs = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM recovery_logs WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching recovery logs:", error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
};
