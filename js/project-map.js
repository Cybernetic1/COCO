// This file is for a visually different project map UI.
// - Enforces a tree structure (one parent per node, except root)
// - No Vis.js dependency by default (add if needed)
// - Right-click on a node brings up a modal for editing

// Example: minimal map data
let projectMapRoot = {
  id: 0,
  label: 'Root',
  "project-name": 'Example Project',
  percentage: 100,
  children: [
    { id: 1, label: 'Node 1', percentage: 60, children: [] },
    { id: 2, label: 'Node 2', percentage: 40, children: [] }
  ]
};

// Try to load projectMapRoot from localStorage on page load
if (localStorage.getItem('projectMapRoot')) {
  try {
    const loaded = JSON.parse(localStorage.getItem('projectMapRoot'));
    if (loaded && typeof loaded === 'object') {
      projectMapRoot = loaded;
      
      // Get URL parameter for project name (if any)
      const urlParams = new URLSearchParams(window.location.search);
      const projectNameParam = urlParams.get('projectName');
      
      // Determine project name with proper precedence:
      // 1. JSON's project-name property (highest precedence)
      // 2. URL/filename parameter
      // 3. Default fallback (skip root node's labelEN/label as they're usually just "ROOT")
      projectName = projectMapRoot["project-name"] || projectNameParam || 'project-map';
      
      // If JSON doesn't have project-name but we got it from URL, store it
      if (!projectMapRoot["project-name"] && projectNameParam) {
        projectMapRoot["project-name"] = projectNameParam;
      }
      
      window.projectMapRoot = projectMapRoot; // update global for debugging
    }
  } catch (e) {
    console.warn('Could not parse projectMapRoot from localStorage:', e);
  }
}

let selected_node = null; // Track selected node
let currentLanguage = 'EN';

// Get URL parameter for project name (if any) for initial load
const urlParams = new URLSearchParams(window.location.search);
const projectNameParam = urlParams.get('projectName');

// Determine project name with proper precedence:
// 1. JSON's project-name property (highest precedence)
// 2. URL/filename parameter  
// 3. Default fallback (skip root node's labelEN/label as they're usually just "ROOT")
let projectName = projectMapRoot["project-name"] || projectNameParam || 'project-map';

// Initialize PercentageManager
// TODO: Get actual user ID from authentication system
const currentUserId = 'user-' + (localStorage.getItem('currentUserId') || 'default');
let percentageManager = null;

// Initialize percentage manager when DOM is ready
function initializePercentageManager() {
  percentageManager = new PercentageManager(projectName, currentUserId);
  console.log('PercentageManager initialized for project:', projectName, 'user:', currentUserId);
}

// Make projectMapRoot available on window for debugging
window.projectMapRoot = projectMapRoot;

// Update page title and header
document.title = `${projectName} - Project Map`;
const h1Element = document.getElementsByTagName('h1')[0];
if (h1Element) {
  h1Element.innerHTML = projectName;
}

// Sound files (uncomment to use)
// const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');
// const techFail = new Audio('sounds/tech-fail.wav');

function switchLang() {
  currentLanguage = (currentLanguage === 'EN') ? 'ZH' : 'EN';
  renderCurrentMap();
  techClick2.play();
}

function getColorShade(level) {
  // Use the config module's color function
  return ProjectMapConfig.getColorShade(level);
}

