const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireApiKey = require('../middleware/requireApiKey');

const TZ = 'Africa/Nairobi';

// GET current total view count (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM page_views');
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch view count' });
  }
});

// GET detailed stats (protected, admin only)
router.get('/stats', requireApiKey, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int AS count FROM page_views');

    const today = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM page_views
       WHERE (viewed_at AT TIME ZONE $1)::date = (NOW() AT TIME ZONE $1)::date`,
      [TZ]
    );

    const daily = await pool.query(
      `SELECT to_char((viewed_at AT TIME ZONE $1)::date, 'YYYY-MM-DD') AS day,
              COUNT(*)::int AS visits
       FROM page_views
       WHERE viewed_at > NOW() - INTERVAL '7 days'
       GROUP BY day
       ORDER BY day DESC`,
      [TZ]
    );

    const recent = await pool.query(
      'SELECT viewed_at FROM page_views ORDER BY viewed_at DESC LIMIT 10'
    );

    res.json({
      total: total.rows[0].count,
      today: today.rows[0].count,
      daily: daily.rows,
      recent: recent.rows.map((r) => r.viewed_at),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST record a new view (public, no admin key needed)
router.post('/', async (req, res) => {
  try {
    await pool.query('INSERT INTO page_views DEFAULT VALUES');
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM page_views');
    res.status(201).json({ count: result.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

module.exports = router;
