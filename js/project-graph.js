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

// For our Project Graph, (* = required)
// each Node may contain attributes:  *id, label, label-EN, status, details, authors[], votes[]
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

var lang = document.getElementById("lang").value;		// Current language ("ZH" or "EN")
nodes.forEach((n) => {
	if (n.hasOwnProperty("labelZH"))
		n.label = n.labelZH;	// copy Chinese label to be default label
	else
		n.label = n.labelEN;
	});
$('[lang="en"]').hide();

var node_index = 0;
function update_node_index() {
	nodes.forEach((n) => {
		if (n.id > node_index)
			node_index = n.id;
		})
	}
update_node_index();

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
var clicked_name_1 = "";
var clicked_name_2 = "";
var clicked_edge = -1;
var node1 = document.getElementById("Node1");
var node2 = document.getElementById("Node2");

// Sound files
const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');

function get_label_in_lang(node) {
	if (lang == "ZH")
		return node.hasOwnProperty('labelZH') ? node.labelZH : node.labelEN;
	else
		return node.hasOwnProperty('labelEN') ? node.labelEN : node.labelZH;
	}

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
		document.getElementById("TaskNameZH").value = node.labelZH ?? "";
		document.getElementById("TaskNameEN").value = node.labelEN ?? "";
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
	const taskname = document.getElementById("TaskName").value;
	data.nodes.add({id : node_index, label: taskname});
	data.edges.add({from: node_index, to: clicked_id_1});
	node_index += 1;
	console.log("Added node", taskname, "to node #", clicked_id_1);
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
	var node = data.nodes.get(clicked_id_1);

	const taskname = document.getElementById("TaskName").value;
	if (taskname != "")
		node.label = taskname;
	const details = document.getElementById("Details").value;
	if (details != "")
		node.details = details;
	console.log("Updated node #", clicked_id_1);
	network.redraw();
	techClick2.play();
	}

async function linkNodes() {
	data.edges.add({from: clicked_id_2, to: clicked_id_1});
	console.log("Linked node #", clicked_id_2, "as SubTask to node #", clicked_id_1);
	techClick2.play();
	}

async function saveJSON() {
	// For all nodes:
	var str = "{\"nodes\":[";
	var ns = nodes._data;
	ns.forEach(function(n) {
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

	console.log($.ajax({
		method: "POST",
		url: "/saveJSON/" + "ProjectGraph.json",
		data: str,
		success: function(resp) {}
	}));

	techClick2.play();
	}

async function loadJSON() {
	$.ajax({
			method: "GET",
			url: "/loadJSON/" + "ProjectGraph.json",
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
		techClick2.play();
		} });
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
	$('[lang="zh"]').toggle();
	$('[lang="en"]').toggle();
	// console.log("Current language:", lang);
	for (const id in data.nodes.getIds()) {
		const i = parseInt(id);
		data.nodes.updateOnly({ id: i, label: get_label_in_lang(nodes.get(i)) });
		}
	techClick2.play();
	}
