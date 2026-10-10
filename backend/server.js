require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const contactRoutes = require('./routes/contact');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json({ limit: '10kb' })); // small limit — this API only ever needs a short form payload
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  }),
);

// --- API routes ---
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- Serve the frontend directly from the sibling ../frontend folder ---
// This means you can run ONLY the backend (npm start inside /backend) and open
// http://localhost:5000 to see the whole site — no separate Live Server needed.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- 404 handler for unmatched API routes ---
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'Not found.' });
});

// --- Central error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
});
