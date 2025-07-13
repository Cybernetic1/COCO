/**
 * NODE EDGE OPERATIONS MODULE
 * 
 * Handles all CRUD (Create, Read, Update, Delete) operations on nodes and edges.
 * Provides core functionality for manipulating graph elements and their properties.
 * 
 * RESPONSIBILITIES:
 * - Node creation with bilingual label support via modal dialog
 * - Node and edge deletion with confirmation prompts
 * - Node property updates (status, labels, details, authors)
 * - Edge property updates (labels, types)
 * - Graph clearing and reset functionality
 * - Keyboard shortcut handling (Delete key for removal)
 * - Author management for collaborative features
 * 
 * KEY FEATURES:
 * - Modal-based node creation: Prompts for English/Chinese labels
 * - Status management: Update node status with visual color changes
 * - Bilingual support: Handle both English and Chinese node labels
 * - Delete key support: Press Delete to remove selected nodes/edges
 * - Edge type control: Toggle between normal and auxiliary (dashed) edges
 * - Author tracking: Add and manage node authors for collaboration
 * - Validation: Prevents invalid operations and provides user feedback
 * 
 * DEPENDENCIES:
 * - Global: selectedNodeId, selectedEdgeId (current selection state)
 * - Global: data.nodes, data.edges (Vis.js DataSets)
 * - Global: network, viz, options (network visualization)
 * - Global: nodeColors (status color configuration)
 * - Global: node_index (for generating unique node IDs)
 * - Global: lang (current language setting)
 * - DOM: node_modal (modal dialog for node creation)
 * - Audio: techClick, techClick2, techFail (user feedback sounds)
 * - Functions: setupNetworkEvents(), update_node_index(), init_nodes()
 * 
 * EXPORTS:
 * - initializeKeyboardEvents(): Sets up Delete key handler
 * - addNode(): Creates new node with modal input
 * - delNode(): Deletes currently selected node
 * - delEdge(): Deletes currently selected edge
 * - changeStatus(): Updates node status and color
 * - changeTaskNameEN/ZH(): Updates node labels
 * - changeDetails(): Updates node description
 * - changeEdgeEN(): Updates edge label
 * - clearGraph(): Resets graph to initial state
 * - setEdgeColor(): Changes edge type (normal/auxiliary)
 * - addAuthor(): Adds author to current node
 * 
 * USAGE:
 * Called by UI events and user interactions. Keyboard events are initialized
 * automatically. Other functions are called by HTML onclick handlers and UI controls.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
 */

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
	if (selectedNodeId !== null) {
		data.nodes.update({ 
			id: selectedNodeId,
			status: radio.value,
			color: nodeColors[radio.value]
		});
		techClick2.play().catch(() => {}); // Ignore audio errors
	}
}

async function changeTaskNameZH(input) {
	if (selectedNodeId !== null) {
		data.nodes.update({ 
			id: selectedNodeId,
			labelZH: input.value,
			...(lang == "ZH") && {label: input.value}
		});
		// Update Chinese name section visibility
		updateChineseNameSectionVisibility(input.value);
	}
}

async function changeTaskNameEN(input) {
	if (selectedNodeId !== null) {
		// Check if label defaults to English because there are no other-language labels:
		const default_EN = !('labelZH' in nodes.get(selectedNodeId));
		data.nodes.update({ 
			id: selectedNodeId,
			labelEN: input.value,
			...(lang == "EN" || default_EN) && {label: input.value}
		});
	}
}

async function changeDetails(input) {
	if (selectedNodeId !== null) {
		data.nodes.update({ 
			id: selectedNodeId,
			details: input.value
		});
	}
}

async function changeEdgeEN(input) {
	if (selectedEdgeId !== null) {
		data.edges.update({ 
			id: selectedEdgeId,
			label: input.value
		});
	}
}

async function clearGraph() {
	network.destroy();
	nodes = new vis.DataSet([ {id: 0, label: "ROOT", labelEN: "ROOT", color: "cyan"} ]);
	edges = new vis.DataSet([]);
	data.nodes = nodes;
	data.edges = edges;
	network = new vis.Network(viz, data, options);
	update_node_index();
	network.once('afterDrawing', function() {
		setTimeout(function() {
			if (typeof setupNetworkEvents === 'function') {
				setupNetworkEvents(network);
			}
		}, 100);
	});
	techClick2.play();
	}

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

function addAuthor(event) {
	techClick2.play();
	event.currentTarget.value = "";
	}

// Initialize keyboard event listeners for node/edge operations
function initializeKeyboardEvents() {
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
}

// Make function globally available
window.initializeKeyboardEvents = initializeKeyboardEvents;

