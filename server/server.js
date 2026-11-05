const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const seedUsers = require('./seed');

const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const selectionRoutes = require('./routes/selection.routes');
const surplusRoutes = require('./routes/surplus.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/selections', selectionRoutes);
app.use('/api/surplus', surplusRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Start server and seed database
const startServer = async () => {
  await connectDB();
  await seedUsers();

  app.listen(PORT, () => {
    console.log(`[Express] Server running on http://localhost:${PORT}`);
  });
};

startServer();
