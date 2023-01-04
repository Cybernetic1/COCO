// TO-DO:
// * Allow remote users to save Project Graph with ID postfix
//	- The graphs are just for testing and would be merged manually
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
// * Drop-down menu to add authors
// * Per-Task Voting

// NOT URGENT:
// * Allow bi-lingual task details
// * Save graph as directory files

// DONE:
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
	techClick2.play().catch(function (error) {
		// console.log("Chrome cannot play sound without user interaction first");
		});
	container.style.height = window.innerHeight -100 + "px";
	container.style.width = window.innerWidth -20 + "px";

	if (pane.style.display == "none") {
		pane.style.display = "inline-block";
		document.getElementById("SidePaneButton").innerText = "⏴";
		}
	else {
		pane.style.display = "none";
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

		const divAuthors = document.getElementById("authors");
		divAuthors.innerHTML = "";
		if ('authors' in node) {
			for (const author of node.authors) {
				const span = document.createElement('input');
				span.value = author[0];
				span.title = author[1];
				span.setAttribute('type', 'author');
				span.setAttribute('disabled', '');		// for an added author, changes color
				divAuthors.appendChild(span);
				}
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
					if (node.authors == null)
						node.authors = new Array();
					node.authors.push([span.value, span.title]);
					span.setAttribute('disabled', '');	// for an added author
					techClick2.play();
					addAuthorButton();		// call itself to add button
					}
				});
			divAuthors.appendChild(span);	// add the button
			})();

		// Create HTML element vote slider
		(function createPoll() {
			const voting = document.getElementById('voting');
			voting.innerHTML = '';
			if ('votes' in node) {
				window.votes = node.votes;
				for (const author of node.authors) {
					const div = document.createElement('div');
					div.classList.add('slidecontainer');
					const name = document.createElement('p');
					name.classList.add('name');
					name.innerText = author[0];
					div.appendChild(name);
					const slider = document.createElement('input');
					slider.classList.add('slider');
					slider.setAttribute('type', 'range');
					slider.setAttribute('min', '0');
					slider.setAttribute('max', '1000');
					slider.setAttribute('value', '0');
					div.appendChild(slider);
					const score = document.createElement('pre');
					score.classList.add('score');
					score.innerText = '0';
					div.appendChild(score);
					voting.appendChild(div);
					}
				// Create HTML element for "total" vote count
				const div = document.createElement('div');
				div.classList.add('slidecontainer');
				const name = document.createElement('p');
				name.classList.add('name');
				name.innerText = "Total";
				div.appendChild(name);
				const score = document.createElement('pre');
				score.classList.add('score');
				score.innerText = '0';
				score.setAttribute('id', 'total');
				div.appendChild(score);
				voting.appendChild(div);
				$.getScript("js/vote-slider.js", function() {
					console.log("vote-slider.js loaded and executed.");
					});
				// Record votes values into node.votes
				document.getElementById("total").onclick = function() {
					node.votes = window.votes;
					};
				}
			else {	// no votes, allow users to start a poll
				const butt = document.createElement('p');
				butt.innerText = "⊕ start voting";
				butt.onclick = function () {
					node.votes = new Array();
					createPoll();
					}
				voting.appendChild(butt);
				}
			} )();	// end of function, and function call

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

function addAuthor(event) {
	techClick2.play();
	event.currentTarget.value = "";
	}

// Prepare modal window for user to input filenames etc
const json_modal = document.getElementById("JSON_modal");
const  git_modal = document.getElementById("Git_modal");
const node_modal = document.getElementById("Node_modal");
const help_modal = document.getElementById("Help_modal");

// Clicking "X" or "Cancel" closes the modal
function close_json_modal() { json_modal.style.display = "none"; };
function close_git_modal()  { git_modal.style.display = "none"; };
function close_node_modal() { node_modal.style.display = "none"; };
function close_help_modal() { help_modal.style.display = "none"; };

// When user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == json_modal) json_modal.style.display = "none";
	if (event.target == git_modal)  git_modal.style.display = "none";
	if (event.target == node_modal) node_modal.style.display = "none";
	if (event.target == help_modal) help_modal.style.display = "none";
	};

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
		data.edges.add({from: node_index, to: clicked_id_1});
		console.log("Added node", tasknameEN, "to node #", clicked_id_1);
		node_index++;
		node_modal.style.display = "none";		// close modal window
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
	div = document.getElementById("remote-user");
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
		const tag = document.querySelector(
			'input[name="remoteUser"]:checked').value;
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
	listJSONfiles();
	ifRemoteUser();
	// Wait for modal window to be clicked OK, then do:
	document.getElementById("json_modal_OK").onclick = function () {

		var name = document.getElementById("JSONdropDown").value;
		if (name == "none")
			name = document.getElementById("JSONfileName").value;
		const tag = document.querySelector(
			'input[name="remoteUser"]:checked').value;
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

			json_modal.style.display = "none";		// close window
			techClick2.play();
			} });
		};
	}

async function saveDirectory() {
	// Currently disallow remote users to write directly to global Git dir
	if (not (location.hostname === "localhost" ||
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
			network = new vis.Network(container, data, options);
			update_node_index();
			network.on("click", onClick);

			git_modal.style.display = "none";		// close window
			techClick2.play();
			} });
		};
	}

async function help() {
	techClick2.play();
	help_modal.style.display = "block";
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
	techClick2.play();
	}

// **** Read from Git to extract authors
$.ajax({
		method: "GET",
		url: "/getGitAuthors/",
		cache: false,
		success: function(data0) {

	var authors = data0.split(/\r?\n/);
	const uniqs = Array.from(new Set(authors));
	const div = document.getElementById("authors");
	for (const author of uniqs) {
		if (author == '')
			break;
		console.log("add Git author:", author);
		const span = document.createElement('input');
		const [email, ...name] = author.split(',');
		span.value = name;
		span.title = email;
		span.setAttribute('type', 'author');
		span.setAttribute('disabled', '');
        div.appendChild(span);
        //div.appendChild(document.createElement('br'));
		}
	} });
