// TO-DO:
// * Task status: in progress, done, paused
// * Per-Task Voting:
// 		- list authors for each task
//		- first author self-claim # of credits for task
//		- needs others' vote to support
//		- final result = # of tokens for every author of task

// NOT URGENT:
// * Save graph as directory files
// * Allow bi-lingual task details

// DONE:
// * Load / save graph as JSON
// * Save JSON to server-side
// * Allow bi-lingual labels
// * Allow saving different graphs with filenames

// For our Project Graph, (* = required)
// each Node may contain attributes:  *id, label, labels{}, status, details, authors[], votes[]
// each Edge may contains attributes:  *from, *to

/* **** Example data format ****

var nodes = new vis.DataSet([
{ id: 1, label: "Node 1" },
{ id: 2, label: "Node 2" },
{ id: 3, label: "Node 3" },
{ id: 4, label: "Node 4" },
{ id: 5, label: "Node 5" }
]);

var edges = new vis.DataSet([
{ from: 1, to: 3 },
{ from: 1, to: 2 },
{ from: 2, to: 4 },
{ from: 2, to: 5 },
{ from: 3, to: 3 }
]);
*/

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

// Initialize labels to be in default language
nodes.forEach((node) => {
	node.label = get_label_in_lang(node);
	});

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
		widthConstraint: 100,
		},
	edges: {
		arrows: {
			to: {
				enabled: true,
				// type: "arrow",
				// scaleFactor: 1,
				}
			},
		},
	/* interaction: {
		hover: true
		}, */
	};

var container = document.getElementById("viz");
var network = new vis.Network(container, data, options);

var clicked_id_1 = -1;
var clicked_id_2 = -1;
var clicked_name_1 = "none";
var clicked_name_2 = "none";
var clicked_edge = -1;
var node1 = document.getElementById("Node1");
var node2 = document.getElementById("Node2");

// Sound files
const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');
const techFail = new Audio('sounds/tech-fail.wav');

// On clicking a node on Vis.js canvas
function onClick(params) {
	// console.log("selectNode Event:", params);
	// console.log("Selected node=", params['nodes'][0]);
	
	if (params['nodes'].length > 0) {			// a node is clicked
		// shift node (1) to (2)
		clicked_id_2 = clicked_id_1;
		clicked_name_2 = clicked_name_1;
		clicked_id_1 = params['nodes'][0];
		clicked_edge = -1;
		console.log("node ID =", clicked_id_1);
		var node = data.nodes.get(clicked_id_1);
		clicked_name_1 = get_label_in_lang(node);
		node1.innerText = clicked_name_1;
		node2.innerText = clicked_name_2;

		// display details of node (1)
		document.getElementById("TaskNameEN").value = node.labelEN;
		document.getElementById("TaskNameZH").value = node.labelZH ?? "";
		if ('details' in node)
			document.getElementById("Details").value = node.details;
		else
			document.getElementById("Details").value = "";
		document.getElementById("Edge").style.display = "none";
		document.getElementById("Node12").style.display = "inline-block";
		techClick.play();
		}
	else if (params['edges'].length > 0) {		// an edge is clicked
		// console.log("Selected edge=", params);
		clicked_edge = params['edges'][0];
		var edge = data.edges.get(clicked_edge);
		document.getElementById("Node12").style.display = "none";
		document.getElementById("Edge").style.display = "inline-block";
		document.getElementById("Edge1").innerText = "Edge " + edge.from.toString() + "-" + edge.to.toString();
		techClick.play();
		}
	else {										// clicked on white space
		clicked_edge = -1;
		document.getElementById("Edge").style.display = "none";
		document.getElementById("Node12").style.display = "inline-block";
		}
	}

network.on("click", onClick);

/*
network.on("hoverNode", function (params) {
	console.log("hoverNode Event:", params);
});
*/

async function addNode() {
	const tasknameEN = document.getElementById("TaskNameEN").value;
	if (tasknameEN == "" || tasknameEN == "???") {
		document.getElementById("TaskNameEN").value = "???";
		techFail.play();
		return;
		}
	const tasknameZH = document.getElementById("TaskNameZH").value;
	const taskname = ((lang == 'ZH') && (tasknameZH != "")) ? tasknameZH : tasknameEN;
	data.nodes.add({id : node_index,
		label: taskname,
		labelEN: tasknameEN,
		...(tasknameZH != "") && { labelZH: tasknameZH }
		});
	data.edges.add({from: node_index, to: clicked_id_1});
	console.log("Added node", tasknameEN, "to node #", clicked_id_1);
	node_index++;
	techClick2.play();
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

async function editNode() {
	const tasknameEN = document.getElementById("TaskNameEN").value;
	const tasknameZH = document.getElementById("TaskNameZH").value;
	const details = document.getElementById("Details").value;
	nodes.update({ id: clicked_id_1,
		...(tasknameEN != "") && {labelEN: tasknameEN},
		...(tasknameZH != "") && {labelZH: tasknameZH},
		label: (lang == "ZH" && tasknameZH != "") ? tasknameZH : tasknameEN,
		...(details != "") && {details: details},
		});
	console.log("Updated node #", clicked_id_1);
	techClick2.play();
	}

async function linkNodes() {
	data.edges.add({from: clicked_id_2, to: clicked_id_1});
	console.log("Linked node #", clicked_id_2, "as SubTask to node #", clicked_id_1);
	techClick2.play();
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
var modal = document.getElementById("modalWindow");

// Clicking "X" or "Cancel" closes the modal
document.getElementsByClassName("close")[0].onclick =
document.getElementById("modalCancel").onclick =
	function() {
		modal.style.display = "none";
		};

// When user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
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
	document.getElementById("modalLabel").innerText = "Please enter JSON filename: ";
	var input = document.getElementById("modalInput");
	input.defaultValue = "ProjectGraph.json";
	modal.style.display = "block";
	document.getElementById("modalOK").onclick = function() {
		console.log($.ajax({
			method: "POST",
			url: "/saveJSON/" + input.value,
			data: str,
			success: function(resp) {}
			}));
		modal.style.display = "none";
		techClick2.play();
		};
	}

async function loadJSON() {
	// Open modal window and ask for filename
	document.getElementById("modalLabel").innerText = "Please enter JSON filename: ";
	var input = document.getElementById("modalInput");
	input.defaultValue = "ProjectGraph.json";
	modal.style.display = "block";
	techClick2.play();
	document.getElementById("modalOK").onclick = function() {

		$.ajax({
				method: "GET",
				url: "/loadJSON/" + input.value,
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
			network = new vis.Network(container, data, options);
			update_node_index();
			network.on("click", onClick);
			modal.style.display = "none";
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
		button.innerHTML = "中<br><small>Language</small>";
		}
	else if (lang == "EN") {
		lang = "ZH";
		button.innerHTML = "English<br><small>Language</small>";
		}
	button.value = lang;
	$('[lang="ZH"]').toggle();
	$('[lang="EN"]').toggle();
	// console.log("Current language:", lang);
	for (const id in data.nodes.getIds()) {
		const i = parseInt(id);
		data.nodes.updateOnly({ id: i, label: get_label_in_lang(nodes.get(i)) });
		}
	techClick2.play();
	}
