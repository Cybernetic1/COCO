require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');

// Import our modules
const db = require('./config/database');
const configurePassport = require('./config/passport');
const authRoutes = require('./routes/auth');

const app = express();

// --- Express session and passport setup ---
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure passport strategies
configurePassport(db);

// Use routes
app.use('/', authRoutes);

// Serve static files from parent directory
app.use(express.static('../'));

// For now, let's add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Modular server is working!', authenticated: req.isAuthenticated() });
});

// Start the server
const PORT = process.env.PORT || 8383;
app.listen(PORT, () => {
  console.log(`Modular server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;