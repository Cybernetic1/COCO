// New project-graph.js (tree version, clean slate)
// This file is for the new, more readable and intuitive tree-based project graph UI.
// - Enforces a tree structure (one parent per node, except root)
// - No Vis.js dependency by default (add if needed)
// - Right-click on a node brings up a modal for editing

// Example: minimal map data
let projectMapRoot = {
  id: 0,
  label: 'Root',
  percentage: 100,
  children: [
    { id: 1, label: 'Node 1', percentage: 0, children: [] },
    { id: 2, label: 'Node 2', percentage: 0, children: [] }
  ]
};

// Try to load projectMapRoot from localStorage on page load
if (localStorage.getItem('projectMapRoot')) {
  try {
    const loaded = JSON.parse(localStorage.getItem('projectMapRoot'));
    if (loaded && typeof loaded === 'object') {
      projectMapRoot = loaded;
      projectName = projectMapRoot.labelEN || projectMapRoot.label || 'project-map';
      window.projectMapRoot = projectMapRoot; // update global for debugging
    }
  } catch (e) {
    console.warn('Could not parse projectMapRoot from localStorage:', e);
  }
}

let selected_node = null; // Track selected node
let currentLanguage = 'EN';
let projectName = projectMapRoot.label || projectMapRoot.labelEN || '';

// Make projectMapRoot available on window for debugging
window.projectMapRoot = projectMapRoot;

document.title = `${projectName}`;
document.getElementsByTagName('h1')[0].innerHTML = document.title;

// Sound files (uncomment to use)
// const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');
// const techFail = new Audio('sounds/tech-fail.wav');

function switchLang() {
  currentLanguage = (currentLanguage === 'EN') ? 'ZH' : 'EN';
  renderCurrentMap();
  techClick2.play();
}

function getYellowShade(level) {
  // Returns a yellow shade: level 0 is lightest, deeper levels are darker
  // HSL: h=48 (yellow), s=100%, l from 95% (root) to 60% (level 5+)
  const lightness = Math.max(95 - level * 10, 50);
  return `hsl(48, 100%, ${lightness}%)`;
}

