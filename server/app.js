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

// Add saveJSON route for saving project map JSON files
app.use('/saveJSON', (req, res, next) => {
  if (req.method !== 'POST') {
    return next(); // Only handle POST requests
  }
  
  const fs = require('fs');
  const path = require('path');
  
  // Extract the path after /saveJSON/
  const relativePath = req.url.substring(1); // Remove leading slash
  
  // Security: prevent directory traversal
  if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
    return res.status(400).send('Invalid file path');
  }
  
  // Construct the full file path (relative to project root)
  const filePath = path.join('../', relativePath);
  
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    fs.mkdirSync(dirPath, { recursive: true });
    
    // Write the JSON data to file
    const jsonData = JSON.stringify(req.body, null, 2);
    
    // Debug: log what we're actually saving
    console.log('DEBUG: Saving to path:', filePath);
    console.log('DEBUG: First few chars of JSON data:', jsonData.substring(0, 200));
    if (req.body.children && req.body.children.length > 0) {
      console.log('DEBUG: First child percentage:', req.body.children[0].percentage);
    }
    
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    console.log('Saved JSON file:', filePath);
    res.status(200).send('File saved successfully');
  } catch (error) {
    console.error('Error saving JSON file:', error);
    res.status(500).send('Error saving file: ' + error.message);
  }
});

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
