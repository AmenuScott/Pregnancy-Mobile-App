const pool = require("../db");

exports.addRecoveryLog = async (req, res) => {
  const { userId } = req.params;
  const { pain_level, bleeding_level, mood, sleep_quality, note } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO recovery_logs 
        (user_id, pain_level, bleeding_level, mood, sleep_quality, note) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, pain_level, bleeding_level, mood, sleep_quality, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Recovery log error:", err);
    res.status(500).json({ error: "Failed to add recovery log" });
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
  } catch (err) {
    console.error("Fetch logs error:", err);
    res.status(500).json({ error: "Failed to fetch recovery logs" });
  }
};
