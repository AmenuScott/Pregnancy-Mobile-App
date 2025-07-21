const pool = require("../db");

exports.getTips = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tips ORDER BY show_on_day ASC");

    res.status(200).json({
      message: "Fetched tips successfully!",
      count: result.rows.length,
      tips: result.rows,
    });
  } catch (error) {
    console.error("Error fetching tips:", error);
    res.status(500).json({ message: "Error fetching tips", error: error.message });
  }
};
