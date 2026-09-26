function requireApiKey(req, res, next) {
  const providedKey = req.header('x-api-key');

  if (!process.env.ADMIN_API_KEY) {
    console.error('ADMIN_API_KEY is not set in .env — refusing all write requests');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (!providedKey || providedKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

module.exports = requireApiKey;
