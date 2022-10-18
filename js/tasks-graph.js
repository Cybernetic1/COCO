// **** Called by NeoVis to visualize graph

var clicked_id_A = -1;
var clicked_id_B = -1;
var clicked_name_A = "none";
var clicked_name_B = "none";
var nodeA = document.getElementById("NodeA");
var nodeB = document.getElementById("NodeB");
var viz;

function redraw() {
	var config = {
		containerId: "viz",
		nonFlat: true,
		neo4j: {
			serverUrl: "bolt://localhost:7687",
			serverUser: "neo4j",
			serverPassword: "l0wsecurity",
			},
		visConfig: {
			nodes: {
				shape: 'box',
				},
			edges: {
				arrows: {
					to: { enabled: true }
					}
				},
			},
		labels: {
			"Node": {
				property: {
					label: "name",
					},
				static: {
					widthConstraint: { maximum: 150 }
					}
				}
			},
		relationships: {
			"SubTask": {
				label: "name",
				thickness: "count"
				}
			},
		// initialCypher: "MATCH p=(:Char)-[:Smaller]->(:Char) RETURN p"
		// initialCypher: "Match (n)-[r]->(m) Return n,r,m"
		initialCypher: "MATCH (n) OPTIONAL MATCH (n)-[r]-() RETURN n, r"
		}

	viz = new NeoVis.default(config);
	viz.render();

	// On click on nodes:
	viz.registerOnEvent("completed", (e) => {
		viz.network.on("click", (event) => {
			// get node id
			clicked_id_B = clicked_id_A;
			clicked_name_B = clicked_name_A;
			clicked_id_A = event.nodes[0];
			console.log("Just clicked:", clicked_id_A);
			viz.nodes.forEach(function (x) {if (x.id == clicked_id_A) clicked_name_A = x.label});
			nodeA.innerText = clicked_name_A;
			nodeB.innerText = clicked_name_B;
			});
		});
	}

// **** Access Neo4j database

const driver = neo4j.driver("neo4j://localhost", neo4j.auth.basic("neo4j", "l0wsecurity"));
const session = driver.session();

async function addNode() {
	const taskname = document.getElementById("TaskName").value;
	console.log("Trying to add node", taskname, "to node #", clicked_id_A);

	try {
		const result = await session.writeTransaction(tx => tx.run(
			"MATCH (old:Node) WHERE ID(old)=$id \
			CREATE (new:Node {name:$taskname})-[:SubTask]->(old)",
			{ id: clicked_id_A, taskname: taskname }
			))
		} finally {
		console.log("Added node.");
		redraw();
		}
	}

async function delNode() {
	console.log("Trying to delete node #", clicked_id_A);

	try {
		const result = await session.writeTransaction(tx => tx.run(
			"MATCH (n:Node) WHERE ID(n)=$id \
			DETACH DELETE (n)",
			{ id: clicked_id_A }
			))
		} finally {
		console.log("Deleted node.");
		redraw();
		}
	}

async function editNode() {
	const taskname = document.getElementById("TaskName").value;
	console.log("Trying to edit node #", clicked_id_A);

	try {
		const result = await session.writeTransaction(tx => tx.run(
			"MATCH (n:Node) WHERE ID(n)=$id \
			SET n.name = $taskname",
			{ id: clicked_id_A, taskname: taskname }
			))
		} finally {
		console.log("Edited node.");
		redraw();
		}
	}

async function linkNodes() {
	console.log("Trying to link node #", clicked_id_A, "as SubTask to node #", clicked_id_B);

	try {
		const result = await session.writeTransaction(tx => tx.run(
			"MATCH (a:Node), (b:Node) WHERE ID(a) = $id_A AND ID(b) = $id_B \
			CREATE (b)-[r:SubTask]->(a)",
			{ id_A: clicked_id_A, id_B: clicked_id_B }
			))
		} finally {
		console.log("Linked nodes.");
		redraw();
		}
	}

// on application exit:
window.onbeforeunload = closingCode;
async function closingCode(){
	await session.close()
	await driver.close()  
	return null;
}
