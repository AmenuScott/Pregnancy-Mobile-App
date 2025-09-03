const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Allowed event names (MVP scope)
const ALLOWED = new Set([
  'app_open',
  'symptom_logged',
  'menstrual_logged',
  'baby_dob_saved',
  'notification_opened',
  'chat_message_sent'
]);

router.post('/api/analytics', async (req, res) => {
  try {
    const { userId, name, ts, props } = req.body || {};
    if (!name || !ALLOWED.has(name)) {
      return res.status(400).json({ error: 'Invalid event name' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const eventTs = ts ? new Date(ts) : new Date();

    const { error } = await supabase.from('analytics_events').insert([
      {
        user_id: userId.toString(),
        name,
        ts: eventTs.toISOString(),
        props: props && typeof props === 'object' ? props : {},
      }
    ]);

    if (error) {
      console.error('Analytics insert error:', error.message);
      return res.status(500).json({ error: 'Failed to store event' });
    }

    return res.status(202).json({ status: 'accepted' });
  } catch (e) {
    console.error('Analytics route error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/api/analytics/summary', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    // Last 7 day window
    const { data, error } = await supabase.rpc('analytics_summary', { p_user_id: userId.toString() });
    if (error) {
      console.error('Summary function error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
    return res.json(data || {});
  } catch (e) {
    console.error('Summary route error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
