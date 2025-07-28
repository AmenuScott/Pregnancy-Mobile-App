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

exports.getMenstrualLogs = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM menstrual_logs
       WHERE user_id = $1
       ORDER BY cycle_start_date DESC`,
      [user_id]
    );

    const logs = result.rows;

    // Estimate next period date
    if (logs.length >= 2) {
      const diffs = [];
      for (let i = 0; i < logs.length - 1; i++) {
        const d1 = new Date(logs[i].cycle_start_date);
        const d2 = new Date(logs[i + 1].cycle_start_date);
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
        if (diff > 10 && diff < 50) diffs.push(diff); // valid range
      }
      const avgCycle = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length || 28);
      const lastDate = new Date(logs[0].cycle_start_date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + avgCycle);

      return res.json({
        logs,
        nextPeriod: nextDate.toISOString().split("T")[0],
        averageCycle: avgCycle,
      });
    }

    res.json({ logs, nextPeriod: null, averageCycle: null });
  } catch (error) {
    console.error("Error fetching menstrual logs:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMenstrualInsights = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT cycle_start_date
       FROM menstrual_logs
       WHERE user_id = $1
       ORDER BY cycle_start_date DESC
       LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No menstrual logs found" });
    }

    const startDate = new Date(result.rows[0].cycle_start_date);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const insights = await pool.query(
      `SELECT * FROM menstrual_insights
       WHERE day_number = $1`,
      [daysPassed]
    );

    res.json({
      cycleDay: daysPassed,
      insights: insights.rows,
    });
  } catch (error) {
    console.error("Error fetching insights:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
