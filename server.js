// Simple server based on Node.js
// ==============================

require('dotenv').config();

const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const process = require('process');
const { exec } = require("child_process");
const { readdir } = require("fs/promises");
const bcrypt = require('bcrypt');

// --- Authentication dependencies ---
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// Add at the very top, before any use of app
const express = require('express');
const app = express();

// --- Express session and passport setup ---
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json()); // <-- Add this line before any routes

// --- Local strategy (email/password) ---
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      // Compare hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        return isMatch ? done(null, user) : done(null, false);
      });
    });
  }
));

// --- Google OAuth ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
  db.get('SELECT * FROM users WHERE googleId = ?', [profile.id], (err, user) => {
    if (err) return done(err);
    if (!user) {
      db.run('INSERT INTO users (googleId, name, avatar, email) VALUES (?, ?, ?, ?)',
        [profile.id, profile.displayName, profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null, email],
        function(err) {
          if (err) return done(err);
          db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
            if (err) return done(err);
            return done(null, newUser);
          });
        }
      );
    } else {
      db.run('UPDATE users SET name = ?, avatar = ?, email = ? WHERE id = ?',
        [profile.displayName, profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null, email, user.id],
        (err) => {
          if (err) return done(err);
          db.get('SELECT * FROM users WHERE id = ?', [user.id], (err, updatedUser) => {
            if (err) return done(err);
            return done(null, updatedUser);
          });
        }
      );
    }
  });
}));

// --- Facebook OAuth ---
passport.use(new FacebookStrategy({
  clientID: 'FACEBOOK_APP_ID',
  clientSecret: 'FACEBOOK_APP_SECRET',
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email'] // Request profile photo
}, (accessToken, refreshToken, profile, done) => {
  db.get('SELECT * FROM users WHERE facebookId = ?', [profile.id], (err, user) => {
    if (err) return done(err);
    const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
    if (!user) {
      db.run('INSERT INTO users (facebookId, name, avatar) VALUES (?, ?, ?)',
        [profile.id, profile.displayName, avatarUrl],
        function(err) {
          if (err) return done(err);
          db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
            if (err) return done(err);
            return done(null, newUser);
          });
        }
      );
    } else {
      db.run('UPDATE users SET name = ?, avatar = ? WHERE id = ?',
        [profile.displayName, avatarUrl, user.id],
        (err) => {
          if (err) return done(err);
          db.get('SELECT * FROM users WHERE id = ?', [user.id], (err, updatedUser) => {
            if (err) return done(err);
            return done(null, updatedUser);
          });
        }
      );
    }
  });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// --- Auth routes ---
app.post('/login', passport.authenticate('local', {
  successRedirect: '/my-projects.html',
  failureRedirect: '/login'
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/my-projects.html',
  failureRedirect: '/login'
}));

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/my-projects.html',
  failureRedirect: '/login'
}));

