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

// Returns a node's label in the language in 'lang' variable
function get_label_in_lang(node) {
	return (lang == 'ZH' && ('labelZH' in node)) ? node.labelZH : node.labelEN;
	}

nodeColors = {
	"in-progress": "#FCC",
	"finished": "#CFC",
	"paused": "#CCC",
	"research": "#FF0",
	};

// Initialize node labels to be in default language; set node colors
function init_nodes() {
	nodes.forEach((node) => {
		node.label = get_label_in_lang(node);
		node.color = ('status' in node) ? nodeColors[node.status] : nodeColors['in-progress'];
		});
	nodes.updateOnly({ id: 0, color: 'cyan' });
	}
init_nodes();

// set node_index to be maximal value + 1, used for adding nodes
var node_index = 0;
function update_node_index() {
	nodes.forEach((n) => {
		if (n.id > node_index)
			node_index = n.id;
		})
	node_index++;
	}
update_node_index();

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

// Side pane starts hidden - no need to auto-click the button
// document.getElementById("SidePaneButton").click();

function toggleSidePane() {
	techClick2.play().catch(function (error) {
		// console.log("cannot play sound without user click first");
		});
	viz.style.height = window.innerHeight -40 + "px";
	viz.style.width = window.innerWidth -16 + "px";

	if (pane.style.display == "none") {
		pane.style.display = "inline-block";
		document.getElementById("SidePaneButton2").style.display = "none";
		}
	else {
		pane.style.display = "none";
		document.getElementById("SidePaneButton2").style.display = "inline-block";
		}
	}

// Make sure toggleSidePane is global
window.toggleSidePane = toggleSidePane;

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

// --- Tree structure violation highlighting ---
function highlightTreeViolations() {
    // Store manually set auxiliary edges before resetting
    const manuallyAuxEdges = new Set();
    edges.forEach(function(edge) {
        const dashes = edge.dashes;
        if (dashes === true) {
            manuallyAuxEdges.add(edge.id);
        }
    });

    // Reset only non-manually-auxiliary edges to default
    edges.forEach(function(edge) {
        if (!manuallyAuxEdges.has(edge.id)) {
            edges.update({ id: edge.id, color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }, dashes: false });
        }
    });

    // 1. Build outgoing edge map: nodeId -> [edge]
    const outgoingMap = {};
    edges.forEach(function(edge) {
        if (!outgoingMap[edge.from]) outgoingMap[edge.from] = [];
        outgoingMap[edge.from].push(edge);
    });

    // 2. Mark nodes with multiple outgoing edges (multiple parents)
    const multiParentEdges = new Set();
    for (const from in outgoingMap) {
        if (from != '0' && outgoingMap[from].length > 1) {
            outgoingMap[from].forEach(edge => multiParentEdges.add(edge.id));
        }
    }

    // 3. For each node (except root), follow parent links up to root
    //    Mark all edges on valid paths as treeEdges
    const treeEdges = new Set();
    const cycleEdges = new Set();
    const notConnectedEdges = new Set();
    const nodeIds = nodes.getIds().map(String);
    for (const nodeId of nodeIds) {
        if (nodeId === '0') continue; // skip root
        let current = nodeId;
        const path = [];
        const visited = new Set();
        let foundRoot = false;
        while (true) {
            if (visited.has(current)) {
                // Cycle detected
                for (const e of path) cycleEdges.add(e.id);
                break;
            }
            visited.add(current);
            const outs = outgoingMap[current];
            if (!outs || outs.length === 0) {
                // Dead end, not connected to root
                for (const e of path) notConnectedEdges.add(e.id);
                break;
            }
            // Only follow the first outgoing edge (if multiple, all are already marked as multi-parent)
            const edge = outs[0];
            path.push(edge);
            if (edge.to == '0') {
                // Reached root
                for (const e of path) treeEdges.add(e.id);
                foundRoot = true;
                break;
            }
            current = String(edge.to);
        }
    }

    // 4. Highlight violations as auxiliary edges (but preserve manually set auxiliary edges)
    edges.forEach(function(edge) {
        if (!manuallyAuxEdges.has(edge.id) && (multiParentEdges.has(edge.id) || cycleEdges.has(edge.id) || notConnectedEdges.has(edge.id) || !treeEdges.has(edge.id))) {
            edges.update({ id: edge.id, color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }, dashes: true });
        }
    });
}
// --- End tree structure violation highlighting ---

// Only call highlightTreeViolations after add/remove edge/node, but not on load
edges.on("add", function() { 
    // Add a small delay to ensure the edge is fully added before highlighting
    setTimeout(highlightTreeViolations, 10); 
});
edges.on("remove", function() { highlightTreeViolations(); });
nodes.on("remove", function() { highlightTreeViolations(); });