function renderMap(node, depth = 0) {
	const el = document.createElement('div');
	el.className = 'map-node';
	el.style.background = getYellowShade(depth);
	// Highlight if selected (compare by id)
	if (selected_node && selected_node.id === node.id) {
		el.style.border = '4px solid #f00';
		el.style.background = '#fee';
	}
	// Show only one language label at a time
	let label = '';
	if (currentLanguage === 'ZH' && node.labelZH)
		label = node.labelZH;
	else if (node.labelEN)
		label = node.labelEN;
	else label = node.label || '';

	// Create a node as a container
	const labelDiv = document.createElement('div');
	labelDiv.textContent = label;
	labelDiv.style.display = 'block';
	labelDiv.style.marginBottom = '2px';
	labelDiv.style.paddingRight = '28px'; // Prevent label from overspilling menuBtn
	labelDiv.style.wordBreak = 'break-word'; // Allow wrapping
	el.appendChild(labelDiv);

	// Add dropdown menu button
	const menuBtn = document.createElement('button');
	menuBtn.textContent = '☰';
	menuBtn.title = 'Node options';
	menuBtn.style.position = 'absolute';
	menuBtn.style.top = '4px';
	menuBtn.style.right = '6px';
	menuBtn.style.color = 'brown';
	menuBtn.style.background = 'transparent';
	menuBtn.style.border = 'none';
	menuBtn.style.cursor = 'pointer';
	menuBtn.style.zIndex = 2;
	menuBtn.onclick = function(e) {
		e.stopPropagation();
		// Show dropdown menu
		let menu = document.createElement('div');
		menu.style.position = 'absolute';
		menu.style.background = '#fff';
		menu.style.border = '1px solid #ccc';
		menu.style.zIndex = 1000;
		menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
		menu.style.padding = '4px 0';
		menu.style.minWidth = '140px';
		// Position menu near button
		const rect = menuBtn.getBoundingClientRect();
		menu.style.left = (rect.right + window.scrollX) + 'px';
		menu.style.top = (rect.bottom + window.scrollY) + 'px';

		// Add 'Add Child Node' option
		const addChild = document.createElement('div');
		addChild.textContent = 'Add Child Node';
		addChild.style.padding = '6px 16px';
		addChild.style.cursor = 'pointer';
		addChild.onmouseover = () => addChild.style.background = '#eee';
		addChild.onmouseout = () => addChild.style.background = '';
		addChild.onclick = function(ev) {
		  ev.stopPropagation();
		  let label = prompt('Enter label for new node:');
		  if (!label) return;
		  if (!node.children) node.children = [];
		  let newId = Date.now();
		  node.children.push({ id: newId, label: label, percentage: 0, children: [] });
		  document.body.removeChild(menu);
		  renderCurrentMap();
		  saveMapToLocalStorage();
		};
		menu.appendChild(addChild);
		// Add 'Delete Node' option (except for root)
		if (node !== projectMapRoot) {
		  const deleteNode = document.createElement('div');
		  deleteNode.textContent = 'Delete Node';
		  deleteNode.style.padding = '6px 16px';
		  deleteNode.style.cursor = 'pointer';
		  deleteNode.style.color = '#b00';
		  deleteNode.onmouseover = () => deleteNode.style.background = '#fee';
		  deleteNode.onmouseout = () => deleteNode.style.background = '';
		  deleteNode.onclick = function(ev) {
			ev.stopPropagation();
			// Find parent and reassign children
			function findAndDelete(parent) {
			  if (!parent.children) return false;
			  const idx = parent.children.findIndex(child => child.id === node.id);
			  if (idx !== -1) {
				// Move node's children to parent
				const nodeToDelete = parent.children[idx];
				if (nodeToDelete.children && nodeToDelete.children.length > 0) {
				  parent.children.splice(idx, 1, ...nodeToDelete.children);
				} else {
				  parent.children.splice(idx, 1);
				}
				return true;
			  }
			  for (let child of parent.children) {
				if (findAndDelete(child)) return true;
			  }
			  return false;
			}
			findAndDelete(projectMapRoot);
			selected_node = null;
			document.body.removeChild(menu);
			renderCurrentMap();
			saveMapToLocalStorage();
		  };
		  menu.appendChild(deleteNode);
		}
		// Add 'Rename Node' option
		const renameNode = document.createElement('div');
		renameNode.textContent = 'Rename Node';
		renameNode.style.padding = '6px 16px';
		renameNode.style.cursor = 'pointer';
		renameNode.onmouseover = () => renameNode.style.background = '#eee';
		renameNode.onmouseout = () => renameNode.style.background = '';
		renameNode.onclick = function(ev) {
		  ev.stopPropagation();
		  let newLabel = prompt('Enter new label (EN) for this node:', node.labelEN || node.label || '');
		  if (newLabel && newLabel.trim()) {
			node.labelEN = newLabel.trim();
			node.label = newLabel.trim();
			renderCurrentMap();
			saveMapToLocalStorage();
		  }
		  document.body.removeChild(menu);
		};
		menu.appendChild(renameNode);
		// Add 'Edit Chinese Label' option
		const editChineseLabel = document.createElement('div');
		editChineseLabel.textContent = 'Edit Chinese Label';
		editChineseLabel.style.padding = '6px 16px';
		editChineseLabel.style.cursor = 'pointer';
		editChineseLabel.onmouseover = () => editChineseLabel.style.background = '#eee';
		editChineseLabel.onmouseout = () => editChineseLabel.style.background = '';
		editChineseLabel.onclick = function(ev) {
		  ev.stopPropagation();
		  let newLabelZH = prompt('输入中文标签 (Chinese label) for this node:', node.labelZH || '');
		  if (newLabelZH && newLabelZH.trim()) {
			node.labelZH = newLabelZH.trim();
			renderCurrentMap();
			saveMapToLocalStorage();
		  }
		  document.body.removeChild(menu);
		};
		menu.appendChild(editChineseLabel);
		// Add 'Move Node' option (reorder within parent)
		if (node !== projectMapRoot) {
		  const moveNode = document.createElement('div');
		  moveNode.textContent = 'Move Node (Change Order)';
		  moveNode.style.padding = '6px 16px';
		  moveNode.style.cursor = 'pointer';
		  moveNode.onmouseover = () => moveNode.style.background = '#eee';
		  moveNode.onmouseout = () => moveNode.style.background = '';
		  moveNode.onclick = function(ev) {
			ev.stopPropagation();
			// Find parent and index of this node
			function findParentAndIndex(parent) {
			  if (!parent.children) return null;
			  const idx = parent.children.findIndex(child => child.id === node.id);
			  if (idx !== -1) return { parent, idx };
			  for (let child of parent.children) {
				const res = findParentAndIndex(child);
				if (res) return res;
			  }
			  return null;
			}
			const res = findParentAndIndex(projectMapRoot);
			if (!res) return;
			const { parent, idx } = res;
			const maxPos = parent.children.length;
			let newPosStr = prompt(`Enter new position for this node (1-${maxPos}):`, (idx+1));
			if (!newPosStr) return;
			let newPos = parseInt(newPosStr, 10) - 1;
			if (isNaN(newPos) || newPos < 0 || newPos >= maxPos || newPos === idx) return;
			// Remove node from current position
			const [movingNode] = parent.children.splice(idx, 1);
			// Insert node at new position
			parent.children.splice(newPos, 0, movingNode);
			renderCurrentMap();
			saveMapToLocalStorage();
			document.body.removeChild(menu);
		  };
		  menu.appendChild(moveNode);
		}
		// Add 'Edit Percentage' option
		const editPercent = document.createElement('div');
		editPercent.textContent = 'Edit Percentage';
		editPercent.style.padding = '6px 16px';
		editPercent.style.cursor = 'pointer';
		editPercent.onmouseover = () => editPercent.style.background = '#eee';
		editPercent.onmouseout = () => editPercent.style.background = '';
		editPercent.onclick = function(ev) {
		  ev.stopPropagation();
		  let val = prompt('Enter percentage (0-100):', node.percentage != null ? node.percentage : 0);
		  if (val === null) return;
		  let num = parseInt(val, 10);
		  if (isNaN(num) || num < 0 || num > 100) {
			alert('Please enter a number between 0 and 100.');
			return;
		  }
		  node.percentage = num;
		  renderCurrentMap();
		  saveMapToLocalStorage();
		  document.body.removeChild(menu);
		};
		menu.appendChild(editPercent);

		// Add 'Open Page' option
		const openPage = document.createElement('div');
		openPage.textContent = 'Open Page';
		openPage.style.padding = '6px 16px';
		openPage.style.cursor = 'pointer';
		openPage.onmouseover = () => openPage.style.background = '#eee';
		openPage.onmouseout = () => openPage.style.background = '';
		openPage.onclick = function(ev) {
		  ev.stopPropagation();
		  window.open(`/node-page.html?id=${encodeURIComponent(node.id)}`, '_blank');
		  document.body.removeChild(menu);
		};
		menu.appendChild(openPage);

		// Remove any existing menu
		document.querySelectorAll('.node-dropdown-menu').forEach(m => m.remove());
		menu.className = 'node-dropdown-menu';
		document.body.appendChild(menu);

		// Remove menu on click outside
		setTimeout(() => {
		  function removeMenu(ev) {
			if (!menu.contains(ev.target)) {
			  menu.remove();
			  document.removeEventListener('mousedown', removeMenu);
			}
		  }
		  document.addEventListener('mousedown', removeMenu);
		}, 0);
	};
	el.appendChild(menuBtn);

	// Children
	if (node.children && node.children.length) {
	const children = document.createElement('div');
	children.className = 'map-children';
	node.children.forEach(child => children.appendChild(renderMap(child, depth + 1)));
	el.appendChild(children);
	}

	// Print percentage at the bottom left of each node
	const percentLineDiv = document.createElement('div');
	percentLineDiv.textContent = (node.percentage != null ? node.percentage : 0) + '%';
	percentLineDiv.style.fontSize = '0.85em';
	percentLineDiv.style.color = '#7c4c00';
	percentLineDiv.style.fontWeight = 'bold';
	percentLineDiv.style.opacity = '0.8';
	percentLineDiv.style.marginTop = '2px';
	percentLineDiv.style.marginBottom = '2px';
	el.appendChild(percentLineDiv);

	// Add a small tube to root node's lower-right corner indicating "money in"
	if (depth === 0) {
	el.style.position = 'relative';
	const protrusion = document.createElement('div');
	protrusion.style.position = 'absolute';
	protrusion.style.width = '28px';
	protrusion.style.height = '50px';
	protrusion.style.right = '20px';
	protrusion.style.bottom = '-50px';
	protrusion.style.background = getYellowShade(0);
	protrusion.style.border = '4px solid #b77c00';
	protrusion.style.borderTop = '0px';
	protrusion.style.borderBottom = '0px';
	// Add bold dollar sign
	const dollar = document.createElement('p');
	dollar.innerHTML = '↑<br>$';
	dollar.style.fontWeight = 'bold';
	dollar.style.fontSize = '1.3em';
	dollar.style.color = '#7c4c00';
	dollar.style.position = 'absolute';
	dollar.style.bottom = '-12px';
	dollar.style.right = '6px';
	protrusion.appendChild(dollar);
	el.appendChild(protrusion);
	}

	return el;
}

