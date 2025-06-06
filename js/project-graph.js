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
var lang = document.getElementById("lang").value;
const url = window.location.href;
// console.log("URL", url);
var regex = new RegExp('[?&]lang(=([^&#]*)|&|#|$)');
var params = regex.exec(url);
// console.log(params);
if (params && params[2] && params[2].toUpperCase() == "EN")
	switchLang();
else
	$('[lang="EN"]').hide();

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

// $("SidePaneButton").trigger('click');
document.getElementById("SidePaneButton").click();

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

// Track the currently selected node and edge for deletion
let selectedNodeId = null;
let selectedEdgeId = null;

// On clicking a node or edge on Vis.js canvas
function onClick(params) {
	// Prevent playing techClick if drag-to-link is active
	if (dragToLinkActive) return;
	if (params['nodes'].length > 0) {
		selectedNodeId = params['nodes'][0];
		selectedEdgeId = null;
		techClick.play();
	} else if (params['edges'].length > 0) {
		selectedEdgeId = params['edges'][0];
		selectedNodeId = null;
		techClick.play();
	} else {
		selectedNodeId = null;
		selectedEdgeId = null;
	}
}
network.on("click", onClick);

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

// Track the currently selected node for addNode
// let selectedNodeId = null;

// On clicking a node or edge on Vis.js canvas
// function onClick(params) {
// 	if (params['nodes'].length > 0) {
// 		selectedNodeId = params['nodes'][0];
// 		// Node clicked: show node details (if you want to keep this part)
// 		const node = data.nodes.get(selectedNodeId);
// 		// ...show node details logic if needed...
// 		techClick.play();
// 	} else if (params['edges'].length > 0) {
// 		// Edge clicked: show edge details (if you want to keep this part)
// 		const edge = data.edges.get(params['edges'][0]);
// 		// ...show edge details logic if needed...
// 		techClick.play();
// 	}
// }
// network.on("click", onClick);

function addAuthor(event) {
	techClick2.play();
	event.currentTarget.value = "";
	}

// Prepare modal window for user to input filenames etc
const json_modal = document.getElementById("JSON_modal");
const  git_modal = document.getElementById("Git_modal");
const node_modal = document.getElementById("Node_modal");
const help_modal = document.getElementById("Help_modal");

// --- Ensure JSON file list is always refreshed when modal is shown ---
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'style' && json_modal.style.display === 'block') {
            listJSONfiles();
        }
    });
});
observer.observe(json_modal, { attributes: true });

// Attach OK and Enter key handlers only once
(function setupJSONModalHandlers() {
    const okHandler = function () {
        var name = document.getElementById("JSONdropDown").value;
        if (name == "none")
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
                url: "/loadJSON/" + name,
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
                network.on("click", onClick);

                json_modal.style.display = "none";
                techClick2.play();
                } });
    };
    document.getElementById("json_modal_OK").onclick = okHandler;
    document.getElementById("JSONfileName").addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            okHandler();
        }
    });
})();

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
	data.nodes.remove({id: clicked_id_1});
	console.log("Deleted node #", clicked_id_1);
	techClick2.play();
	}

async function delEdge() {
	data.edges.remove({id: clicked_edge});
	console.log("Deleted edge #", clicked_edge);
	techClick2.play();
	}

async function changeStatus(radio) {
	data.nodes.updateOnly({ id: clicked_id_1,
		status: radio.value,
		color: nodeColors[radio.value],
		});
	techClick2.play();
	}

async function changeTaskNameZH(input) {
	data.nodes.updateOnly({ id: clicked_id_1,
		labelZH: input.value,
		...(lang == "ZH") && {label: input.value},
		});
	}

async function changeTaskNameEN(input) {
	// Check if label defaults to English because there are no other-language labels:
	const default_EN = !('labelZH' in nodes.get(clicked_id_1));
	data.nodes.updateOnly({ id: clicked_id_1,
		labelEN: input.value,
		...(lang == "EN" || default_EN) && {label: input.value},
		});
	}

async function changeDetails(input) {
	data.nodes.updateOnly({ id: clicked_id_1,
		details: input.value,
		});
	}