// Track the currently selected node and edge for deletion
let selectedNodeId = null;
let selectedEdgeId = null;

// Set edge color from radio button
function setEdgeColor(color) {
    if (selectedEdgeId !== null) {
        if (color === 'normal') {
            edges.update({ id: selectedEdgeId, color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }, dashes: false });
        } else if (color === 'aux') {
            edges.update({ id: selectedEdgeId, color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }, dashes: true });
        }
    }
}

// On clicking a node or edge on Vis.js canvas
function onClick(params) {
    if (dragToLinkActive) return;
    if (params['nodes'].length > 0) {
        selectedNodeId = params['nodes'][0];
        selectedEdgeId = null;
        const node = data.nodes.get(selectedNodeId);
        if (node) {
            const taskNameEN = document.getElementById("TaskNameEN");
            const taskNameZH = document.getElementById("TaskNameZH");
            const details = document.getElementById("Details");
            
            if (taskNameEN) taskNameEN.value = node.labelEN || "";
            if (taskNameZH) taskNameZH.value = node.labelZH || "";
            updateChineseNameSectionVisibility(node.labelZH);
            if (details) details.value = node.details || "";
            
            // Update status radio buttons
            const statuses = ["in-progress", "finished", "paused", "research"];
            statuses.forEach(status => {
                const radio = document.getElementById(status);
                if (radio) radio.checked = (node.status === status);
            });
        }
        
        // Show node-specific elements, hide edge-specific elements
        const nodeElements = document.getElementById("nodeElements");
        const edgeElements = document.getElementById("edgeElements");
        if (nodeElements) nodeElements.style.display = "block";
        if (edgeElements) edgeElements.style.display = "none";
        
        techClick.play();
    } else if (params['edges'].length > 0) {
        selectedEdgeId = params['edges'][0];
        selectedNodeId = null;
        const edge = data.edges.get(selectedEdgeId);
        if (edge) {
            const edgeNameEN = document.getElementById("EdgeNameEN");
            if (edgeNameEN) edgeNameEN.value = edge.label || "";
            
            // Show edge-specific elements, hide node-specific elements
            const nodeElements = document.getElementById("nodeElements");
            const edgeElements = document.getElementById("edgeElements");
            if (nodeElements) nodeElements.style.display = "none";
            if (edgeElements) edgeElements.style.display = "block";
            
            const dashes = edge.dashes === true;
            const edgeColorAux = document.getElementById("edgeColorAux");
            const edgeColorNormal = document.getElementById("edgeColorNormal");
            
            if (dashes) {
                if (edgeColorAux) edgeColorAux.checked = true;
                if (edgeColorNormal) edgeColorNormal.checked = false;
            } else {
                if (edgeColorNormal) edgeColorNormal.checked = true;
                if (edgeColorAux) edgeColorAux.checked = false;
            }
        }
        
        // Show edge-specific elements, hide node-specific elements
        const nodeElements = document.getElementById("nodeElements");
        const edgeElements = document.getElementById("edgeElements");
        if (nodeElements) nodeElements.style.display = "none";
        if (edgeElements) edgeElements.style.display = "block";
        
        techClick.play();
    } else {
        selectedNodeId = null;
        selectedEdgeId = null;
        
        // Show both node and edge elements when nothing is selected
        const nodeElements = document.getElementById("nodeElements");
        const edgeElements = document.getElementById("edgeElements");
        if (nodeElements) nodeElements.style.display = "block";
        if (edgeElements) edgeElements.style.display = "none"; // Hide edge elements by default
        
        // Optionally clear the side pane fields
        const taskNameEN = document.getElementById("TaskNameEN");
        const taskNameZH = document.getElementById("TaskNameZH");
        const details = document.getElementById("Details");
        const edgeNameEN = document.getElementById("EdgeNameEN");
        
        if (taskNameEN) taskNameEN.value = "";
        if (taskNameZH) taskNameZH.value = "";
        updateChineseNameSectionVisibility("");
        if (details) details.value = "";
        if (edgeNameEN) edgeNameEN.value = "";
    }
}

// Context menu functionality for node status selection
let contextMenuNodeId = null;

// Context menu functionality for edge type selection
let contextMenuEdgeId = null;

