require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');

// Import our modules
const db = require('./config/database');
const configurePassport = require('./config/passport');
const authRoutes = require('./routes/auth');
const initializeApiRoutes = require('./routes/api');
const staticHandler = require('./routes/static');

const app = express();

// --- Express session and passport setup ---
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure passport strategies
configurePassport(db);

// Show user info on home page if logged in
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Use routes
app.use('/', authRoutes);
app.use('/api', initializeApiRoutes(db));

// Serve static files from parent directory
app.use(express.static('../'));

// Attach your custom static handler for legacy/project routes
app.use(async (req, res, next) => {
  // Let Express handle /api/*, /auth/*, and all POST requests
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.method !== 'GET') {
    return next();
  }
  // Only handle GET requests not already handled by express.static
  await staticHandler(req, res);
});

// Start the server
const PORT = process.env.PORT || 8383;
app.listen(PORT, () => {
  console.log(`Modular COCO server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
