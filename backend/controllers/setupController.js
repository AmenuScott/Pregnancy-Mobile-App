// controllers/setupController.js
const db = require('../db');

exports.savePregnancyProfile = async (req, res) => {
  try {
    const { userId, lastMenstrualPeriod, firstPregnancy, healthConditions, otherCondition } = req.body;

    if (!userId || !lastMenstrualPeriod || firstPregnancy === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const healthConditionsStr = Array.isArray(healthConditions) 
      ? JSON.stringify(healthConditions) 
      : healthConditions || '';

    const query = `
      INSERT INTO pregnancy_profiles (id, user_id, last_menstrual_period, first_pregnancy, health_conditions, other_condition, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        last_menstrual_period = EXCLUDED.last_menstrual_period, 
        first_pregnancy = EXCLUDED.first_pregnancy,
        health_conditions = EXCLUDED.health_conditions, 
        other_condition = EXCLUDED.other_condition
      RETURNING *;
    `;

    const values = [userId, lastMenstrualPeriod, firstPregnancy, healthConditionsStr, otherCondition || ''];

    const result = await db.query(query, values);
    res.json({ message: 'Setup saved', setup: result.rows[0] });
  } catch (error) {
    console.error('❌ Error saving setup:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
