/**
 * PROJECT GRAPH EDITOR
 * 
 * A web-based interactive graph editor for project management and task visualization.
 * Built with Vis.js for network visualization and jQuery for AJAX operations.
 * 
 * MAIN FEATURES:
 * - Interactive node/edge creation and editing with drag-and-drop
 * - Tree structure validation with auxiliary edge highlighting
 * - Bilingual support (English/Chinese) with URL parameter control
 * - Save/load project graphs as JSON files to server
 * - Git directory integration for version control
 * - Node status tracking (in-progress, finished, paused, research)
 * - Ctrl+drag linking between nodes
 * - Modal-based UI for data input and file operations
 * 
 * ARCHITECTURE:
 * - Uses Vis.js DataSets for reactive node/edge management
 * - Express.js server backend for file operations (/saveJSON, /loadJSON, /fileList)
 * - Modal windows for user interactions (JSON_modal, Git_modal, Node_modal, Help_modal)
 * - Sound feedback for user actions
 * - Physics-enabled graph layout with manual positioning support
 * 
 * KEY FUNCTIONS:
 * - saveJSONgraph()/loadJSONgraph(): JSON file persistence
 * - saveGitDir()/loadGitDir(): Git directory operations
 * - addNode(): Create new nodes with bilingual labels
 * - highlightTreeViolations(): Detect and mark non-tree edges as auxiliary
 * - verifyTreeIgnoringAuxEdges(): Validate tree structure
 * - Drag-to-link: Ctrl+mouse interaction for edge creation
 * 
 * DATA STRUCTURE:
 * - Nodes: {id, labelEN, labelZH?, status, details?, authors?, votes?}
 * - Edges: {from, to, label?, dashes?} (dashes=true for auxiliary edges)
 * - Language controlled by URL parameter: ?lang=EN or ?lang=ZH
 */

// TO-DO:
// * Use UUIDs to refer to authors (use nanoID for shorter IDs)
//	- Everyone runs a server on their own, use Github to merge results
//	- Vote results saved on private server (as JSON) are each user's
//		own votes, which can be uploaded to Github
//	- Everyone would be writing to the same Git repo, how to tell them apart?
//	- Perhaps we can record project-data files with user-ID attached,
//		other files would have shared-authorship
//	- How to merge these graphs and their votes?  What does it mean to merge?
//		To merge means to resolve conflicts.  After merging the differences
//		can be forgotten.  Except we may keep voting records permanently.
//	- So the crux of it is to design merging algorithms
//	- Each person has name, email, Github ID

// NOT URGENT:
// * Cannot click side-pane button when covered by side-pane
// * Allow bi-lingual task details

// DONE:
// * some votes become NaN after add new author
// * Drop-down menu to add authors
// * multi-page Help
// * Save graph as Git directory tree
// * Per-Task Voting - with a pop-up window
// * Allow remote users to save Project Graph with ID postfix
//	- These graphs are just for testing and would be merged manually
// * Make 'Help' a modal window
// * Move away from JSON file to Git as the data source of Project Graph
//	- server access local Git dir via 'git commit'
// * Allow per-Node authors
// * "Add Node" should use separate input window for data
// * Use "Input" area to directly updates nodes
// * Drop-down menu to show existing JSON files in directory, for load/save
// * Edges may have descriptions also
// * Load / save graph as JSON
// * Save JSON to server-side
// * Allow bi-lingual labels
// * Allow saving different graphs with filenames
// * Task status: in progress, done, paused

// For our Project Graph, (* = required)
// each Node may contain attributes:  *id, *labelEN, labelZH, status, details, authors[], votes[]
// each Edge may contains attributes:  *from, *to, label

/****** Initial data  ******/

var nodes = new vis.DataSet([
{ id: 0, labelEN: "Root", color: 'cyan' },
{ id: 1, labelEN: "Node 1" }
]);

var edges = new vis.DataSet([
{ from: 1, to: 0 },
]);

// Note: graph data "nodes" and "edges" are already loaded from "ProjectGraph.js"
var data = {
nodes: nodes,
edges: edges
};

// Sound files
const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');
const techFail = new Audio('sounds/tech-fail.wav');

// Default language ("ZH" or "EN") ?
// Remove all references to an element with id "lang". Only keep the lang variable.
// Initialize lang to "EN" unless there is a ?lang=... directive in the URL.
var lang = "EN";
const url = window.location.href;
var regex = new RegExp('[?&]lang=([a-zA-Z]{2})');
var params = regex.exec(url);
if (params && params[1]) {
    lang = params[1].toUpperCase();
}