// Save the current projectMapRoot to localStorage whenever the map is updated
function saveMapToLocalStorage() {
  try {
    localStorage.setItem('projectMapRoot', JSON.stringify(projectMapRoot));
  } catch (e) {
    console.warn('Could not save projectMapRoot to localStorage:', e);
  }
}

function renderCurrentMap() {
  const container = document.getElementById('map-container');
  container.innerHTML = '';
  container.appendChild(renderMap(projectMapRoot, 0));
  saveMapToLocalStorage(); // Save after rendering (and after any change)
  // Always update projectName from root node
  projectName = projectMapRoot.labelEN || projectMapRoot.label || 'project-map';
  document.title = projectName + ' - Project Map';
  window.projectMapRoot = projectMapRoot; // keep updated for debugging
  window.projectName = projectName; // keep updated for debugging
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
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      let raw = e.target.result;
      try {
        const json = JSON.parse(raw);
        // Assume json is exactly the tree structure (ProjectMapRoot)
        if (typeof json === 'object' && json.id === 0 && Array.isArray(json.children)) {
          projectMapRoot = json;
          projectName = projectMapRoot.labelEN || projectMapRoot.label || 'project-map';
          window.projectMapRoot = projectMapRoot;
          selected_node = null;
          renderCurrentMap();
          saveMapToLocalStorage();
        } else {
          throw new Error('Unrecognized JSON map format: root node must have id:0 and children array');
        }
      } catch (err) {
        alert('Invalid JSON map file!\n' + err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
// --- Save JSON map logic ---
function saveJSONMap(filename) {
  // Always use projectMapRoot as the data to save
  let defaultName = projectName || (window.projectMapRoot && (window.projectMapRoot.labelEN || window.projectMapRoot.label)) ? (window.projectMapRoot.labelEN || window.projectMapRoot.label) : 'project-map';
  let saveName = prompt('Enter project name for saving (will be used as filename):', defaultName);
  if (!saveName) return;
  // Sanitize filename
  saveName = saveName.replace(/[^a-zA-Z0-9-_]/g, '_');
  projectName = saveName; // Update global projectName
  const fileName = `${saveName}.json`;
  const jsonStr = JSON.stringify(projectMapRoot, null, 2);

  // Try to save to project-maps/ via server if possible
  fetch(`/saveJSON/project-maps/${encodeURIComponent(saveName)}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonStr
  })
    .then(r => r.ok ? alert('Saved to server: project-maps/' + fileName) : r.text().then(t => alert('Error: ' + t)))
    .catch(e => {
      // Fallback: download to user's default download folder
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 0);
      alert('Saved to local download folder as ' + fileName);
    });
  // Update page title after save
  document.title = projectName + ' - Project Map';
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
  renderCurrentMap();
  document.getElementById('modal-cancel-btn').onclick = hideNodeModal;
  document.getElementById('modal-save-btn').onclick = function() {
    // Save logic here (update label, etc.)
    const modal = document.getElementById('node-modal');
    const nodeId = modal.dataset.nodeId;
    // Update the node's label
    const newLabel = document.getElementById('modal-node-label').value;
    if (newLabel && newLabel.trim()) {
      // Find the node by id and update its label
      function updateNodeLabel(node) {
        if (node.id == nodeId) {
          node.label = newLabel.trim();
          node.labelEN = newLabel.trim();
        } else if (node.children) {
          node.children.forEach(updateNodeLabel);
        }
      }
      updateNodeLabel(projectMapRoot);
    }
    hideNodeModal();
    renderCurrentMap();
  };
  document.getElementById('modal-overlay').onclick = hideNodeModal;

  // Auto-load project map from URL parameter
  function autoLoadProjectMap() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectNameParam = urlParams.get('projectName');
    
    if (projectNameParam) {
      // Construct the JSON file path
      const jsonFilePath = `project-maps/${encodeURIComponent(projectNameParam)}.json`;
      
      // Try to fetch and load the JSON file
      fetch(jsonFilePath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(json => {
          // Validate and load the JSON data
          if (typeof json === 'object' && json.id === 0 && Array.isArray(json.children)) {
            projectMapRoot = json;
            projectName = projectMapRoot.labelEN || projectMapRoot.label || projectNameParam;
            window.projectMapRoot = projectMapRoot;
            selected_node = null;
            
            // Update page title and header
            document.title = `${projectName} - Project Map`;
            const h1Element = document.getElementsByTagName('h1')[0];
            if (h1Element) {
              h1Element.innerHTML = `${projectName} - Project Map`;
            }
            
            renderCurrentMap();
            saveMapToLocalStorage();
            console.log(`Auto-loaded project map: ${projectName}`);
          } else {
            throw new Error('Invalid JSON map format: root node must have id:0 and children array');
          }
        })
        .catch(error => {
          console.warn(`Could not auto-load project map for "${projectNameParam}":`, error);
          // Fall back to default behavior - the existing projectMapRoot will be used
        });
    }
  }

  autoLoadProjectMap();
});
