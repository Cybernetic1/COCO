// New project-graph.js (tree version, clean slate)
// This file is for the new, more readable and intuitive tree-based project graph UI.
// - Enforces a tree structure (one parent per node, except root)
// - No Vis.js dependency by default (add if needed)
// - Right-click on a node brings up a modal for editing

// Example: minimal map data
const mapData = {
  id: 0,
  label: 'Root',
  children: [
    { id: 1, label: 'Node 1', children: [] },
    { id: 2, label: 'Node 2', children: [] }
  ]
};

// --- Language switching logic ---
let currentLanguage = 'EN';
function switchLang() {
  currentLanguage = (currentLanguage === 'EN') ? 'ZH' : 'EN';
  renderCurrentMap();
}

// Render map (tree structure)
function getYellowShade(level) {
  // Returns a yellow shade: level 0 is lightest, deeper levels are darker
  // HSL: h=48 (yellow), s=100%, l from 95% (root) to 80% (level 5+)
  const lightness = Math.max(95 - level * 3, 80);
  return `hsl(48, 100%, ${lightness}%)`;
}

function renderMap(container, node, depth = 0) {
  const el = document.createElement('div');
  el.className = 'map-node';
  el.style.background = getYellowShade(depth);
  // Show only one language label at a time
  let label = '';
  if (currentLanguage === 'ZH' && node.labelZH) label = node.labelZH;
  else if (node.labelEN) label = node.labelEN;
  else label = node.label || '';
  el.textContent = label;
  el.dataset.nodeId = node.id;
  el.oncontextmenu = function(e) {
    e.preventDefault();
    showNodeModal(node);
  };
  el.onclick = function(e) {
    // Only respond to left-click, not right-click
    if (e.button === 0) {
      const nodeTitle = label || 'Node';
      // For demo, use node fields if present
      const labelEN = node.labelEN || node.label || '';
      const labelZH = node.labelZH || '';
      const status = node.status || '';
      const details = node.details || '';
      const authors = node.authors ? node.authors.join(', ') : '';
      const html = `<!DOCTYPE html><html lang='en'><head><title>${nodeTitle}</title>
        <meta charset='UTF-8'>
        <link rel="stylesheet" href="/css/style.css">
        <style>
          body { font-family: sans-serif; background: #fff8e1; margin:0; padding:2em; }
          .node-details-pane { background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #f9e6b3; padding: 2em; max-width: 420px; margin: 2em auto; border: 2px solid #b77c00; }
          .node-details-pane label { font-weight: bold; color: #7c4c00; }
          .node-details-pane input, .node-details-pane textarea { width: 95%; margin-bottom: 1em; padding: 0.4em; border-radius: 6px; border: 1px solid #b77c00; }
          .node-details-pane textarea { min-height: 6em; }
          .status-group { margin-bottom: 1em; }
          .status-group label { font-weight: normal; margin-right: 1em; }
        </style>
      </head><body>
        <div class='node-details-pane'>
          <h2 style='color:#7c4c00;'>Node Details</h2>
          <div class='status-group'>
            <label>Status:</label><br>
            <input type='radio' id='in-progress' name='status' value='in-progress' ${status==='in-progress'?'checked':''}> <label for='in-progress'>In Progress</label>
            <input type='radio' id='finished' name='status' value='finished' ${status==='finished'?'checked':''}> <label for='finished'>Finished</label>
            <input type='radio' id='paused' name='status' value='paused' ${status==='paused'?'checked':''}> <label for='paused'>Paused</label>
            <input type='radio' id='research' name='status' value='research' ${status==='research'?'checked':''}> <label for='research'>Research</label>
          </div>
          <div lang='ZH'>
            <label>工作名称（中文）：</label><br>
            <input type='text' id='TaskNameZH' value='${labelZH}'>
          </div>
          <label>Task name (English):</label><br>
          <input type='text' id='TaskNameEN' value='${labelEN}'><br>
          <label>Details:</label><br>
          <textarea id='Details'>${details}</textarea><br>
          <label>Authors:</label><br>
          <input type='text' id='Authors' value='${authors}'><br>
        </div>
      </body></html>`;
      const newWin = window.open('', '_blank');
      if (newWin) {
        newWin.document.write(html);
        newWin.document.close();
      }
    }
  };
  if (node.children && node.children.length) {
    const children = document.createElement('div');
    children.className = 'map-children';
    node.children.forEach(child => children.appendChild(renderMap(container, child, depth + 1)));
    el.appendChild(children);
  }
  return el;
}

// --- Helper to re-render the current map ---
function renderCurrentMap() {
  if (!window.currentMapRoot) return;
  const container = document.getElementById('map-container');
  container.innerHTML = '';
  container.appendChild(renderMap(container, window.currentMapRoot, 0));
}