// Project name handling - similar to project-map.js
// Get URL parameter for project name (if any)
const urlParams = new URLSearchParams(window.location.search);
const projectNameParam = urlParams.get('projectName');

// Determine project name with proper precedence:
// 1. URL/filename parameter (primary source for project-graph)
// 2. Default fallback
let projectName = projectNameParam || 'project-graph';

// Update page title and header
document.title = `${projectName} - Project Graph`;
const h1Element = document.getElementsByTagName('h1')[0];
if (h1Element) {
  h1Element.innerHTML = projectName;
}

nodeColors = {
	"in-progress": "#FCC",
	"finished": "#CFC",
	"paused": "#CCC",
	"research": "#FF0",
	};

// Options for Vis.js network
var options = {
	nodes: {
		// font: { color: 'white' },
		font: { size: 16 },
		color: '#CDF',
		shape: 'box',
		widthConstraint: { minimum: 30, maximum: 150 },
	},
	edges: {
		arrows: {
			to: { enabled: true }
		},
		color: {
			color: '#AAA',
			highlight:'#000',
			inherit: false,
			opacity:1.0
		}
	},
	interaction: {
		hover: true,
		dragNodes: true, // Enable node repositioning (restore node dragging)
		dragView: true    // <--- Restore panning so Vis.js drag events fire
	},
	physics: {
		enabled: true // <--- Enable physics (elastic layout) at all times
	}
};

var viz = document.getElementById("viz");
var network = new vis.Network(viz, data, options);

var pane = document.getElementById("side-pane");
pane.style.display = "none";

// Initialize viz size properly without needing to toggle side pane
viz.style.height = window.innerHeight - 40 + "px";
viz.style.width = window.innerWidth - 16 + "px";

// --- Drag-to-link with Ctrl key implementation ---
let dragSourceNodeId = null;
let dragToLinkActive = false;

// Highlight hovered node for feedback (use bold font, not color)
network.on("hoverNode", function(params) {
	nodes.update({ id: params.node, font: { bold: true } });
});
network.on("blurNode", function(params) {
	nodes.update({ id: params.node, font: { bold: false } });
});

// Listen for mousedown to start drag-to-link if Ctrl is pressed
viz.addEventListener('mousedown', function(e) {
	const rect = viz.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	const nodeId = network.getNodeAt({x, y});
	if (nodeId !== undefined && e.ctrlKey) {
		dragSourceNodeId = nodeId;
		dragToLinkActive = true;
		network.body.container.style.cursor = "crosshair";
		// Prevent panning and node dragging when Ctrl is held and node is clicked
		network.setOptions({ interaction: { ...options.interaction, dragView: false, dragNodes: false } });
		// Disable physics for the whole network during drag-to-link
		network.setOptions({ physics: { enabled: false } });
		e.preventDefault();
		return false;
	}
});

// Listen for mousemove to highlight possible target node (use bold font, not color)
viz.addEventListener('mousemove', function(e) {
	if (dragToLinkActive && dragSourceNodeId !== null) {
		const rect = viz.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const targetNodeId = network.getNodeAt({x, y});
		// Optionally highlight target node (not source)
		if (targetNodeId !== undefined && targetNodeId !== dragSourceNodeId) {
			nodes.update({ id: targetNodeId, font: { bold: true } });
		}
	}
});

// Listen for mouseup to finish drag-to-link
viz.addEventListener('mouseup', function(e) {
	if (dragToLinkActive && dragSourceNodeId !== null) {
		const rect = viz.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const targetNodeId = network.getNodeAt({x, y});
		if (targetNodeId !== undefined && targetNodeId !== dragSourceNodeId) {
			data.edges.add({ from: dragSourceNodeId, to: targetNodeId });
			techClick2.play();
		}
		dragSourceNodeId = null;
		dragToLinkActive = false;
		network.body.container.style.cursor = "";
		// Restore panning and node dragging after drag-to-link
		network.setOptions({ interaction: { ...options.interaction, dragView: true, dragNodes: true } });
		// Re-enable physics for the network
		network.setOptions({ physics: { enabled: true } });
	}
});
// --- End of Drag-to-link with Ctrl key implementation ---


// Track the currently selected node and edge for deletion
let selectedNodeId = null;
let selectedEdgeId = null;

// Context menu functionality for node status selection
let contextMenuNodeId = null;

// Context menu functionality for edge type selection
let contextMenuEdgeId = null;

