// TO-DO:
// * Task status: in progress, done, paused
// * Load / save graph as JSON
// * Save graph as directory files

const techClick = new Audio('sounds/tech-click.wav');
const techClick2 = new Audio('sounds/tech-click2.wav');

// create a network
var container = document.getElementById("viz");

/*
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

var node_index = nodes.length;

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

var network = new vis.Network(container, data, options);

var clicked_id_1 = -1;
var clicked_id_2 = -1;
var clicked_name_1 = "none";
var clicked_name_2 = "none";
var clicked_edge = -1;
var node1 = document.getElementById("Node1");
var node2 = document.getElementById("Node2");

network.on("click", function (params) {
	console.log("selectNode Event:", params);
	console.log("Selected node=", params['nodes'][0]);
	
	if (params['nodes'].length > 0) {			// a node is clicked
		// shift node (1) to (2)
		clicked_id_2 = clicked_id_1;
		clicked_name_2 = clicked_name_1;
		clicked_id_1 = params['nodes'][0];
		clicked_edge = -1;
		console.log("node ID =", clicked_id_1);
		var node = data.nodes.get(clicked_id_1);
		clicked_name_1 = node.label;
		// console.log("node name =", clicked_name_1);
		node1.innerText = clicked_name_1;
		node2.innerText = clicked_name_2;

		// display details of node (1)
		document.getElementById("TaskName").value = clicked_name_1;
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
});

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

var str = "";

async function saveJSON() {
	// For all nodes:
	str = "{\"nodes\":[";
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
	techClick2.play();
	}

async function loadJSON() {
	network.destroy();
	var data0 = JSON.parse(str);
	nodes = new vis.DataSet(data0.nodes);
	edges = new vis.DataSet(data0.edges);
	data.nodes = nodes;
	data.edges = edges;
	network = new vis.Network(container, data, options);
	techClick2.play();
	}