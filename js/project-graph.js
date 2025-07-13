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

// --- Global variables for module communication ---
// Track the currently selected node and edge for deletion
let selectedNodeId = null;
let selectedEdgeId = null;

// Context menu functionality for node status selection
let contextMenuNodeId = null;

// Context menu functionality for edge type selection
let contextMenuEdgeId = null;

var pane = document.getElementById("side-pane");
pane.style.display = "none";

// Initialize viz size properly without needing to toggle side pane
viz.style.height = window.innerHeight - 40 + "px";
viz.style.width = window.innerWidth - 16 + "px";

// Set up initial network events after network is fully ready
network.once('afterDrawing', function() {
    // Add a small delay to ensure network is completely ready
    setTimeout(function() {
        if (typeof setupNetworkEvents === 'function') {
            setupNetworkEvents(network);
        }
    }, 100);
});

// --- Drag-to-link functionality moved to network-events.js ---


// --- Event listeners moved to appropriate modules ---


// --- Auto-load functionality moved to file-operations.js ---

// --- Module initialization handled by file-operations.js ---