// Hide context menu when clicking elsewhere
document.addEventListener('click', function(e) {
    const nodeContextMenu = document.getElementById('node-context-menu');
    const edgeContextMenu = document.getElementById('edge-context-menu');
    const canvasContextMenu = document.getElementById('canvas-context-menu');
    
    if (nodeContextMenu && !nodeContextMenu.contains(e.target)) {
        nodeContextMenu.style.display = 'none';
        contextMenuNodeId = null;
    }
    
    if (edgeContextMenu && !edgeContextMenu.contains(e.target)) {
        edgeContextMenu.style.display = 'none';
        contextMenuEdgeId = null;
    }
    
    if (canvasContextMenu && !canvasContextMenu.contains(e.target)) {
        canvasContextMenu.style.display = 'none';
    }
});

// Hide context menu on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const nodeContextMenu = document.getElementById('node-context-menu');
        const edgeContextMenu = document.getElementById('edge-context-menu');
        const canvasContextMenu = document.getElementById('canvas-context-menu');
        
        if (nodeContextMenu) {
            nodeContextMenu.style.display = 'none';
            contextMenuNodeId = null;
        }
        
        if (edgeContextMenu) {
            edgeContextMenu.style.display = 'none';
            contextMenuEdgeId = null;
        }
        
        if (canvasContextMenu) {
            canvasContextMenu.style.display = 'none';
        }
    }
});

// Listen for Delete key to delete selected node or edge with confirmation
window.addEventListener('keydown', function(e) {
	if (e.key === 'Delete' || e.key === 'Del') {
		if (selectedNodeId !== null) {
			if (confirm('Delete node #' + selectedNodeId + ' and all its edges?')) {
				data.nodes.remove({id: selectedNodeId});
				selectedNodeId = null;
				techClick2.play();
			}
			e.preventDefault();
		} else if (selectedEdgeId !== null) {
			if (confirm('Delete edge #' + selectedEdgeId + '?')) {
				data.edges.remove({id: selectedEdgeId});
				selectedEdgeId = null;
				techClick2.play();
			}
			e.preventDefault();
		}
	}
});

// Prepare modal window for user to input filenames etc
const json_modal = document.getElementById("JSON_modal");
const  git_modal = document.getElementById("Git_modal");
const node_modal = document.getElementById("Node_modal");
const help_modal = document.getElementById("Help_modal");

// Make functions global
window.close_git_modal = close_git_modal;
window.close_node_modal = close_node_modal;
window.close_help_modal = close_help_modal;
window.verifyTreeIgnoringAuxEdges = verifyTreeIgnoringAuxEdges;
window.changeStatusFromContextMenu = changeStatusFromContextMenu;
window.changeEdgeTypeFromContextMenu = changeEdgeTypeFromContextMenu;
window.openNodePage = openNodePage;
window.openNodePageFromSidePane = openNodePageFromSidePane;
window.saveGraphToDatabase = saveGraphToDatabase;

// Auto-load project graph from URL parameter
function autoLoadProjectGraph() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectNameParam = urlParams.get('projectName');
  
  if (projectNameParam) {
    // Construct the JSON file path
    const jsonFilePath = `/loadJSON/project-graphs/${encodeURIComponent(projectNameParam)}.json`;
    
    // Try to fetch and load the JSON file
    $.ajax({
      method: "GET",
      url: jsonFilePath,
      cache: false,
      success: function(data0) {
        if (data0 && data0.nodes && data0.edges) {
          // Destroy existing network if it exists
          if (typeof network !== 'undefined' && network) {
            network.destroy();
          }
          
          // Load the new data
          nodes = new vis.DataSet(data0.nodes);
          edges = new vis.DataSet(data0.edges);
          data.nodes = nodes;
          data.edges = edges;
          init_nodes();
          network = new vis.Network(viz, data, options);
          update_node_index();
          network.once('stabilized', function() {
            setupNetworkEvents(network);
          });
          
          // Update project name and UI
          projectName = projectNameParam;
          document.title = `${projectName} - Project Graph`;
          const h1Element = document.getElementsByTagName('h1')[0];
          if (h1Element) {
            h1Element.innerHTML = projectName;
          }
          
          console.log(`Auto-loaded project graph: ${projectNameParam}`);
        }
      },
      error: function(xhr, status, error) {
        console.warn(`Could not auto-load project graph for "${projectNameParam}":`, status, error);
        // Fall back to default behavior - empty graph will be shown
      }
    });
  }
}

// Call auto-load when DOM is ready
$(document).ready(function() {
  autoLoadProjectGraph();
  // Initialize Chinese name section visibility
  updateChineseNameSectionVisibility("");
});

