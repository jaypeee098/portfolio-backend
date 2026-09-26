const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireApiKey=require('../middleware/requireApiKey');

// GET all projects (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST create new project
router.post('/', requireApiKey, async (req, res) => {
  try {
    const { title, description, image_url, tech_stack, github_link, live_link, featured } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const result = await pool.query(
      `INSERT INTO projects (title, description, image_url, tech_stack, github_link, live_link, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, image_url, tech_stack, github_link, live_link, featured || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT update project
router.put('/:id', requireApiKey,  async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, tech_stack, github_link, live_link, featured } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET title = $1, description = $2, image_url = $3, tech_stack = $4,
           github_link = $5, live_link = $6, featured = $7
       WHERE id = $8
       RETURNING *`,
      [title, description, image_url, tech_stack, github_link, live_link, featured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project
router.delete('/:id', requireApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted', project: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
