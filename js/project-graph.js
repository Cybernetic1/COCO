// TO-DO:
// * Edges may have descriptions also
// * Per-Task Voting:
// 		- list authors for each task
//		- first author self-claim # of credits for task
//		- needs others' vote to support
//		- final result = # of tokens for every author of task

// NOT URGENT:
// * Save graph as directory files
// * Allow bi-lingual task details
// * Use "Input" area to directly updates nodes
// * drop-down menu to show existing JSON files in directory, for load/save
// * "Add Node" should use separate input window for data

// DONE:
// * Load / save graph as JSON
// * Save JSON to server-side
// * Allow bi-lingual labels
// * Allow saving different graphs with filenames
// * Task status: in progress, done, paused

// For our Project Graph, (* = required)
// each Node may contain attributes:  *id, label, labels{}, status, details, authors[], votes[]
// each Edge may contains attributes:  *from, *to

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

var lang = document.getElementById("lang").value;		// Default language ("ZH" or "EN")
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
	nodes.updateOnly({ id: 0, color: 'cyan'});
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
			to: {
				enabled: true,
				// type: "arrow",
				// scaleFactor: 1,
				}
			},
		color: {
			color: '#AAA',
			highlight:'#000',
			inherit: false,
			opacity:1.0
			}
		},
	/* interaction: {
		hover: true
		}, */
	};

var container = document.getElementById("viz");
var network = new vis.Network(container, data, options);

var pane = document.getElementById("side-pane");
pane.style.display = "none";

// Sound files
const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');
const techFail = new Audio('sounds/tech-fail.wav');

function toggleSidePane() {
	techClick2.play();
	if (pane.style.display == "none") {
		pane.style.display = "inline-block";
		container.style.height = window.innerHeight - 130 + "px";
		container.style.width = window.innerWidth * .75 + "px";
		document.getElementById("SidePaneButton").innerText = "⏴";
		}
	else {
		pane.style.display = "none";
		container.style.height = window.innerHeight - 130 + "px";
		container.style.width = window.innerWidth * .95 + "px";
		document.getElementById("SidePaneButton").innerText = "⏵";
		}
	}

// $("SidePaneButton").trigger('click');
document.getElementById("SidePaneButton").click();

var clicked_id_1 = -1;
var clicked_id_2 = -1;
var clicked_name_1 = "none";
var clicked_name_2 = "none";
var clicked_edge = -1;
var node1 = document.getElementById("Node1");
var node2 = document.getElementById("Node2");

// On clicking a node on Vis.js canvas
function onClick(params) {
	// console.log("selectNode Event:", params);
	// console.log("Selected node=", params['nodes'][0]);
	
	if (params['nodes'].length > 0) {			// a node is clicked
		// shift node ① to ②
		clicked_id_2 = clicked_id_1;
		clicked_name_2 = clicked_name_1;
		node2.style.backgroundColor = node1.style.backgroundColor;
		clicked_id_1 = params['nodes'][0];
		clicked_edge = -1;
		console.log("node ID =", clicked_id_1);
		var node = data.nodes.get(clicked_id_1);
		clicked_name_1 = get_label_in_lang(node);

		// display details of nodes ① ②:
		node1.innerText = clicked_name_1;
		node1.style.backgroundColor = node.color;
		node2.innerText = clicked_name_2;
		// radio button:
		if ('status' in node)
			document.getElementById(node.status).checked = true;
		else
			document.getElementById('in-progress').checked = true;
		document.getElementById("TaskNameEN").value = node.labelEN;
		document.getElementById("TaskNameZH").value = node.labelZH ?? "";
		if ('details' in node)
			document.getElementById("Details").value = node.details;
		else
			document.getElementById("Details").value = "";
		// show Nodes ① ② and hide Edge:
		document.getElementById("Edge").style.display = "none";
		document.getElementById("Node12").style.display = "inline-block";
		techClick.play();
		}
	else if (params['edges'].length > 0) {		// an edge is clicked
		// console.log("Selected edge=", params);
		clicked_edge = params['edges'][0];
		var edge = data.edges.get(clicked_edge);
		document.getElementById("EdgeNameEN").value = ('label' in edge) ? edge.label : "";
		document.getElementById("Node12").style.display = "none";
		document.getElementById("Edge").style.display = "inline-block";
		document.getElementById("Edge1").innerText = "Edge: [" + edge.from.toString() + "] ⟶ [" + edge.to.toString() + "]";
		techClick.play();
		}
	else {										// clicked on white space
		clicked_edge = -1;
		document.getElementById("Edge").style.display = "none";
		document.getElementById("Node12").style.display = "inline-block";
		}
	}

