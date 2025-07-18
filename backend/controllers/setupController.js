// controllers/setupController.js
const db = require('../db');

exports.savePregnancyProfile = async (req, res) => {
  try {
    const {
      userId,
      lastMenstrualPeriod,
      firstPregnancy
    } = req.body;

    if (!userId || !lastMenstrualPeriod || firstPregnancy === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertQuery = `
      INSERT INTO pregnancy_profiles (
        id, user_id, last_menstrual_period, first_pregnancy, created_at
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id)
      DO UPDATE SET 
        last_menstrual_period = EXCLUDED.last_menstrual_period, 
        first_pregnancy = EXCLUDED.first_pregnancy
      RETURNING *;
    `;

    const insertValues = [userId, lastMenstrualPeriod, firstPregnancy];

    const result = await db.query(insertQuery, insertValues);

    // ✅ Now update profileCompleted to true
    await db.query(
      `UPDATE patients SET profileCompleted = true WHERE id = $1`,
      [userId]
    );

    res.json({ message: 'Setup saved', setup: result.rows[0] });

  } catch (error) {
    console.error('❌ Error saving setup:', error);
    res.status(500).json({ error: 'Server error' });
  }
};





