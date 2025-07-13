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

// Get URL parameter for project name (if any) for initial load
const urlParams = new URLSearchParams(window.location.search);
const projectNameParam = urlParams.get('projectName');

// Initialize project name variable
let projectName = ProjectMapDataManager.getProjectName(projectMapRoot, projectNameParam);

// Try to load projectMapRoot from localStorage on page load
const loadedData = ProjectMapDataManager.loadFromLocalStorage();
if (loadedData && ProjectMapDataManager.validateProjectMapData(loadedData)) {
  projectMapRoot = loadedData;
  
  // Determine project name using data manager
  projectName = ProjectMapDataManager.getProjectName(projectMapRoot, projectNameParam);
  
  // If JSON doesn't have project-name but we got it from URL, store it
  if (!projectMapRoot["project-name"] && projectNameParam) {
    ProjectMapDataManager.setProjectName(projectMapRoot, projectNameParam);
  }
  
  window.projectMapRoot = projectMapRoot; // update global for debugging
}

let selected_node = null; // Track selected node
let currentLanguage = 'EN';

// Initialize module instances
let renderer = null;
let sliderManager = null;
let modalManager = null;
let fileManager = null;

// Initialize PercentageManager
// TODO: Get actual user ID from authentication system
const currentUserId = 'user-' + (localStorage.getItem('currentUserId') || 'default');
let percentageManager = null;

// Initialize all modules when DOM is ready
function initializeModules() {
  const dataManager = ProjectMapDataManager;
  
  renderer = new ProjectMapRenderer(ProjectMapConfig);
  sliderManager = new ProjectMapSliderManager(dataManager);
  modalManager = new ProjectMapModalManager(dataManager);
  fileManager = new ProjectMapFileManager(dataManager);
  
  // Set current language in renderer
  renderer.currentLanguage = currentLanguage;
  
  console.log('All modules initialized');
}

// Initialize percentage manager when DOM is ready
function initializePercentageManager() {
  const currentProjectName = projectName || 'project-map';
  percentageManager = new PercentageManager(currentProjectName, currentUserId);
  console.log('PercentageManager initialized for project:', currentProjectName, 'user:', currentUserId);
}

// Reinitialize percentage manager when project name changes
function updatePercentageManagerProjectName() {
  if (percentageManager && percentageManager.projectId !== projectName) {
    console.log('Project name changed from', percentageManager.projectId, 'to', projectName, '- reinitializing PercentageManager');
    initializePercentageManager();
  }
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
  if (renderer) {
    currentLanguage = renderer.switchLanguage();
    renderCurrentMap();
  }
  techClick2.play();
}

// Node operation callbacks for renderer
const nodeOperations = {
  onNodeEdit: (node) => {
    if (modalManager) {
      modalManager.showNodeModal(node);
    }
  },
  
  onAddChild: (node) => {
    let label = prompt(ProjectMapConfig.text.prompts.newNodeLabel);
    if (!label) return;
    ProjectMapDataManager.addChildNode(node, label);
    console.log('DEBUG onAddChild: After adding child, project name:', projectMapRoot["project-name"]);
    renderCurrentMap();
  },
  
  onDeleteNode: (node) => {
    if (confirm(`Delete node "${node.label}"?`)) {
      ProjectMapDataManager.deleteNode(projectMapRoot, node.id);
      renderCurrentMap();
    }
  },
  
  onPercentageEdit: (node) => {
    if (modalManager) {
      modalManager.showPercentageModal(node);
    }
  }
};

// Render map using the modular renderer
function renderMap(node, depth = 0) {
  if (renderer) {
    return renderer.renderMap(node, depth, {
      ...nodeOperations,
      selectedNode: selected_node
    });
  } else {
    // Fallback if renderer not initialized
    console.error('Renderer not initialized');
    return document.createElement('div');
  }
}

// Save the current projectMapRoot to localStorage whenever the map is updated
function saveMapToLocalStorage() {
  ProjectMapDataManager.saveToLocalStorage(projectMapRoot);
}

// Initialize slider event listeners after map is rendered (use module)
function initializeSliders() {
  if (sliderManager) {
    sliderManager.initializeSliders();
  }
}

// Helper function to find a node by ID in the tree
function findNodeById(node, targetId) {
  return ProjectMapDataManager.findNodeById(node, targetId);
}

// Update sliders and displays for a specific node
function updateNodeSliders(nodeId) {
  if (sliderManager) {
    sliderManager.updateNodeSliders(nodeId);
  }
}

function renderCurrentMap() {
  // Always use the global window.projectMapRoot to ensure we have the latest data
  const currentRoot = window.projectMapRoot || projectMapRoot;
  
  console.log('DEBUG renderCurrentMap: Current root project name:', currentRoot["project-name"]);
  console.log('DEBUG renderCurrentMap: Current root children count:', currentRoot.children?.length);
  
  if (renderer) {
    renderer.renderCurrentMap(currentRoot, 'map-container', {
      ...nodeOperations,
      selectedNode: selected_node
    });
  }
  
  // Initialize sliders after rendering
  setTimeout(() => {
    initializeSliders();
    // No need to load percentages from anywhere - just use what's in the JSON
    // If percentages don't exist in nodes, they'll display as 0.0%
    updateSaveButtonState();
  }, 100);
  
  saveMapToLocalStorage(); // Save current state to localStorage as backup
  
  // Update local variables from the current root
  projectMapRoot = currentRoot;
  projectName = currentRoot["project-name"] || currentRoot.labelEN || currentRoot.label || 'project-map';
  document.title = projectName + ' - Project Map';
  
  // Update page header with project name
  const h1Element = document.getElementsByTagName('h1')[0];
  if (h1Element) {
    h1Element.innerHTML = projectName;
  }
  
  updateSaveButtonState(); // This will update the h1 with proper asterisk state
  window.projectMapRoot = projectMapRoot; // keep updated for debugging
  window.projectName = projectName; // keep updated for debugging
}

function showNodeModal(node) {
  if (modalManager) {
    modalManager.showNodeModal(node);
  }
}

function hideNodeModal() {
  if (modalManager) {
    modalManager.hideNodeModal();
  }
}

// --- Read JSON map logic ---
function readJSONMap() {
  if (fileManager) {
    fileManager.readJSONMap();
  }
}

// --- Save JSON map logic ---
function saveJSONMap(filename) {
  if (fileManager) {
    fileManager.saveJSONMap(filename);
  }
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
  // Initialize all modules
  initializeModules();
  
  // Initialize percentage manager
  initializePercentageManager();
  
  // Render the initial map
  renderCurrentMap();
  
  // Auto-load project if specified in URL
  if (fileManager) {
    fileManager.autoLoadProjectMap();
  }
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
            
            // Update page title and header
            document.title = `${projectName} - Project Map`;
            updateSaveButtonState();
            
            renderCurrentMap(); // Simple render - use whatever percentages are in the JSON
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