// --- Show user info on home page if logged in ---
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// --- API: Get user info for frontend ---
app.get('/user-info', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      loggedIn: true,
      name: req.user.name,
      avatar: req.user.avatar
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// --- Log out route ---
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

async function reqHandler(req, res) {

	var fileName = decodeURIComponent(req.url);
	if (fileName === "/")
		fileName = "/index.html";

	// **** Save a JSON file
	if (fileName.startsWith("/saveJSON/")) {
		var fname = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			'Content-Type': 'text/event-stream; charset=utf-8',
			});

		const buffer = [];
		req.on('data', chunk => buffer.push(chunk));
		req.on('end', () => {
			const data = Buffer.concat(buffer);

			// Save to file
			var fs = require('fs');
			var stream = fs.createWriteStream("./projects-data/" + fname, {encoding: 'utf8'});
			stream.once('open', function(fd) {
				stream.write(data);
				stream.end();
				});
			console.log("Saved JSON file:", fname);
			// console.log("log data: " + data);
			// console.log(unescape(encodeURIComponent(data)));
			});
		res.end();
		return;
		}

	// **** load a JSON file
	if (fileName.startsWith("/loadJSON/")) {
		var fname = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			"Content-Type"	: "application/json",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		fs.readFile("projects-data/" + fname, "utf-8", function (err, data) {
			if (err) {
				console.log(err);
				return err;
				}
			res.end(data, "utf-8");
			console.log("Loaded JSON file:", fname);
			});
		return;
		}

	// **** save a project as a dir-structure, from project graph JSON
	if (fileName.startsWith("/saveDir/")) {
		var rootDirName = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			'Content-Type': 'text/event-stream; charset=utf-8',
			});

		const buffer = [];
		req.on('data', chunk => buffer.push(chunk));
		req.on('end', () => {
			data = JSON.parse(Buffer.concat(buffer));

			// Save to dir -- it should be the same dir every time
			// as there may be other project files in the dirs
			// 1. if root-dir not exist create it:
			if (!fs.existsSync(rootDirName)) {
				fs.mkdirSync(rootDirName);
				}

			// 2. for each node, if not exists create sub-dir
			data.nodes.forEach( node => {
				const subDirName = rootDirName + '/' + node.id.toString();
				if (!fs.existsSync(subDirName)) {
					fs.mkdirSync(subDirName);
					}

				// 3. write node details to "node-data.txt"
				var stream = fs.createWriteStream(`${subDirName}/node-data.txt`, {encoding: 'utf8'});
				stream.once('open', function(fd) {
					// pretty JSON spacing level = 2
					stream.write(JSON.stringify(node, null, 2));
					stream.end();
					});

				} );

			// 4. write edges to "edges-data.json"
			var stream = fs.createWriteStream(`${rootDirName}/edges-data.json`, {encoding: 'utf8'});
			stream.once('open', function(fd) {
				// JSON spacing level = 1
				stream.write(JSON.stringify(data.edges, null, 1));
				stream.end();
				});

			console.log("Saved project graph to directory:", rootDirName);
			});
		res.end();
		return;
		}

	// **** read a project dir and return as JSON file
	// must use synchronous read
	if (fileName.startsWith("/loadDir/")) {
		var rootDirName = path.basename(url.parse(req.url).pathname);

		res.writeHead(200, {
			"Content-Type"	: "application/json",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		var data = {};
		data.nodes = [];

		// **** Read all nodes from directory and create data.nodes object
		// 1. read root-node file "node-data.txt" and fill in details
		function get1Node(subdir) {
			const details = fs.readFileSync(`${rootDirName}/${subdir}/node-data.txt`, "utf-8");
			const node = JSON.parse(details);
			data.nodes.push(node);
			}

		// 2. for each sub-dir, do the same:
		fs.readdirSync( rootDirName, { withFileTypes: true } )
			.filter(dirent => dirent.isDirectory())
			.map(dirent => get1Node(dirent.name));	// recurse ∀ sub-dirs

		// 3. read edges data file and fill in details
		const edges = fs.readFileSync(`${rootDirName}/edges-data.json`, "utf-8");
		data.edges = JSON.parse(edges);
		
		res.end(JSON.stringify(data), "utf-8");
		console.log("Loaded dir as JSON");
		return;
		}

	// **** Return a list of files in directory
	if (fileName.startsWith("/fileList/")) {
		fs.readdir("./projects-data/", (err, files) => {
			if (err) {
				console.log(err);
				return err;
				}
			console.log("JSON files list =", typeof(files), files);
			res.writeHead(200, {"Content-Type": "application/json"});
			res.end(JSON.stringify(files), "utf-8");
			});
		return;
		}

	// **** Return a list of project directories
	if (fileName.startsWith("/dirList/")) {
		var dirs = (await readdir("./", { withFileTypes: true }))
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
			.filter(name => name.endsWith(".data"))
		console.log("Dir list =", dirs);
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify(dirs), "utf-8");
		return;
		}

	// **** Return list of authers in a Git repository
	if (fileName.startsWith("/getGitAuthors/")) {
		res.writeHead(200, {
			"Content-Type"	: "text/event-stream; charset=utf-8",
			"Cache-Control"	: "no-cache",
			"Connection"	: "keep-alive"
			});

		const { exec } = require("child_process");

		// git: %an = author name, %ae = author email, %s = commit subject
		exec("git log --pretty='%ae,%an'", (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			res.end(stdout, "utf-8");
			console.log("Extracted Git authors.");
		});
		return;
		}

	// ************* Process the reading of various file types ****************

	fileName = "./" + fileName;

	fileTypes = {
		".html" : ["text/html"				, "utf-8"],
		".css"	: ["text/css"				, "utf-8"],
		".js"   : ["application/javascript" , "utf-8"],
		".map"	: ["application/javascript" , "utf-8"],
		".json" : ["application/json"		, "utf-8"],
		".ogg"  : ["audio/ogg"				, "base64"],
		".wav"  : ["audio/wav"				, "base64"],
		".ico"  : ["image/x-icon"			, "base64"],
		".jpg"  : ["image/jpg"				, "base64"],
		".png"  : ["image/png"				, "base64"],
		".gif"  : ["image/gif"				, "base64"],
		};

	// Remove the cache-preventer suffix that begins with a '?'
	fileName = fileName.split('?')[0];
	// console.log("filename =", fileName);
	var ext = path.extname(fileName);
	if (ext in fileTypes) {
		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, fileTypes[ext][1], function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, {"Content-Type": fileTypes[ext][0]});
						res.end(content, fileTypes[ext][1]);
						}
					});
			} else {
				res.writeHead(404);
				res.end();
				}
			});
		return; }

	// All failed:
	res.writeHead(404);
	res.end();
	}

