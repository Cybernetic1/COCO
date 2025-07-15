const sqlite3 = require('sqlite3').verbose();

// Create and configure database
const db = new sqlite3.Database('coco.db');

// Initialize database schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS node_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    projectId INTEGER NOT NULL,
    nodeId TEXT NOT NULL,
    voteIndex INTEGER NOT NULL,
    value REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(projectId) REFERENCES projects(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    googleId TEXT,
    facebookId TEXT,
    email TEXT,
    name TEXT,
    avatar TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    ownerId INTEGER,
    source_filename TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ownerId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_projects (
    userId INTEGER,
    projectId INTEGER,
    role TEXT,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, projectId),
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(projectId) REFERENCES projects(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT,
    user TEXT,
    text TEXT,
    time INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS node_percentages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    projectName TEXT,
    nodeId TEXT,
    childId TEXT,
    percentage REAL,
    graphVersion TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
});

module.exports = db;