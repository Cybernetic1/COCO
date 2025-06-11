// Script to add a test project and ensure your user is NOT a member, so it appears as joinable
// Usage: node add-test-project.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('coco.db');

const userEmail = 'generic.intelligence@gmail.com';
const testProjectId = 99999;
const testProjectName = 'Joinable Test Project';
const testProjectDesc = 'This project is for joinable-projects testing.';

// 1. Get user id
// 2. Insert project if not exists
// 3. Remove user from user_projects for this project

db.get('SELECT id FROM users WHERE email = ?', [userEmail], (err, user) => {
  if (err || !user) {
    console.error('User not found:', err || userEmail);
    db.close();
    process.exit(1);
  }
  const userId = user.id;
  console.log("user.id =", user.id);
  db.get('SELECT id FROM projects WHERE id = ?', [testProjectId], (err, row) => {
    if (!row) {
      db.run('INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
        [testProjectId, testProjectName, testProjectDesc], (err) => {
          if (err) console.error('Insert project error:', err);
          else console.log('Inserted test project.');
          removeUserProject();
        });
    } else {
      removeUserProject();
    }
    function removeUserProject() {
      db.run('DELETE FROM user_projects WHERE userId = ? AND projectId = ?',
        [userId, testProjectId], (err) => {
          if (err) console.error('Delete user_project error:', err);
          else console.log('Ensured user is NOT a member of test project.');
          db.close();
        });
    }
  });
});