function renderMap(node, depth = 0) {
	const el = document.createElement('div');
	el.className = 'map-node';
	el.style.background = getColorShade(depth);
	// Highlight if selected (compare by id)
	if (selected_node && selected_node.id === node.id) {
		el.style.border = '4px solid ' + ProjectMapConfig.colors.selectedNodeBorder;
		el.style.background = ProjectMapConfig.colors.selectedNodeBackground;
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
	menuBtn.style.color = ProjectMapConfig.colors.menuButtonColor;
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
		
		// Add 'Edit Project Name' option (only for root node)
		if (node === projectMapRoot) {
		  const editProjectNameOption = document.createElement('div');
		  editProjectNameOption.textContent = 'Edit Project Name';
		  editProjectNameOption.style.padding = '6px 16px';
		  editProjectNameOption.style.cursor = 'pointer';
		  editProjectNameOption.onmouseover = () => editProjectNameOption.style.background = '#eee';
		  editProjectNameOption.onmouseout = () => editProjectNameOption.style.background = '';
		  editProjectNameOption.onclick = function(ev) {
			ev.stopPropagation();
			editProjectName();
			document.body.removeChild(menu);
		  };
		  menu.appendChild(editProjectNameOption);
		}
		
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

	// Create percentage/slider display section
	if (node.children && node.children.length > 0) {
		// Node has children - show sliders for each child
		const sliderContainer = document.createElement('div');
		sliderContainer.className = 'slider-container';
		
		// Create sliders for each child
		node.children.forEach((child, index) => {
			const slidecontainer = document.createElement('div');
			slidecontainer.className = 'slidecontainer';
			
			// Child name
			const nameElement = document.createElement('div');
			nameElement.className = 'slider-name';
			nameElement.textContent = child.labelEN || child.label || `Child ${child.id}`;
			slidecontainer.appendChild(nameElement);
			
			// Slider
			const slider = document.createElement('input');
			slider.type = 'range';
			slider.min = ProjectMapConfig.slider.min.toString();
			slider.max = ProjectMapConfig.slider.max.toString();
			slider.value = (child.percentage || 0) * 10; // Convert from % to 0-1000 scale
			slider.className = 'slider';
			slider.dataset.childIndex = index;
			slider.dataset.nodeId = node.id;
			slidecontainer.appendChild(slider);
			
			// Score display
			const scoreElement = document.createElement('div');
			scoreElement.className = 'slider-score';
			scoreElement.textContent = (child.percentage || 0).toFixed(1) + '%';
			slidecontainer.appendChild(scoreElement);
			
			sliderContainer.appendChild(slidecontainer);
		});
		
		// Note: Total display is hidden to save space since it's always 100%
		
		el.appendChild(sliderContainer);
	}
	// Note: Individual node percentage displays removed as they're redundant with slider interface

	// Add a small tube to root node's lower-right corner indicating "money in"
	if (depth === 0) {
	el.style.position = 'relative';
	const protrusion = document.createElement('div');
	protrusion.style.position = 'absolute';
	protrusion.style.width = '28px';
	protrusion.style.height = '50px';
	protrusion.style.right = '20px';
	protrusion.style.bottom = '-50px';
	protrusion.style.background = getColorShade(0);
	protrusion.style.border = '4px solid #CCC';
	protrusion.style.borderTop = '0px';
	protrusion.style.borderBottom = '0px';
	// Add bold dollar sign
	const dollar = document.createElement('p');
	dollar.innerHTML = '↑<br>$';
	dollar.style.fontWeight = 'bold';
	dollar.style.fontSize = '1.3em';
	dollar.style.color = '#AAA';
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
  localStorage.setItem('projectMapRoot', JSON.stringify(projectMapRoot));
}

// Initialize slider event listeners after map is rendered
function initializeSliders() {
  const sliders = document.querySelectorAll('.slider');
  
  sliders.forEach(slider => {
    slider.addEventListener('input', function() {
      const nodeId = parseInt(this.dataset.nodeId);
      const childIndex = parseInt(this.dataset.childIndex);
      const newValue = parseFloat(this.value);
      
      // Find the node in the tree
      const node = findNodeById(projectMapRoot, nodeId);
      if (!node || !node.children || !node.children[childIndex]) {
        return;
      }
      
      const children = node.children;
      const n = children.length;
      
      // Update the changed child's percentage (convert from 0-1000 to 0-100 and round to 1 decimal)
      const newPercentage = Math.round((newValue / 10.0) * 10) / 10;
      children[childIndex].percentage = newPercentage;
      
      // Calculate what needs to be redistributed
      let currentTotal = 0;
      for (const child of children) {
        currentTotal += (child.percentage || 0);
      }
      
      const surplus = currentTotal - 100.0;
      
      if (n > 1 && Math.abs(surplus) > 0.01) { // Only redistribute if there's a meaningful surplus
        // Calculate total of other children (excluding the one we just changed)
        let otherChildrenTotal = 0;
        for (let j = 0; j < n; j++) {
          if (j !== childIndex) {
            otherChildrenTotal += (children[j].percentage || 0);
          }
        }
        
        // Redistribute proportionally among other children
        for (let j = 0; j < n; j++) {
          if (j !== childIndex) {
            if (otherChildrenTotal > 0.01) {
              // Proportional reduction/increase
              const proportion = (children[j].percentage || 0) / otherChildrenTotal;
              const adjustment = surplus * proportion;
              children[j].percentage = Math.max(0, Math.round((children[j].percentage - adjustment) * 10) / 10);
            } else {
              // If other children are all zero, distribute the surplus equally
              children[j].percentage = Math.max(0, Math.round(((100.0 - newPercentage) / (n - 1)) * 10) / 10);
            }
          }
        }
      }
      
      // Update all sliders and score displays for this node
      updateNodeSliders(nodeId);
      
      // Mark that percentages have changed (for batch saving later)
      window.percentagesChanged = true;
      updateSaveButtonState();
      
      // Note: Percentages are now saved in batches via save button or page unload
      // instead of on every slider movement for better performance
    });
  });
}

// Helper function to find a node by ID in the tree
function findNodeById(node, targetId) {
  if (node.id === targetId) return node;
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  
  return null;
}

// Update sliders and displays for a specific node
function updateNodeSliders(nodeId) {
  const node = findNodeById(projectMapRoot, nodeId);
  if (!node || !node.children) return;
  
  // Update sliders and score displays
  const sliders = document.querySelectorAll(`[data-node-id="${nodeId}"]`);
  sliders.forEach((slider, index) => {
    const childIndex = parseInt(slider.dataset.childIndex);
    if (childIndex < node.children.length) {
      const percentage = node.children[childIndex].percentage || 0;
      slider.value = Math.round(percentage * 10); // Convert to 0-1000 scale
      
      // Update score display with 1 decimal place
      const scoreElement = slider.parentElement.querySelector('.slider-score');
      if (scoreElement) {
        scoreElement.textContent = percentage.toFixed(1) + '%';
      }
    }
  });
}

function renderCurrentMap() {
  const container = document.getElementById('map-container');
  container.innerHTML = '';
  container.appendChild(renderMap(projectMapRoot, 0));
  
  // Initialize percentage manager if not already done
  if (!percentageManager) {
    initializePercentageManager();
  }
  
  // Initialize sliders after rendering with a longer delay to ensure DOM is ready
  setTimeout(() => {
    initializeSliders();
    // Load saved percentages after sliders are initialized
    loadSavedPercentages();
    // Initialize save button state
    updateSaveButtonState();
  }, 100);
  
  saveMapToLocalStorage(); // Save after rendering (and after any change)
  // Always update projectName from root node, prioritizing project-name property
  projectName = projectMapRoot["project-name"] || projectMapRoot.labelEN || projectMapRoot.label || 'project-map';
  document.title = projectName + ' - Project Map';
  updateSaveButtonState(); // This will update the h1 with proper asterisk state
  window.projectMapRoot = projectMapRoot; // keep updated for debugging
  window.projectName = projectName; // keep updated for debugging
}

// Load saved percentages for all nodes with children
async function loadSavedPercentages() {
  if (!percentageManager) return;
  
  try {
    await loadPercentagesForNode(projectMapRoot);
    console.log('Saved percentages loaded successfully');
  } catch (error) {
    console.error('Failed to load saved percentages:', error);
  }
}

// Recursively load percentages for a node and its children
async function loadPercentagesForNode(node) {
  if (node.children && node.children.length > 0) {
    try {
      const savedPercentages = await percentageManager.loadPercentages(node.id.toString());
      
      if (savedPercentages && savedPercentages.length > 0) {
        // Apply saved percentages to the node's children
        savedPercentages.forEach(saved => {
          const child = node.children.find(c => c.id.toString() === saved.childId);
          if (child) {
            child.percentage = saved.percentage;
          }
        });
        
        // Update the sliders for this node
        updateNodeSliders(node.id);
      }
    } catch (error) {
      console.warn('Failed to load percentages for node:', node.id, error);
    }
    
    // Recursively load for children
    for (const child of node.children) {
      await loadPercentagesForNode(child);
    }
  }
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
          
          // Determine project name with proper precedence:
          // 1. JSON's project-name property (highest precedence)
          // 2. filename (extracted from file.name)
          // 3. Default fallback (skip root node's labelEN/label as they're usually just "ROOT")
          const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          projectName = projectMapRoot["project-name"] || filenameWithoutExt || 'project-map';
          
          // If JSON doesn't have project-name but we got it from filename, store it
          if (!projectMapRoot["project-name"] && filenameWithoutExt) {
            projectMapRoot["project-name"] = filenameWithoutExt;
          }
          
          window.projectMapRoot = projectMapRoot;
          selected_node = null;
          
          // Update page title and header using the state-aware function
          document.title = `${projectName} - Project Map`;
          updateSaveButtonState(); // This will update the h1 with proper asterisk state
          
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
  let defaultName = projectName || projectMapRoot["project-name"] || projectMapRoot.labelEN || projectMapRoot.label || 'project-map';
  let saveName = prompt('Enter project name for saving (will be used as filename):', defaultName);
  if (!saveName) return;
  // Sanitize filename
  saveName = saveName.replace(/[^a-zA-Z0-9-_]/g, '_');
  projectName = saveName; // Update global projectName
  
  // Store the project name in the root node's project-name property
  projectMapRoot["project-name"] = saveName;
  
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
    div.innerHTML = `<b style='color:#AAA;'>${msg.user}</b>: <span>${escapeHtml(msg.text)}</span> <span style='color:#aaa;font-size:0.9em;'>${formatTime(msg.time)}</span>`;
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
            
            // Determine project name with proper precedence:
            // 1. JSON's project-name property (highest precedence)
            // 2. URL/filename parameter
            // 3. Default fallback (skip root node's labelEN/label as they're usually just "ROOT")
            projectName = projectMapRoot["project-name"] || projectNameParam || 'project-map';
            
            // If JSON doesn't have project-name but we got it from URL, store it
            if (!projectMapRoot["project-name"] && projectNameParam) {
              projectMapRoot["project-name"] = projectNameParam;
            }
            
            window.projectMapRoot = projectMapRoot;
            selected_node = null;
            
            // Update page title and header using the state-aware function
            document.title = `${projectName} - Project Map`;
            updateSaveButtonState(); // This will update the h1 with proper asterisk state
            
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

// Function to edit the project name
function editProjectName() {
  const currentName = projectMapRoot["project-name"] || projectName || 'project-map';
  const newName = prompt('Enter new project name:', currentName);
  if (newName && newName.trim()) {
    projectName = newName.trim();
    projectMapRoot["project-name"] = projectName;
    
    // Update page title and header using the state-aware function
    document.title = `${projectName} - Project Map`;
    updateSaveButtonState(); // This will update the h1 with proper asterisk state
    
    saveMapToLocalStorage();
    techClick2.play().catch(() => {}); // Ignore audio errors
  }
}

// Global flag to track if percentages have been modified
window.percentagesChanged = false;

// Function to save all current percentage assignments for all nodes with children
function saveAllPercentages() {
  if (!percentageManager) {
    initializePercentageManager();
  }
  
  if (!percentageManager) {
    alert('Error: Could not initialize percentage manager');
    return;
  }
  
  let savedCount = 0;
  let errorCount = 0;
  let serverFailureDetected = false;
  
  // Temporarily override the alert function to suppress multiple server warnings
  const originalAlert = window.alert;
  let suppressAlerts = false;
  
  window.alert = function(message) {
    if (suppressAlerts && message.includes('Server connection failed')) {
      // Suppress duplicate server connection alerts
      return;
    }
    originalAlert.call(window, message);
  };
  
  // Helper function to recursively walk through all nodes
  async function walkNodes(node) {
    // If this node has children, save their percentages
    if (node.children && node.children.length > 0) {
      try {
        const childPercentages = node.children.map(child => ({
          childId: child.id.toString(),
          percentage: child.percentage || 0
        }));
        
        await percentageManager.savePercentages(node.id.toString(), childPercentages);
        savedCount++;
        console.log(`Saved percentages for node ${node.id} (${node.label}):`, childPercentages);
      } catch (error) {
        console.error(`Error saving percentages for node ${node.id}:`, error);
        errorCount++;
        if (error.message && error.message.includes('Server')) {
          serverFailureDetected = true;
        }
      }
    }
    
    // Recursively process all children
    if (node.children) {
      for (const child of node.children) {
        await walkNodes(child);
      }
    }
  }
  
  // Process all nodes asynchronously
  (async () => {
    try {
      // Suppress alerts after the first server failure
      let isFirstSave = true;
      
      // Override the percentageManager's savePercentages to detect server failures
      const originalSavePercentages = percentageManager.savePercentages.bind(percentageManager);
      percentageManager.savePercentages = async function(nodeId, childPercentages) {
        try {
          const result = await originalSavePercentages(nodeId, childPercentages);
          return result;
        } catch (error) {
          if (!serverFailureDetected && isFirstSave) {
            serverFailureDetected = true;
            isFirstSave = false;
            // Allow the first server failure alert to show
            throw error;
          } else {
            // Suppress subsequent alerts but still save to localStorage
            suppressAlerts = true;
            const result = await originalSavePercentages(nodeId, childPercentages);
            suppressAlerts = false;
            return result;
          }
        }
      };
      
      // Start the walk from the root node
      await walkNodes(projectMapRoot);
      
      // Restore original functions
      percentageManager.savePercentages = originalSavePercentages;
      window.alert = originalAlert;
      
      // Reset the changed flag after saving
      window.percentagesChanged = false;
      updateSaveButtonState();
      
      // Provide user feedback
      let message = '';
      if (errorCount === 0) {
        if (savedCount > 0) {
          message = `Successfully saved percentages for ${savedCount} node(s).`;
          techClick2.play().catch(() => {}); // Play success sound
        } else {
          message = 'No nodes with children found to save percentages for.';
        }
      } else {
        message = `Saved percentages for ${savedCount} node(s), but encountered ${errorCount} error(s).`;
        if (serverFailureDetected) {
          message += '\nNote: Server connection failed, percentages saved to local storage only.';
        }
        message += ' Check console for details.';
      }
      
      alert(message);
      
    } catch (error) {
      // Restore original functions in case of error
      window.alert = originalAlert;
      console.error('Failed to save percentages:', error);
      alert('Error: Failed to save percentages. Please try again.');
    }
  })();
}

// Update save button visual state based on whether changes exist
function updateSaveButtonState() {
  // Update the h1 title to show unsaved changes with a red asterisk
  const h1Element = document.getElementsByTagName('h1')[0];
  if (h1Element) {
    const baseTitle = projectName || 'Project Name';
    if (window.percentagesChanged) {
      // Add red asterisk to indicate unsaved changes
      h1Element.innerHTML = baseTitle + ' <span style="color: #d63384; font-weight: bold;">*</span>';
      h1Element.title = 'You have unsaved percentage changes';
    } else {
      // Remove asterisk when changes are saved
      h1Element.innerHTML = baseTitle;
      h1Element.title = '';
    }
  }
  
  // Also update the page title to indicate unsaved changes
  const currentTitle = document.title;
  if (window.percentagesChanged && !currentTitle.includes('*')) {
    document.title = currentTitle + ' *';
  } else if (!window.percentagesChanged && currentTitle.includes('*')) {
    document.title = currentTitle.replace(' *', '');
  }
}

// Auto-save percentages when page is about to unload
window.addEventListener('beforeunload', function(event) {
  if (window.percentagesChanged && percentageManager) {
    // Try to save percentages synchronously
    try {
      saveAllPercentagesSync();
    } catch (error) {
      console.error('Failed to auto-save percentages on page unload:', error);
    }
    
    // Show warning to user about unsaved changes
    event.preventDefault();
    event.returnValue = 'You have unsaved percentage changes. Are you sure you want to leave?';
    return event.returnValue;
  }
});

// Synchronous version for page unload (uses sendBeacon or fetch with keepalive)
function saveAllPercentagesSync() {
  if (!percentageManager || !window.percentagesChanged) return;
  
  // Collect all percentage data
  const allPercentageData = [];
  
  function collectPercentages(node) {
    if (node.children && node.children.length > 0) {
      const childPercentages = node.children.map(child => ({
        childId: child.id.toString(),
        percentage: child.percentage || 0
      }));
      
      allPercentageData.push({
        nodeId: node.id.toString(),
        percentages: childPercentages
      });
    }
    
    if (node.children) {
      for (const child of node.children) {
        collectPercentages(child);
      }
    }
  }
  
  collectPercentages(projectMapRoot);
  
  // Try to send data using sendBeacon (more reliable for page unload)
  if (navigator.sendBeacon && allPercentageData.length > 0) {
    const data = JSON.stringify({
      projectName: percentageManager.projectName,
      userId: percentageManager.userId,
      percentageData: allPercentageData
    });
    
    navigator.sendBeacon('/api/save-all-percentages', data);
    console.log('Auto-saved percentages using sendBeacon');
  }
}

// Add keyboard shortcut for saving (Ctrl+S)
document.addEventListener('keydown', function(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (window.percentagesChanged) {
      saveAllPercentages();
    } else {
      alert('No percentage changes to save.');
    }
  }
});

// Function to save all current percentage assignments for all nodes with children
// (This is the existing function - keeping it for compatibility but updating the implementation)
// ...existing code...