// Helper function to set up network event listeners
function setupNetworkEvents(network) {
    // Helper function to calculate distance from a point to a line segment
    function distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            // Line segment is actually a point
            return Math.sqrt(A * A + B * B);
        }
        
        let param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    network.on("click", onClick);
    
    // Right-click event handler for nodes
    network.on("oncontext", function(params) {
        params.event.preventDefault(); // Prevent default browser context menu
        
        // Try node detection first (prioritize nodes over edges)
        let nodeId = null;
        if (params.nodes.length > 0) {
            nodeId = params.nodes[0];
        } else {
            // Alternative method: use getNodeAt with canvas coordinates
            try {
                const nodeAtPosition = network.getNodeAt(params.pointer);
                if (nodeAtPosition !== undefined) {
                    nodeId = nodeAtPosition;
                }
            } catch (error) {
                console.warn('getNodeAt failed in oncontext, network may not be ready:', error);
            }
        }
        
        // Check for edges only if no node was found
        let edgeId = null;
        if (nodeId === null && params.edges.length > 0) {
            edgeId = params.edges[0];
        } else if (nodeId === null) {
            // No edge detected by vis.js - try geometric fallback
            let closestEdge = null;
            let minDistance = Infinity;
            const scale = network.getScale();
            const toleranceInWorldUnits = 20 / scale; // Convert pixel tolerance to world units
            
            edges.forEach(function(edge) {
                try {
                    const fromPos = network.getPositions([edge.from])[edge.from];
                    const toPos = network.getPositions([edge.to])[edge.to];
                    
                    if (fromPos && toPos) {
                        // Use mouse position in world coordinates
                        const clickWorldPos = network.DOMtoCanvas(params.pointer.DOM);
                        
                        // Calculate distance from click point to edge line using world coordinates
                        const distance = distanceToLineSegment(
                            clickWorldPos,
                            fromPos,
                            toPos
                        );
                        
                        if (distance < toleranceInWorldUnits && distance < minDistance) {
                            minDistance = distance;
                            closestEdge = edge;
                        }
                    }
                } catch (error) {
                    // Skip this edge if there's an error getting positions
                }
            });
            
            if (closestEdge) {
                edgeId = closestEdge.id;
            }
        }
        
        // Hide any open context menus first
        const nodeContextMenu = document.getElementById('node-context-menu');
        const edgeContextMenu = document.getElementById('edge-context-menu');
        const canvasContextMenu = document.getElementById('canvas-context-menu');
        if (nodeContextMenu) nodeContextMenu.style.display = 'none';
        if (edgeContextMenu) edgeContextMenu.style.display = 'none';
        if (canvasContextMenu) canvasContextMenu.style.display = 'none';
        
        if (nodeId !== null) {
            // Right-clicked on a node (prioritized)
            contextMenuNodeId = nodeId;
            contextMenuEdgeId = null;
            const node = data.nodes.get(contextMenuNodeId);
            
            if (node) {
                // Update radio buttons to reflect current node status
                const statusRadios = document.querySelectorAll('#node-context-menu input[name="context-status"]');
                statusRadios.forEach(radio => {
                    radio.checked = (radio.value === (node.status || 'in-progress'));
                });
                
                // Show node context menu at mouse position
                if (nodeContextMenu) {
                    nodeContextMenu.style.display = 'block';
                    nodeContextMenu.style.left = params.event.clientX + 'px';
                    nodeContextMenu.style.top = params.event.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = nodeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        nodeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        nodeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        } else if (edgeId !== null) {
            // Right-clicked on an edge (only if no node found)
            contextMenuEdgeId = edgeId;
            contextMenuNodeId = null;
            const edge = data.edges.get(contextMenuEdgeId);
            
            if (edge) {
                // Update radio buttons to reflect current edge type
                const typeRadios = document.querySelectorAll('#edge-context-menu input[name="context-edge-type"]');
                const isAuxiliary = edge.dashes === true;
                typeRadios.forEach(radio => {
                    radio.checked = (radio.value === (isAuxiliary ? 'auxiliary' : 'normal'));
                });
                
                // Show edge context menu at mouse position
                if (edgeContextMenu) {
                    edgeContextMenu.style.display = 'block';
                    edgeContextMenu.style.left = params.event.clientX + 'px';
                    edgeContextMenu.style.top = params.event.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = edgeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        edgeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        edgeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        } else {
            // Right-clicked on empty space - reset context menu state
            contextMenuNodeId = null;
            contextMenuEdgeId = null;
        }
    });

    // Alternative right-click handler using direct canvas event
    const canvas = network.body.container;
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Hide any open context menus first
        const nodeContextMenu = document.getElementById('node-context-menu');
        const edgeContextMenu = document.getElementById('edge-context-menu');
        const canvasContextMenu = document.getElementById('canvas-context-menu');
        if (nodeContextMenu) nodeContextMenu.style.display = 'none';
        if (edgeContextMenu) edgeContextMenu.style.display = 'none';
        if (canvasContextMenu) canvasContextMenu.style.display = 'none';
        
        let nodeId = null;
        try {
            // Try to get node at position, with error handling
            nodeId = network.getNodeAt({x: x, y: y});
        } catch (error) {
            console.warn('getNodeAt failed, network may not be ready:', error);
            return;
        }
        
        if (nodeId !== undefined) {
            // Found a node
            contextMenuNodeId = nodeId;
            contextMenuEdgeId = null;
            const node = data.nodes.get(contextMenuNodeId);
            
            if (node) {
                // Update radio buttons to reflect current node status
                const statusRadios = document.querySelectorAll('#node-context-menu input[name="context-status"]');
                statusRadios.forEach(radio => {
                    radio.checked = (radio.value === (node.status || 'in-progress'));
                });
                
                // Show node context menu at mouse position
                if (nodeContextMenu) {
                    nodeContextMenu.style.display = 'block';
                    nodeContextMenu.style.left = e.clientX + 'px';
                    nodeContextMenu.style.top = e.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = nodeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        nodeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        nodeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        } else {
            // No node found, try to find an edge by checking if click is near any edge
            let closestEdge = null;
            let minDistance = 15; // world coordinate units tolerance for edge detection
            
            // Get current zoom scale for conversion
            const scale = network.getScale();
            const pixelToWorldRatio = 1 / scale;
            const toleranceInWorldUnits = 20 * pixelToWorldRatio; // Convert pixel tolerance to world units
            
            edges.forEach(function(edge) {
                try {
                    const fromPos = network.getPositions([edge.from])[edge.from];
                    const toPos = network.getPositions([edge.to])[edge.to];
                    
                    if (fromPos && toPos) {
                        // Convert canvas coordinates to world coordinates for consistent comparison
                        const clickWorldPos = network.DOMtoCanvas({x: x, y: y});
                        
                        // Calculate distance from click point to edge line using world coordinates
                        const distance = distanceToLineSegment(
                            clickWorldPos,
                            fromPos,
                            toPos
                        );
                        
                        if (distance < toleranceInWorldUnits && distance < minDistance) {
                            minDistance = distance;
                            closestEdge = edge;
                        }
                    }
                } catch (error) {
                    // Skip this edge if there's an error getting positions
                }
            });
            
            // console.log('Closest edge found:', closestEdge ? closestEdge.id : 'none');
            
            if (closestEdge) {
                // Found an edge
                contextMenuEdgeId = closestEdge.id;
                contextMenuNodeId = null;
                
                // Update radio buttons to reflect current edge type
                const typeRadios = document.querySelectorAll('#edge-context-menu input[name="context-edge-type"]');
                const isAuxiliary = closestEdge.dashes === true;
                typeRadios.forEach(radio => {
                    radio.checked = (radio.value === (isAuxiliary ? 'auxiliary' : 'normal'));
                });
                
                // Show edge context menu at mouse position
                if (edgeContextMenu) {
                    edgeContextMenu.style.display = 'block';
                    edgeContextMenu.style.left = e.clientX + 'px';
                    edgeContextMenu.style.top = e.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = edgeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        edgeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        edgeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            } else {
                // No node or edge found - show canvas context menu
                contextMenuNodeId = null;
                contextMenuEdgeId = null;
                
                // Show canvas context menu at mouse position
                const canvasContextMenu = document.getElementById('canvas-context-menu');
                if (canvasContextMenu) {
                    canvasContextMenu.style.display = 'block';
                    canvasContextMenu.style.left = e.clientX + 'px';
                    canvasContextMenu.style.top = e.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = canvasContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        canvasContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        canvasContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        }
    });
}

// Set up events for the initial network - wait for stabilization
network.once('stabilized', function() {
    setupNetworkEvents(network);
});

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

// Handle status change from context menu
function changeStatusFromContextMenu(newStatus) {
    if (contextMenuNodeId !== null) {
        const node = data.nodes.get(contextMenuNodeId);
        if (node) {
            // Update node status and color
            data.nodes.update({
                id: contextMenuNodeId,
                status: newStatus,
                color: nodeColors[newStatus]
            });
            
            // If this node is also selected in the side pane, update the side pane radio buttons
            if (selectedNodeId === contextMenuNodeId) {
                const sideRadio = document.getElementById(newStatus);
                if (sideRadio) sideRadio.checked = true;
            }
            
            techClick2.play().catch(() => {}); // Ignore audio errors
        }
        
        // Hide context menu
        const contextMenu = document.getElementById('node-context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        contextMenuNodeId = null;
    }
}

// Handle edge type change from context menu
function changeEdgeTypeFromContextMenu(newType) {
    if (contextMenuEdgeId !== null) {
        const edge = data.edges.get(contextMenuEdgeId);
        if (edge) {
            // Update edge type (normal vs auxiliary)
            const isAuxiliary = (newType === 'auxiliary');
            data.edges.update({
                id: contextMenuEdgeId,
                dashes: isAuxiliary,
                color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }
            });
            
            // If this edge is also selected in the side pane, update the side pane radio buttons
            if (selectedEdgeId === contextMenuEdgeId) {
                if (isAuxiliary) {
                    document.getElementById("edgeColorAux").checked = true;
                    document.getElementById("edgeColorNormal").checked = false;
                } else {
                    document.getElementById("edgeColorNormal").checked = true;
                    document.getElementById("edgeColorAux").checked = false;
                }
            }
            
            techClick2.play().catch(() => {}); // Ignore audio errors
        }
        
        // Hide context menu
        const edgeContextMenu = document.getElementById('edge-context-menu');
        if (edgeContextMenu) {
            edgeContextMenu.style.display = 'none';
        }
        contextMenuEdgeId = null;
    }
}

// Open node page for the context menu node
function openNodePage() {
    if (contextMenuNodeId !== null) {
        // Open node-page.html in a new tab with the node ID as a URL parameter
        window.open(`node-page.html?id=${contextMenuNodeId}`, '_blank');
    }
    
    // Hide context menu
    const contextMenu = document.getElementById('node-context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    contextMenuNodeId = null;
}

function openNodePageFromSidePane() {
    if (selectedNodeId !== null) {
        // Open node-page.html in a new tab with the node ID as a URL parameter
        window.open(`node-page.html?id=${selectedNodeId}`, '_blank');
    } else {
        alert('Please select a node first');
    }
}

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

function addAuthor(event) {
	techClick2.play();
	event.currentTarget.value = "";
	}

// Prepare modal window for user to input filenames etc
const json_modal = document.getElementById("JSON_modal");
const  git_modal = document.getElementById("Git_modal");
const node_modal = document.getElementById("Node_modal");
const help_modal = document.getElementById("Help_modal");

async function addNode() {
	// Open modal window to ask for Node labels:
	node_modal.style.display = "block";
	techClick2.play();
	document.getElementById("node_modal_OK").onclick = function() {
		const tasknameEN = document.getElementById("nameEN").value;
		if (tasknameEN == "" || tasknameEN == "???") {
			document.getElementById("nameEN").value = "???";
			techFail.play();
			return;
		}
		const tasknameZH = document.getElementById("nameZH").value;
		const taskname = ((lang == 'ZH') && (tasknameZH != "")) ? tasknameZH : tasknameEN;
		data.nodes.add({id : node_index,
			label: taskname,
			labelEN: tasknameEN,
			...(tasknameZH != "") && { labelZH: tasknameZH },
			color: nodeColors['in-progress'],
		});
		if (selectedNodeId !== null) {
			data.edges.add({from: node_index, to: selectedNodeId});
		}
		console.log("Added node", tasknameEN, "to node #", selectedNodeId);
		node_index++;
		node_modal.style.display = "none"; // close modal window
		techClick2.play();
		// No need to manually call network.stabilize() or toggle physics
	}
}

async function delNode() {
	data.nodes.remove({id: selectedNodeId});
	console.log("Deleted node #", selectedNodeId);
	techClick2.play();
	}

async function delEdge() {
	data.edges.remove({id: selectedEdgeId});
	console.log("Deleted edge #", selectedEdgeId);
	techClick2.play();
	}

async function changeStatus(radio) {
	data.nodes.updateOnly({ id: selectedNodeId,
		status: radio.value,
		color: nodeColors[radio.value],
		});
	techClick2.play();
	}

async function changeTaskNameZH(input) {
	data.nodes.updateOnly({ id: selectedNodeId,
		labelZH: input.value,
		...(lang == "ZH") && {label: input.value},
		});
	// Update Chinese name section visibility
	updateChineseNameSectionVisibility(input.value);
	}

async function changeTaskNameEN(input) {
	// Check if label defaults to English because there are no other-language labels:
	const default_EN = !('labelZH' in nodes.get(selectedNodeId));
	data.nodes.updateOnly({ id: selectedNodeId,
		labelEN: input.value,
		...(lang == "EN" || default_EN) && {label: input.value},
		});
	}

async function changeDetails(input) {
	data.nodes.updateOnly({ id: selectedNodeId,
		details: input.value,
		});
	}

async function changeEdgeEN(input) {
	data.edges.updateOnly({ id: selectedEdgeId,
		label: input.value,
		});
	}

async function clearGraph() {
	network.destroy();
	nodes = new vis.DataSet([ {id: 0, label: "ROOT", labelEN: "ROOT", color: "cyan"} ]);
	edges = new vis.DataSet([]);
	data.nodes = nodes;
	data.edges = edges;
	network = new vis.Network(viz, data, options);
	update_node_index();
	network.once('stabilized', function() {
		setupNetworkEvents(network);
	});
	techClick2.play();
	}

// Populate dropdown menu with JSON file found in directory
function listJSONfiles() {
	let dropDown = document.getElementById("JSONdropDown");
	dropDown.replaceChildren();		// clear all options

	function addOption(value, text) {
		const option = document.createElement("option");
		option.value = value;
		option.text = text;
		dropDown.appendChild(option);
		}

	addOption("none", "---");
	$.ajax({
		method: "GET",
		url: "/fileList/",
		success: function (files) {
			// console.log(typeof(files), files);
			files.forEach( file => {
				if (!file.endsWith('.json'))
					return;
				file = file.slice(0,-5);
				addOption(file, file);
				} );
			} });
	}

// Check if user is local or remote
function ifRemoteUser() {
	if (location.hostname === "localhost" ||
		location.hostname === "127.0.0.1")
		return;
	const div = document.getElementById("remote-user");
	div.style.display = "block";
	div.childNodes[1].innerText = "You're on machine: " + location.hostname;
	}

async function saveJSONgraph() {
    // For all nodes:
    var str = "{\"nodes\":[";
    nodes.forEach(function(n) {
        const nodeCopy = Object.assign({}, n);
        delete nodeCopy['label'];		// only save labelEN and labelZH
        str += JSON.stringify(nodeCopy);
        str += ",";
        });
    str = str.slice(0,-1) + "],";

    // For all edges:
    str += "\"edges\":[";
    edges.forEach(function(e) {
        const edgeCopy = Object.assign({}, e);
        // Keep the edge ID and color information
        str += JSON.stringify(edgeCopy);
        str += ",";
        });
    str = str.slice(0,-1) + "]}";
    // console.log(str);

    // Open modal window and ask for filename
    json_modal.style.display = "block";
    techClick2.play();
    listJSONfiles(); // Direct call - simple and clear
    ifRemoteUser();
    document.getElementById("json_modal_OK").onclick = function() {
        var name = document.getElementById("JSONdropDown").value;
        if (name === "none")
            name = document.getElementById("JSONfileName").value;

        const remoteUser = document.querySelector(
            'input[name="remoteUser"]:checked');
        const tag = remoteUser ? remoteUser.value : "";
        if (name.endsWith(".json"))
            name = name.slice(0,-5) + tag + ".json";
        else if (name.endsWith(tag))
            name = name + ".json";
        else
            name = name + tag + ".json";
        console.log("Saving file:", name);
        $.ajax({
            method: "POST",
            url: "/saveJSON/project-graphs/" + name,
            data: str,
            contentType: "application/json",
            success: function(resp) {
                console.log("Save successful:", resp);
                alert("File saved successfully!");
            },
            error: function(xhr, status, error) {
                console.error("Save failed:", status, error, xhr.responseText);
                alert("Save failed: " + error);
            }
            });

        json_modal.style.display = "none";		// close window
        techClick2.play();
        };
    
    // Also handle Enter key in filename input
    document.getElementById("JSONfileName").addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            document.getElementById("json_modal_OK").click();
        }
    });
	}

async function loadJSONgraph() {
    // Open modal window and ask for filename
    json_modal.style.display = "block";
    techClick2.play();
    listJSONfiles(); // Direct call - simple and clear
    ifRemoteUser();
    
    // Set up the OK button to handle loading
    document.getElementById("json_modal_OK").onclick = function() {
        var name = document.getElementById("JSONdropDown").value;
        if (name === "none")
            name = document.getElementById("JSONfileName").value;

        const remoteUser = document.querySelector(
            'input[name="remoteUser"]:checked');
        const tag = remoteUser ? remoteUser.value : "";
        if (name.endsWith(".json"))
            name = name.slice(0,-5) + tag + ".json";
        else if (name.endsWith(tag))
            name = name + ".json";
        else
            name = name + tag + ".json";
        
        console.log("Loading file:", name);
        $.ajax({
            method: "GET",
            url: "/loadJSON/project-graphs/" + name,
            cache: false,
            success: function(data0) {
                network.destroy();
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

                // Update project name from loaded filename
                const filenameWithoutExt = name.replace(/\.[^/.]+$/, "").replace(/-[a-zA-Z0-9]+$/, ""); // Remove extension and user tag
                projectName = filenameWithoutExt || 'project-graph';
                document.title = `${projectName} - Project Graph`;
                const h1Element = document.getElementsByTagName('h1')[0];
                if (h1Element) {
                  h1Element.innerHTML = projectName;
                }

                json_modal.style.display = "none";
                techClick2.play();
            },
            error: function(xhr, status, error) {
                console.error("Load failed:", status, error, xhr.responseText);
                alert("Load failed: " + error);
            }
        });
    };
    
    // Also handle Enter key in filename input
    document.getElementById("JSONfileName").addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            document.getElementById("json_modal_OK").click();
        }
    });
}

async function saveGitDir() {
	// Currently disallow remote users to write directly to global Git dir
	if (!(location.hostname === "localhost" ||
			 location.hostname === "127.0.0.1"))
		return;

	// For all nodes:
	var str = "{\"nodes\":[";
	nodes.forEach(function(n) {
		const nodeCopy = Object.assign({}, n);
		delete nodeCopy['label'];		// only save labelEN and labelZH
		str += JSON.stringify(nodeCopy);
		str += ",";
		});
	str = str.slice(0,-1) + "],";

	// For all edges:
	str += "\"edges\":[";
	edges.forEach(function(e) {
		const edgeCopy = Object.assign({}, e);
		// Keep the edge ID and color information
		str += JSON.stringify(edgeCopy);
		str += ",";
		});
	str = str.slice(0,-1) + "]}";
	console.log(str);
	techClick2.play();

	// Open modal window and ask for filename
	git_modal.style.display = "block";
	document.getElementById("git_modal_OK").onclick = function() {
		var name = document.getElementById("gitDropDown").value;
		if (name == "none")
			name = document.getElementById("gitFileName").value;
		$.ajax({
			method: "POST",
			url: "/saveDir/" + name,
			data: str,
			success: function(resp) {}
			});

		git_modal.style.display = "none";		// close window
		techClick2.play();
		};
	}

// **** read Project Graph from current Git directory
async function loadGitDir() {
    // Open modal window and ask for filename
    git_modal.style.display = "block";
    // Populate dropdown menu with JSON filenames:
    let dropDown = document.getElementById("gitDropDown");
    dropDown.replaceChildren();		// clear all options
    $.ajax({
        method: "GET",
        url: "/dirList/",
        success: function (dirs) {
            // console.log(typeof(files), files);
            dirs.forEach( dir => {
                var option = document.createElement("option");
                option.value = dir;
                option.text = dir;
                dropDown.appendChild(option);
                } );
            } });
    techClick2.play();
    // Wait for modal window to be clicked OK, then do:
    document.getElementById("git_modal_OK").onclick = function () {

        var dir = document.getElementById("gitDropDown").value;
        if (dir == "none")
            dir = document.getElementById("gitFileName").value;

        $.ajax({
                method: "GET",
                url: "/loadDir/" + dir,
                cache: false,
                success: function(data0) {

            network.destroy();
            nodes = new vis.DataSet(data0.nodes);
            edges = new vis.DataSet(data0.edges);
            data.nodes = nodes;
            data.edges = edges;
            init_nodes();		// set lang, colors, ... from existing data
            network = new vis.Network(viz, data, options);
            update_node_index();
            network.once('stabilized', function() {
                setupNetworkEvents(network);
            });

            git_modal.style.display = "none";		// close window
            techClick2.play();
            } });
        };
    }


// --- Verify tree structure ignoring auxiliary edges ---
function verifyTreeIgnoringAuxEdges() {
    // 1. Collect all non-auxiliary edges
    const nonAuxEdges = [];
    edges.forEach(function(edge) {
        const c = edge.color && edge.color.color ? edge.color.color : '#AAA';
        const dashes = edge.dashes === true;
        if (c !== 'red' && !dashes) nonAuxEdges.push(edge);
    });
    // 2. Build parent map: child -> parent
    const parent = {};
    nonAuxEdges.forEach(function(edge) {
        if (parent[edge.from] !== undefined) {
            // Multiple parents
            alert('Node ' + edge.from + ' has multiple parents (ignoring auxiliary edges). Not a tree.');
            return;
        }
        parent[edge.from] = edge.to;
    });
    // 3. Check for cycles and connectivity
    const nodeIds = nodes.getIds().map(String);
    const visited = new Set();
    let hasCycle = false;
    function dfs(node, ancestors) {
        if (visited.has(node)) return;
        if (ancestors.has(node)) {
            hasCycle = true;
            return;
        }
        ancestors.add(node);
        if (parent[node] !== undefined) {
            dfs(String(parent[node]), ancestors);
        }
        ancestors.delete(node);
        visited.add(node);
    }
    for (const nodeId of nodeIds) {
        if (nodeId === '0') continue;
        dfs(nodeId, new Set());
        if (hasCycle) break;
    }
    if (hasCycle) {
        alert('Cycle detected (ignoring auxiliary edges). Not a tree.');
        return;
    }
    // 4. Check all nodes (except root) are connected to root
    let allToRoot = true;
    for (const nodeId of nodeIds) {
        if (nodeId === '0') continue;
        let cur = nodeId;
        let steps = 0;
        while (cur !== '0' && parent[cur] !== undefined && steps < 1000) {
            cur = String(parent[cur]);
            steps++;
        }
        if (cur !== '0') {
            allToRoot = false;
            break;
        }
    }
    if (!allToRoot) {
        alert('Not all nodes are connected to root (ignoring auxiliary edges). Not a tree.');
        return;
    }
    alert('The graph (ignoring auxiliary edges) is a valid tree rooted at node 0!');
}

// --- Save project data as a JSON "map" file in tree format to server-side project-maps/ directory ---
function saveJSONmap() {
    // Convert graph format to tree format for project-map.js
    
    // 1. Build children map from edges (only non-auxiliary edges)
    const childrenMap = {};
    edges.forEach(function(edge) {
        const dashes = edge.dashes === true;
        if (!dashes) { // Only include tree edges, not auxiliary edges
            if (!childrenMap[edge.to]) childrenMap[edge.to] = [];
            childrenMap[edge.to].push(edge.from);
        }
    });
    
    // 2. Find root node (should be id: 0)
    const rootNode = nodes.get(0);
    if (!rootNode) {
        alert('Error: No root node found (id: 0)');
        return;
    }
    
    // 3. Convert to tree structure recursively
    function convertToTree(nodeId) {
        const node = nodes.get(nodeId);
        if (!node) return null;
        
        const treeNode = {
            id: node.id,
            label: node.labelEN || node.label || `Node ${node.id}`,
            percentage: 0 // Default percentage for project-map.js
        };
        
        // Add bilingual support
        if (node.labelEN) treeNode.labelEN = node.labelEN;
        if (node.labelZH) treeNode.labelZH = node.labelZH;
        
        // Add other properties if they exist
        if (node.status) treeNode.status = node.status;
        if (node.details) treeNode.details = node.details;
        
        // Add children recursively
        const childIds = childrenMap[nodeId] || [];
        treeNode.children = childIds.map(childId => convertToTree(childId)).filter(Boolean);
        
        return treeNode;
    }
    
    // 4. Convert starting from root - this becomes the top-level object
    const treeData = convertToTree(0);
    if (!treeData) {
        alert('Error: Could not convert graph to tree format');
        return;
    }
    
    const filename = prompt('Enter filename for the map (without .json):', 'project-name');
    if (!filename) return;
    const jsonStr = JSON.stringify(treeData, null, 2);

    fetch(`/saveJSON/project-maps/${encodeURIComponent(filename)}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr
    })
    .then(r => r.ok ? alert('Map saved to server in tree format!') : r.text().then(t => alert('Error: ' + t)))
    .catch(e => alert('Network error: ' + e));
}

// Close JSON modal
function close_json_modal() {
    document.getElementById("JSON_modal").style.display = "none";
}
window.close_json_modal = close_json_modal;

// Close modal functions
function close_git_modal() {
    document.getElementById("Git_modal").style.display = "none";
}

function close_node_modal() {
    document.getElementById("Node_modal").style.display = "none";
}

function close_help_modal() {
    document.getElementById("Help_modal").style.display = "none";
}

// Make functions global
window.close_git_modal = close_git_modal;
window.close_node_modal = close_node_modal;
window.close_help_modal = close_help_modal;
window.verifyTreeIgnoringAuxEdges = verifyTreeIgnoringAuxEdges;
window.changeStatusFromContextMenu = changeStatusFromContextMenu;
window.changeEdgeTypeFromContextMenu = changeEdgeTypeFromContextMenu;
window.openNodePage = openNodePage;
window.openNodePageFromSidePane = openNodePageFromSidePane;

// Language switching function
function switchLang() {
  lang = (lang === "EN") ? "ZH" : "EN";
  
  // Update the display of all nodes with new language
  if (typeof nodes !== 'undefined' && nodes) {
    const nodeArray = nodes.get();
    nodeArray.forEach(node => {
      const newLabel = get_label_in_lang(node);
      nodes.update({id: node.id, label: newLabel});
    });
  }
  
  // Update the side panel if a node is selected
  if (selectedNodeId && typeof data !== 'undefined' && data.nodes) {
    const node = data.nodes.get(selectedNodeId);
    if (node) {
      const taskNameEN = document.getElementById("TaskNameEN");
      const taskNameZH = document.getElementById("TaskNameZH");
      
      if (taskNameEN) taskNameEN.value = node.labelEN || "";
      if (taskNameZH) taskNameZH.value = node.labelZH || "";
      updateChineseNameSectionVisibility(node.labelZH);
    }
  }
  
  console.log(`Language switched to: ${lang}`);
}

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

/**
 * Shows or hides the Chinese name section in the side pane based on whether there's content
 * @param {string} chineseValue - The Chinese label value (can be empty or undefined)
 */
function updateChineseNameSectionVisibility(chineseValue) {
    const chineseSection = document.getElementById("chineseNameSection");
    if (chineseSection) {
        // Show the section if there's content, or if we're in Chinese language mode
        const shouldShow = (chineseValue && chineseValue.trim() !== "") || lang === "ZH";
        chineseSection.style.display = shouldShow ? "block" : "none";
    }
}