// Serve static files from the current directory
app.use(express.static(__dirname));

// Attach your custom reqHandler for legacy/project routes
app.use(async (req, res, next) => {
  // Let Express handle /api/* and /auth/* routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
    return next();
  }
  // Only handle requests not already handled by express.static
  await reqHandler(req, res);
});

// --- SQLite setup ---
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('coco.db');

db.serialize(() => {
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
});

// Determine if server is local or remote
const os = require("os");
var address = "127.0.0.1";
if (os.hostname() == 'VM-12-17-centos')		// Sherry's brother's hostname
	address = "0.0.0.0";

app.listen(8383, address, () => {
	console.log('Server running at', address + ':8383');
	} );

if (address == "127.0.0.1") {
	// Beep sound to signify local server is being started
	var shell = require('child_process').exec;
	shell("beep", function(err, stdout, stderr) {});
}

/*
// Clean filename of any unwanted chars
// allowing Chinese chars etc to remain
// (This function is unused and has buggy RegEx syntax)
function clean_name(name) {
	const regex = RegExp('[/\\?%*:|\"<>\x7F\x00-\x1F]', 'g');
	var result = "";
		for (let ch of name) {
			if (regex.exec(ch)[0] == null)
				result += ch;
			else
				result += '%' + ('0' + ch.charCodeAt(0).toString(16).toUpperCase()).slice(-2);
	return result;
	}
*/

// --- API: List joinable projects (not already joined by user) ---
app.get('/api/joinable-projects', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  db.all(`SELECT id, name, description FROM projects WHERE id NOT IN (SELECT projectId FROM user_projects WHERE userId = ?)`, [req.user.id], (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// --- API: Get project details (for editing) ---
app.get('/api/project-details', (req, res) => {
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
app.post('/api/update-project', (req, res) => {
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

// --- API: Join a project ---
app.post('/api/join-project', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = parseInt(req.body.projectId, 10);
  const role = req.body.role || 'member'; // Default role is 'member'
  if (!projectId) {
    return res.status(400).json({ error: 'Missing or invalid project ID' });
  }
  // Defensive: check if req.body exists and has projectId
  if (!req.body || typeof req.body.projectId === 'undefined') {
    return res.status(400).json({ error: 'Missing project ID in request body' });
  }
  db.run(`INSERT INTO user_projects (userId, projectId, role) VALUES (?, ?, ?)`, [req.user.id, projectId, role], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// --- API: Leave a project ---
app.post('/api/leave-project', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ error: 'Missing project ID' });
  }
  db.run(`DELETE FROM user_projects WHERE userId = ? AND projectId = ?`, [req.user.id, projectId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// --- API: Get user projects ---
app.get('/api/user-projects', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  db.all(`SELECT p.id, p.name, p.description, up.role FROM projects p
          JOIN user_projects up ON p.id = up.projectId
          WHERE up.userId = ?`, [req.user.id], (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(projects);
  });
});

// --- API: Get project members ---
app.get('/api/project-members', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = req.query.id;
  if (!projectId) {
    return res.status(400).json({ error: 'Missing project ID' });
  }
  db.all(`SELECT u.id, u.name, u.avatar, up.role FROM users u
          JOIN user_projects up ON u.id = up.userId
          WHERE up.projectId = ?`, [projectId], (err, members) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(members);
  });
});

// --- API: Invite user to project ---
app.post('/api/invite-user', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = req.body.projectId;
  const email = req.body.email;
  if (!projectId || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  // Find user by email
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Insert into user_projects
    db.run(`INSERT INTO user_projects (userId, projectId, role) VALUES (?, ?, ?)`, [user.id, projectId, 'member'], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    });
  });
});

// --- API: Remove user from project ---
app.post('/api/remove-user', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const projectId = req.body.projectId;
  const userId = req.body.userId;
  if (!projectId || !userId) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.run(`DELETE FROM user_projects WHERE projectId = ? AND userId = ?`, [projectId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// --- Signup route ---
app.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }
  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).send('Database error.');
    if (user) return res.status(409).send('Email already registered.');
    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).send('Error hashing password.');
      db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hash, name || null], function(err) {
        if (err) return res.status(500).send('Database error.');
        // Optionally auto-login after signup
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
          if (err) return res.status(500).send('Database error.');
          req.login(newUser, (err) => {
            if (err) return res.status(500).send('Login error.');
            return res.redirect('/my-projects.html');
          });
        });
      });
    });
  });
});