function showNodeModal(node) {
  const modal = document.getElementById('node-modal');
  document.getElementById('modal-node-label').value = node.label;
  modal.style.display = 'block';
  modal.dataset.nodeId = node.id;
  document.getElementById('modal-overlay').style.display = 'block';
}

function hideNodeModal() {
  document.getElementById('node-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

// --- Read JSON map logic ---
function readJSONMap() {
  // Prompt for file (simple file input dialog)
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  // Suggest project-trees/ as the default directory if possible (browser limitation)
  // User must select from project-trees/ manually
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const json = JSON.parse(e.target.result);
        // Accepts format: { nodes: [...], edges: [...], links: [...] }
        // Convert to treeData structure
        const idToNode = {};
        json.nodes.forEach(n => {
          idToNode[n.id] = { ...n, children: [] };
        });
        // Add tree edges (ignore red edges/links)
        if (json.edges) {
          json.edges.forEach(e => {
            if (idToNode[e.from] && idToNode[e.to]) {
              idToNode[e.to].children.push(idToNode[e.from]);
            }
          });
        }
        // Find root (node with no parent)
        const childIds = new Set();
        if (json.edges) json.edges.forEach(e => childIds.add(e.from));
        let root = null;
        for (const n of json.nodes) {
          if (!childIds.has(n.id)) {
            root = idToNode[n.id];
            break;
          }
        }
        if (!root) root = idToNode[0] || json.nodes[0];
        window.currentMapRoot = root;
        renderCurrentMap();
      } catch (err) {
        alert('Invalid JSON map file!');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
// --- Save JSON map logic ---
function saveJSONMap(mapObj, filename = 'project-map.json') {
  // Save to project-trees/ directory by default (user will be prompted for location)
  const jsonStr = JSON.stringify(mapObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, 0);
}

// --- Save JSON map to server-side project-maps/ directory ---
function saveJSONMapServer() {
  // Prompt for filename
  const filename = prompt('Enter filename for the map (without .json):', 'project-map');
  if (!filename) return;
  // Gather tree data (assume global treeData or build from UI)
  // If you have a global treeData, use it. Otherwise, you may need to serialize from UI.
  let mapObj = window.currentMapRoot;
  if (!mapObj) {
    alert('No map data found!');
    return;
  }
  // Convert tree to flat nodes/edges/links format
  const nodes = [];
  const edges = [];
  function traverse(node, parentId) {
    nodes.push({ ...node, children: undefined });
    if (parentId !== null) {
      edges.push({ from: node.id, to: parentId });
    }
    if (node.children) {
      node.children.forEach(child => traverse(child, node.id));
    }
  }
  traverse(mapObj, null);
  const exportObj = { nodes, edges, links: [] };
  const jsonStr = JSON.stringify(exportObj, null, 2);
  // Send to server
  fetch(`/saveJSON/project-maps/${encodeURIComponent(filename)}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonStr
  })
    .then(r => r.ok ? alert('Saved to server!') : r.text().then(t => alert('Error: ' + t)))
    .catch(e => alert('Network error: ' + e));
}

// --- Chat logic ---
const chatContainer = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// Use page path as chat room id
const chatPageId = location.pathname + location.search;

async function fetchChatMessages() {
  const res = await fetch(`/api/chat?room=${encodeURIComponent(chatPageId)}`);
  if (!res.ok) return;
  const data = await res.json();
  chatContainer.innerHTML = '';
  data.messages.forEach(msg => {
    const div = document.createElement('div');
    div.style.marginBottom = '0.4em';
    div.innerHTML = `<b style='color:#7c4c00;'>${msg.user}</b>: <span>${escapeHtml(msg.text)}</span> <span style='color:#aaa;font-size:0.9em;'>${formatTime(msg.time)}</span>`;
    chatContainer.appendChild(div);
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(tag) {
    const chars = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'};
    return chars[tag] || tag;
  });
}
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}

chatForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  await fetch(`/api/chat?room=${encodeURIComponent(chatPageId)}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ text })
  });
  fetchChatMessages();
});

// Poll for new messages every 5 seconds
setInterval(fetchChatMessages, 5000);
fetchChatMessages();

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('map-container');
  container.innerHTML = '';
  container.appendChild(renderMap(container, mapData));
  document.getElementById('modal-cancel-btn').onclick = hideNodeModal;
  document.getElementById('modal-save-btn').onclick = function() {
    // Save logic here (update label, etc.)
    hideNodeModal();
    renderCurrentMap();
  };
  document.getElementById('modal-overlay').onclick = hideNodeModal;
});
