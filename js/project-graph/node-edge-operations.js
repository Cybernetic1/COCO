/*
Module 2: js/project-graph/node-edge-operations.js
Purpose: All CRUD operations on nodes and edges

addNode() - Create new node with modal
delNode() - Delete selected node
delEdge() - Delete selected edge
changeStatus() - Update node status/color
changeTaskNameZH() - Update Chinese name
changeTaskNameEN() - Update English name
changeDetails() - Update node details
changeEdgeEN() - Update edge label
clearGraph() - Clear entire graph
setEdgeColor() - Set edge color/type
addAuthor() - Add author functionality
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
	network.once('stabilized', function() {
		setupNetworkEvents(network);
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

