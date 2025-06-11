// Script to sync the projects table with .json files in projects-data/
// Usage: node sync-projects-table.js

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('coco.db');

const projectsDir = path.join(__dirname, 'projects-data');

fs.readdir(projectsDir, (err, files) => {
  if (err) {
    console.error('Error reading projects-data:', err);
    process.exit(1);
  }
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  let processed = 0;
  if (jsonFiles.length === 0) {
    console.log('No .json files found in projects-data/.');
    process.exit(0);
  }
  // Fetch all existing IDs and source_filenames first
  db.all('SELECT id, source_filename FROM projects', (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      process.exit(1);
    }
    const usedIds = new Set(rows.map(r => r.id));
    const usedFilenames = new Set(rows.map(r => r.source_filename));
    let nextId = Math.max(0, ...Array.from(usedIds)) + 1;
    // Sequentially process jsonFiles
    function processNext(i) {
      if (i >= jsonFiles.length) { db.close(); return; }
      const f = jsonFiles[i];
      if (usedFilenames.has(f)) {
        processNext(i+1);
        return;
      }
      db.run('INSERT INTO projects (id, name, description, source_filename) VALUES (?, ?, ?, ?)',
        [nextId, f.replace('.json',''), `Imported from ${f}`, f],
        (err2) => {
          if (err2) console.error('Insert error:', err2);
          else console.log(`Inserted project ${nextId} (${f})`);
          nextId++;
          processNext(i+1);
        }
      );
    }
    processNext(0);
  });
});
