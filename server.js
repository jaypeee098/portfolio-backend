require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const projectsRouter = require('./routes/projects');

const app = express();

app.use(cors());
app.use(express.json());

// Health check — confirms server + DB are both alive
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/projects', projectsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
