require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

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

// JSON parsing with error handling for circular references and malformed JSON
app.use(express.json({
  limit: '10mb', // Set size limit
  verify: (req, res, buf, encoding) => {
    // Store raw body for debugging if needed
    req.rawBody = buf;
  }
}));

// Handle JSON parsing errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format in request body'
    });
  }
  next(error);
});

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
app.post('/saveJSON', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Debug: log the received data structure
    console.log('=== REQUEST DEBUG ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Filename:', req.body.filename);
    console.log('Data type:', typeof req.body.data);
    console.log('Data keys:', req.body.data ? Object.keys(req.body.data) : 'null');
    if (req.body.data && req.body.data.circular) {
      console.log('Circular reference detected:', typeof req.body.data.circular);
      console.log('Circular === data:', req.body.data.circular === req.body.data);
    }
    console.log('==================');

    // Validate request body
    if (!req.body.filename) {
      return res.status(400).json({
        success: false,
        error: 'Missing filename in request body'
      });
    }
    
    if (!req.body.data) {
      return res.status(400).json({
        success: false,
        error: 'Missing data in request body'
      });
    }
    
    // Check for circular references in the data
    function hasCircularReference(obj, seen = new WeakSet()) {
      if (obj !== null && typeof obj === 'object') {
        if (seen.has(obj)) {
          return true;
        }
        seen.add(obj);
        for (let key in obj) {
          if (hasCircularReference(obj[key], seen)) {
            return true;
          }
        }
      }
      return false;
    }
    
    if (hasCircularReference(req.body.data)) {
      return res.status(500).json({
        success: false,
        error: 'Circular reference detected in data structure'
      });
    }
    
    // Get filename and sanitize it
    const filename = req.body.filename;

    // Security: prevent directory traversal and absolute paths, but allow subdirectories
    if (filename.includes('..') || path.isAbsolute(filename)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename - directory traversal or absolute paths not allowed'
      });
    }

    // Ensure filename has .json extension
    const sanitizedFilename = filename.endsWith('.json') ? filename : `${filename}.json`;

    // Enforce that we are running from the project root directory
    const cwd = process.cwd();
    if (!cwd.endsWith('/COCO')) {
      return res.status(500).json({
        success: false,
        error: 'Server must be started from the project root directory (COCO)'
      });
    }

    // Save directly to the path specified by the client (relative to project root)
    const filePath = path.join(cwd, sanitizedFilename);
    
    // Debug logging
    console.log('=== SAVE DEBUG ===');
    console.log('Filename from request:', filename);
    console.log('Sanitized filename:', sanitizedFilename);
    // Removed undefined isInServerSubdir and mapsDir
    console.log('Final file path:', filePath);
    console.log('Resolved file path:', path.resolve(filePath));
    console.log('Current working directory:', process.cwd());
    console.log('==================');
    
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    fs.mkdirSync(dirPath, { recursive: true });
    
    // Try to serialize the data to detect circular references
    let jsonData;
    try {
      jsonData = JSON.stringify(req.body.data, null, 2);
    } catch (serializationError) {
      console.error('JSON serialization error:', serializationError);
      return res.status(500).json({
        success: false,
        error: `Invalid data structure: ${serializationError.message}`
      });
    }
    
    // Check if payload is too large (simple heuristic: > 10MB)
    if (jsonData.length > 10 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'Payload too large'
      });
    }
    
    // Debug: log what we're actually saving
    console.log('DEBUG: Saving to path:', filePath);
    console.log('DEBUG: JSON data size:', jsonData.length, 'bytes');
    console.log('DEBUG: First few chars of JSON data:', jsonData.substring(0, 200));
    if (req.body.data.children && req.body.data.children.length > 0) {
      console.log('DEBUG: First child percentage:', req.body.data.children[0].percentage);
    }
    
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    console.log('Saved JSON file:', filePath);
    res.status(200).json({
      success: true,
      message: `File ${sanitizedFilename} saved successfully`,
      filepath: filePath
    });
    
  } catch (error) {
    console.error('Error saving JSON file:', error);
    
    // Handle specific error types
    if (error.code === 'ENOENT') {
      res.status(400).json({
        success: false,
        error: 'Directory does not exist and could not be created'
      });
    } else if (error.code === 'EACCES') {
      res.status(400).json({
        success: false,
        error: 'Permission denied writing to file'
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Error saving file: ${error.message}`
      });
    }
  }
});

// History of Modern China route
app.get('/history-of-modern-china', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, '../history-of-modern-china/History of Modern China.html');
  res.sendFile(filePath);
});

// Cold War Dynamics route
app.get('/cold-war', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, '../cold-war-dynamics/Cold War Dynamics.html');
  res.sendFile(filePath);
});

// Serve static files from the history directory for images
app.use('/history-of-modern-china', express.static(path.join(__dirname, '../history-of-modern-china')));

// Serve static files from the cold war directory for images
app.use('/cold-war-dynamics', express.static(path.join(__dirname, '../cold-war-dynamics')));

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
