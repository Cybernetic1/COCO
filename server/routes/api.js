const express = require('express');
const router = express.Router();

// This will be passed from app.js
let db;

function initializeApiRoutes(database) {
  db = database;
  return router;
}

// --- API: Get all users (for author selection) ---
router.get('/users', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  db.all('SELECT id, name, email, avatar FROM users ORDER BY name, email', (err, rows) => {
    if (err) {
      console.error('Error loading users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// --- API: Page chat (persistent, per-page) ---
router.get('/chat', (req, res) => {
  const room = req.query.room;
  if (!room) return res.status(400).json({ error: 'Missing room' });
  db.all('SELECT user, text, time, deleted FROM chat_messages WHERE room = ? ORDER BY time ASC LIMIT 100', [room], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ messages: rows });
  });
});

router.post('/chat', (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: 'Not authenticated' });
  const room = req.query.room;
  const text = req.body.text && req.body.text.trim();
  if (!room || !text) return res.status(400).json({ error: 'Missing room or text' });
  const user = req.user.name || req.user.email || 'User';
  const time = Date.now();
  db.run('INSERT INTO chat_messages (room, user, text, time, deleted) VALUES (?, ?, ?, ?, 0)', [room, user, text, time], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// --- API: Soft-delete a chat message (mark as deleted, do not remove) ---
router.post('/chat/delete', (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { room, time, user, text } = req.body;
  console.log('[DEBUG] /chat/delete body:', req.body);
  if (!room || !time || !user || !text) {
    console.log('[DEBUG] /chat/delete missing fields:', { room, time, user, text });
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'UPDATE chat_messages SET deleted = 1 WHERE room = ? AND time = ? AND user = ? AND text = ?',
    [room, time, user, text],
    function(err) {
      if (err) {
        console.error('[DEBUG] /chat/delete DB error:', err);
        return res.status(500).json({ error: 'DB error' });
      }
      console.log('[DEBUG] /chat/delete changes:', this.changes);
      if (this.changes === 0) {
        console.log('[DEBUG] /chat/delete message not found:', { room, time, user, text });
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json({ success: true });
    }
  );
});

// --- API: List joinable projects (not already joined by user) ---
router.get('/joinable-projects', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  db.all(`SELECT id, name, description FROM projects WHERE id NOT IN (SELECT projectId FROM user_projects WHERE userId = ?)`, [req.user.id], (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// --- API: Join a project ---
router.post('/join-project', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!req.body || typeof req.body.projectId === 'undefined') {
    return res.status(400).json({ error: 'Missing project ID in request body' });
  }
  const projectId = parseInt(req.body.projectId, 10);
  const role = req.body.role || 'member'; // Default role is 'member'
  if (!projectId) {
    return res.status(400).json({ error: 'Missing or invalid project ID' });
  }
  db.run(
    `INSERT INTO user_projects (userId, projectId, role) VALUES (?, ?, ?)`,
    [req.user.id, projectId, role],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// --- API: Get user's projects ---
router.get('/user-projects', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = req.user.id;
  
  db.all(`
    SELECT p.id, p.name, p.description, p.createdAt, up.role
    FROM projects p
    JOIN user_projects up ON p.id = up.projectId
    WHERE up.userId = ?
    ORDER BY p.createdAt DESC
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Error loading user projects:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows || []);
  });
});

// --- API: Get project details (for editing) ---
router.get('/project-details', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = req.query.id;
  if (!projectId) {
    return res.status(400).json({ error: 'Missing project ID' });
  }
  db.get(`SELECT * FROM projects WHERE id = ?`, [projectId], (err, project) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  });
});

// --- API: Update project details ---
router.post('/update-project', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = req.body.id;
  const { name, description } = req.body;
  if (!projectId || !name || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.run(`UPDATE projects SET name = ?, description = ? WHERE id = ?`, [name, description, projectId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// --- API: Create a new project ---
router.post('/projects', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { name, description, sourceFilename } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }
  
  const projectDescription = description || '';
  const ownerId = req.user.id;
  
  db.run(`INSERT INTO projects (name, description, ownerId, source_filename) VALUES (?, ?, ?, ?)`, 
    [name, projectDescription, ownerId, sourceFilename], function(err) {
    if (err) {
      console.error('Error creating project:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const projectId = this.lastID;
    
    // Automatically add the creator as owner/admin of the project
    db.run(`INSERT INTO user_projects (userId, projectId, role) VALUES (?, ?, ?)`, 
      [ownerId, projectId, 'owner'], function(err) {
      if (err) {
        console.error('Error adding user to project:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        id: projectId,
        name: name,
        description: projectDescription 
      });
    });
  });
});

// --- API: Percentage Management ---

// Save percentages for a specific node
router.post('/percentages', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { projectName, nodeId, childPercentages, graphVersion } = req.body;
  const userId = req.user.id;
  
  if (!projectName || !nodeId || !childPercentages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Delete existing percentages for this node
  db.run('DELETE FROM node_percentages WHERE userId = ? AND projectName = ? AND nodeId = ?', 
    [userId, projectName, nodeId], function(deleteErr) {
    if (deleteErr) {
      console.error('Error deleting old percentages:', deleteErr);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Insert new percentages
    const stmt = db.prepare(`INSERT INTO node_percentages 
      (userId, projectName, nodeId, childId, percentage, graphVersion, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`);
    
    let insertErrors = 0;
    let inserted = 0;
    
    childPercentages.forEach(child => {
      stmt.run([userId, projectName, nodeId, child.childId, child.percentage, graphVersion], function(err) {
        if (err) {
          console.error('Error inserting percentage:', err);
          insertErrors++;
        } else {
          inserted++;
        }
        
        // Check if all inserts are complete
        if (inserted + insertErrors === childPercentages.length) {
          stmt.finalize();
          if (insertErrors > 0) {
            return res.status(500).json({ error: 'Some percentages failed to save' });
          }
          res.json({ success: true });
        }
      });
    });
  });
});

// Load percentages for a specific node
router.get('/percentages', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { projectName, nodeId } = req.query;
  const userId = req.user.id;
  
  if (!projectName || !nodeId) {
    return res.status(400).json({ error: 'Missing projectName or nodeId' });
  }
  
  db.all(`SELECT childId, percentage, graphVersion, updatedAt 
          FROM node_percentages 
          WHERE userId = ? AND projectName = ? AND nodeId = ?
          ORDER BY updatedAt DESC`, 
    [userId, projectName, nodeId], (err, rows) => {
    if (err) {
      console.error('Error loading percentages:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!rows || rows.length === 0) {
      return res.json({ found: false, childPercentages: [] });
    }
    
    // Group by childId and take the most recent for each
    const percentageMap = new Map();
    rows.forEach(row => {
      if (!percentageMap.has(row.childId)) {
        percentageMap.set(row.childId, ({
          childId: row.childId,
          percentage: row.percentage
        }));
      }
    });
    
    res.json({
      found: true,
      childPercentages: Array.from(percentageMap.values()),
      graphVersion: rows[0].graphVersion
    });
  });
});

// Get all percentages for a project (for syncing)
router.get('/percentages/all', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { projectName } = req.query;
  const userId = req.user.id;
  
  if (!projectName) {
    return res.status(400).json({ error: 'Missing projectName' });
  }
  
  db.all(`SELECT nodeId, childId, percentage, graphVersion, updatedAt 
          FROM node_percentages 
          WHERE userId = ? AND projectName = ?
          ORDER BY nodeId, updatedAt DESC`, 
    [userId, projectName], (err, rows) => {
    if (err) {
      console.error('Error loading all percentages:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Group by nodeId and childId, take the most recent for each
    const percentages = {};
    
    rows.forEach(row => {
      const key = `${row.nodeId}-${row.childId}`;
      if (!percentages[key] || row.updatedAt > percentages[key].updatedAt) {
        percentages[key] = row;
      }
    });
    
    // Convert back to array
    res.json({ percentages: Object.values(percentages) });
  });
});

// --- API: Save node votes ---
router.post('/save-votes', (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { projectId, nodeId, votes } = req.body;
  const userId = req.user.id;
  if (!projectId || !nodeId || !Array.isArray(votes)) {
    return res.status(400).json({ error: 'Missing projectId, nodeId, or votes array' });
  }
  // Remove existing votes for this user/project/node
  db.run('DELETE FROM node_votes WHERE userId = ? AND projectId = ? AND nodeId = ?', [userId, projectId, nodeId], function(err) {
    if (err) {
      console.error('Error deleting old votes:', err);
      return res.status(500).json({ error: 'Database error (delete)' });
    }
    // Insert new votes
    const stmt = db.prepare('INSERT INTO node_votes (userId, projectId, nodeId, voteIndex, value) VALUES (?, ?, ?, ?, ?)');
    votes.forEach((value, idx) => {
      stmt.run(userId, projectId, nodeId, idx, value);
    });
    stmt.finalize((err) => {
      if (err) {
        console.error('Error saving votes:', err);
        return res.status(500).json({ error: 'Database error (insert)' });
      }
      res.json({ success: true });
    });
    return;
  });
});

// --- API: Load node votes for current user ---
router.get('/load-votes', (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { projectId, nodeId } = req.query;
  const userId = req.user.id;
  if (!projectId || !nodeId) {
    return res.status(400).json({ error: 'Missing projectId or nodeId' });
  }
  db.all('SELECT voteIndex, value FROM node_votes WHERE userId = ? AND projectId = ? AND nodeId = ? ORDER BY voteIndex ASC', [userId, projectId, nodeId], (err, rows) => {
    if (err) {
      console.error('Error loading votes:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    // Return as array, filling missing indices with 0
    let votes = [];
    rows.forEach(row => { votes[row.voteIndex] = row.value; });
    res.json({ votes });
  });
});

module.exports = initializeApiRoutes;