async function changeEdgeEN(input) {
	data.edges.updateOnly({ id: clicked_edge,
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
	network.on("click", onClick);
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

async function saveJSON() {
	// For all nodes:
	var str = "{\"nodes\":[";
	var ns = nodes._data;
	ns.forEach(function(n) {
		delete n['label'];		// only save labelEN and labelZH
		str += JSON.stringify(n);
		str += ",";
		});
	str = str.slice(0,-1) + "],";

	// For all edges:
	str += "\"edges\":[";
	var es = edges._data;
	es.forEach(function(e) {
		delete e['id'];
		str += JSON.stringify(e);
		str += ",";
		});
	str = str.slice(0,-1) + "]}";
	console.log(str);

	// Open modal window and ask for filename
	json_modal.style.display = "block";
	techClick2.play();
	listJSONfiles();
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
			url: "/saveJSON/" + name,
			data: str,
			success: function(resp) {}
			});

		json_modal.style.display = "none";		// close window
		techClick2.play();
		};
	}

async function loadJSON() {
	// Open modal window and ask for filename
	json_modal.style.display = "block";
	techClick2.play();
	ifRemoteUser();
	// listJSONfiles() is now called by the MutationObserver when modal is shown
}

async function saveDirectory() {
	// Currently disallow remote users to write directly to global Git dir
	if (!(location.hostname === "localhost" ||
			 location.hostname === "127.0.0.1"))
		return;

	// For all nodes:
	var str = "{\"nodes\":[";
	var ns = nodes._data;
	ns.forEach(function(n) {
		delete n['label'];		// only save labelEN and labelZH
		str += JSON.stringify(n);
		str += ",";
		});
	str = str.slice(0,-1) + "],";

	// For all edges:
	str += "\"edges\":[";
	var es = edges._data;
	es.forEach(function(e) {
		delete e['id'];
		str += JSON.stringify(e);
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

// **** read Project Graph from current directory
async function loadDirectory() {
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
			network.on("click", onClick);

			git_modal.style.display = "none";		// close window
			techClick2.play();
			} });
		};
	}

async function switchLang() {
	const button = document.getElementById("lang");
	lang = button.value;
	if (lang == "ZH") {
		lang = "EN";
		// NOTE: should display the language to switch to next
		button.innerHTML = "中文";
		}
	else if (lang == "EN") {
		lang = "ZH";
		button.innerHTML = "Eng";
		}
	button.value = lang;
	$('[lang="ZH"]').toggle();
	$('[lang="EN"]').toggle();
	// console.log("Current language:", lang);
	data.nodes.getIds().forEach( (id) => {
		const i = parseInt(id);
		data.nodes.updateOnly({ id: i, label: get_label_in_lang(nodes.get(i)) });
		});
	techClick2.play().catch(function (error) {
		// console.log("cannot play sound without user click first");
		});
	}

// **** Read from Git to extract authors
$.ajax({
		method: "GET",
		url: "/getGitAuthors/",
		cache: true,
		success: function(data0) {

	var authors = data0.split(/\r?\n/);
	const uniqs = Array.from(new Set(authors));
	const div = document.getElementById("authors");
	for (const author of uniqs) {
		if (author.trim() == "")
			continue;
		const span = document.createElement('input');
		span.value = author;
		span.setAttribute('type', 'author');
		span.setAttribute('disabled', '');		// for an added author, changes color
		div.appendChild(span);
		}
		// Add a button to add authors;  this function needs to call itself:
		(function addAuthorButton() {
			const span = document.createElement('input');
			span.setAttribute('type', 'author');
			span.value = '⊕ name [, e-mail]';
			span.onclick = (event) => {
				span.value = "";			// clear input field
				};
			span.addEventListener('keyup', (event) => {
				// when finished entering the author name / e-mail:
				if (event.key === "Enter") {
					[span.value, ...span.title] = span.value.split(/,\s*/);
					$.ajax({
						method: "POST",
						url: "/addGitAuthor/",
						data: JSON.stringify({ name: span.value, email: span.title }),
						contentType: "application/json",
						success: function(resp) {
							techClick2.play();
							addAuthorButton();		// call itself to add button
							}
						});
					}
				});
			div.appendChild(span);	// add the button
			})();
		}
	});
