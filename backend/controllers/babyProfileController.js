const db = require("../config/db");

// POST - Create or Update Baby Profile
exports.createOrUpdateBabyProfile = async (req, res) => {
  const { userId, birth_date } = req.body;

  if (!userId || !birth_date) {
    return res.status(400).json({ message: "Missing userId or birth_date" });
  }

  try {
    // Check if profile exists
    const check = await db.query("SELECT * FROM baby_profiles WHERE user_id = $1", [userId]);

    if (check.rows.length > 0) {
      // Update existing profile
      await db.query(
        "UPDATE baby_profiles SET birth_date = $1 WHERE user_id = $2",
        [birth_date, userId]
      );
    } else {
      // Insert new profile
      await db.query(
        "INSERT INTO baby_profiles (user_id, birth_date) VALUES ($1, $2)",
        [userId, birth_date]
      );
    }

    res.status(200).json({ message: "Baby profile saved successfully." });
  } catch (error) {
    console.error("Error saving baby profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET - Fetch Baby Profile by User ID
exports.getBabyProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query("SELECT * FROM baby_profiles WHERE user_id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Baby profile not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching baby profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