network.on("click", onClick);

// Prepare modal window for user to input Node labels
var modal2 = document.getElementById("modalWindow2");

// Clicking "X" or "Cancel" closes the modal
document.getElementById("modal2_Close").onclick =
document.getElementById("modal2_Cancel").onclick =
	function() {
		modal2.style.display = "none";
		};

// When user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal2) {
		modal2.style.display = "none";
		}
	};

async function addNode() {
	// Open modal window to ask for Node labels:
	modal2.style.display = "block";
	techClick2.play();
	document.getElementById("modal2_OK").onclick = function() {

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
		data.edges.add({from: node_index, to: clicked_id_1});
		console.log("Added node", tasknameEN, "to node #", clicked_id_1);
		node_index++;
		techClick2.play();
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

async function linkNodes() {
	data.edges.add({from: clicked_id_2, to: clicked_id_1});
	console.log("Linked node #", clicked_id_2, "as SubTask to node #", clicked_id_1);
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
	network = new vis.Network(container, data, options);
	update_node_index();
	network.on("click", onClick);
	techClick2.play();
	}

// Prepare modal window for user to input filenames etc
var modal1 = document.getElementById("modalWindow1");

// Clicking "X" or "Cancel" closes the modal
document.getElementById("modal1_Close").onclick =
document.getElementById("modal1_Cancel").onclick =
	function() {
		modal1.style.display = "none";
		};

// When user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal1) {
		modal1.style.display = "none";
		}
	};

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
	techClick2.play();

	// Open modal window and ask for filename
	modal1.style.display = "block";
	document.getElementById("modal1_OK").onclick = function() {
		var name = document.getElementById("JSONdropDown").value;
		if (name == "none")
			name = document.getElementById("JSONfileName").value;
		console.log($.ajax({
			method: "POST",
			url: "/saveJSON/" + name,
			data: str,
			success: function(resp) {}
			}));

		modal1.style.display = "none";		// close window
		techClick2.play();
		};
	}

async function loadJSON() {
	// Open modal window and ask for filename
	modal1.style.display = "block";
	techClick2.play();
	document.getElementById("modal1_OK").onclick = function() {

		var name = document.getElementById("JSONdropDown").value;
		if (name == "none")
			name = document.getElementById("JSONfileName").value;
		$.ajax({
				method: "GET",
				url: "/loadJSON/" + name,
				cache: false,
				success: function(data0) {

			network.destroy();
			// data0 seems already parsed as JSON by the server
			// No need to do:  var data1 = JSON.parse(data0);
			// console.log(data0);
			nodes = new vis.DataSet(data0.nodes);
			edges = new vis.DataSet(data0.edges);
			data.nodes = nodes;
			data.edges = edges;
			init_nodes();		// set lang, colors, ... from existing data
			network = new vis.Network(container, data, options);
			update_node_index();
			network.on("click", onClick);

			modal1.style.display = "none";		// close window
			techClick2.play();
			} });
		}
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
		button.innerHTML = "English";
		}
	button.value = lang;
	$('[lang="ZH"]').toggle();
	$('[lang="EN"]').toggle();
	// console.log("Current language:", lang);
	data.nodes.getIds().forEach( (id) => {
		const i = parseInt(id);
		data.nodes.updateOnly({ id: i, label: get_label_in_lang(nodes.get(i)) });
		});
	techClick2.play();
	}
