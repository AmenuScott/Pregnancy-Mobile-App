const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// Save a symptom log
router.post('/', async (req, res) => {
  const { userId, symptom } = req.body;
  if (!userId || !symptom) return res.status(400).json({ error: 'Missing fields' });
  const { error } = await supabase.from('symptom_logs').insert([{ userId, symptom }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Get symptom logs per day (for chart)
router.get('/per-day', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const { data, error } = await supabase
    .rpc('symptom_logs_per_day', { p_user_id: userId });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;