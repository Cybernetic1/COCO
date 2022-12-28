// Compare two Project Graphs, merge voting data

// TO-DO:
// * highlight differing nodes/edges in Vis.js
// * ask for modifications or acceptance of nodes/edges

// DONE:
// * load 2 graphs as Javascript objects

var graphs = new Array();

// **** Load 2 graphs as Javascript objects
async function loadGraph(i) {		// i = 1 or 2
	// Open modal window and ask for filename
	modal1.style.display = "block";
	// Populate dropdown menu with JSON filenames:
	let dropDown = document.getElementById("JSONdropDown");
	dropDown.replaceChildren();		// clear all options
	$.ajax({
		method: "GET",
		url: "/fileList/",
		success: function (files) {
			// console.log(typeof(files), files);
			files.forEach( file => {
				if (!file.endsWith('.json'))
					return;
				var option = document.createElement("option");
				option.value = file;
				option.text = file;
				dropDown.appendChild(option);
				} );
			} });
	techClick2.play();
	// Wait for modal window to be clicked OK, then do:
	document.getElementById("modal1_OK").onclick = dropDown.onchange = function () {

		var name = document.getElementById("JSONdropDown").value;
		if (name == "none")
			name = document.getElementById("JSONfileName").value;
		$.ajax({
				method: "GET",
				url: "/loadJSON/" + name,
				cache: false,
				success: function(data0) {
			// data0 is already a Javascript object
			// No need to do:  var data1 = JSON.parse(data0);
			graphs[i] = data0;
			document.getElementById("graph" + i.toString() + "-name").innerText = " = " + name;
			modal1.style.display = "none";		// close window
			techClick2.play();
			} });
		};
	}

// **** Compare all nodes and edges of the two graphs
// What does it mean to differ?
// Need to find approximate correspondence of nodes
// A helpful hint is the ID as counted from root = 0, approximately tree-like
// Thus nodes should be sorted by distance from root
// Which means IDs may require decimal points
// Two nodes may differ by: ID, names, status, details, authors, votes.
// To enforce integrity we may require users to modify from a common existing graph
// Then any modifications to such a graph can be traced easily
// But, isn't this the same as if the common graph is a Git structure?
// We don't have anything new here, we just need to visualize branches better,
// get used to creating branches, and to consider all branches as a whole.
// There's also a conservative approach where all node creations are accepted.
// It seems that the HISTORY of editing the graph must be taken into account.
// We don't need a lot of conflict resolution if we refer to the history.
// So the crux is to record edit history, and this history should be recorded by Git.
// So all users can create nodes in the "main" branch, unless conflicts arise.
// Another way is: each individual user's edit = branch, to be merged with main branch
// 
function compare-graphs() {
	// **** Find all nodes that differ
	graphs[1].nodes.forEach( node1 => {
		graphs[2].nodes.forEach( node2 => {
			var identical = false;
			
			} );
		} );
	
	// **** Find all edges that differ
	}
