const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const projectRoutes = require('./routes/project');
const siteSettingsRoutes = require('./routes/siteSettings');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
// Explicitly allow all methods your frontend uses (GET, POST, PUT, PATCH, DELETE)
// origin: true reflects whatever origin made the request — fine for now since
// frontend (Vercel) and backend (Render) are on different domains.
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/settings', siteSettingsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GS WorkShope backend is running.' });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Connect to DB, then start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});