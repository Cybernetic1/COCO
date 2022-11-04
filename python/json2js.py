# Read JSON file of Project Graph and output the graph as Vis.js Javascript code

# Vis.js style:
# var nodes = new vis.DataSet([
#	{ id: 1, label: "Node 1" },
#	{ id: 2, label: "Node 2" },
#	{ id: 3, label: "Node 3" },
#	{ id: 4, label: "Node 4" },
#	{ id: 5, label: "Node 5" },
# ]);
# var edges = new vis.DataSet([
#	{ from: 1, to: 3 },
#	{ from: 1, to: 2 },
#	{ from: 2, to: 4 },
#	{ from: 2, to: 5 },
#	{ from: 3, to: 3 }
# ]);

import json

with open("ProjectGraph.json", "r") as infile:
	json_str = infile.read()

net = json.loads(json_str)
print("Net = ", net)

with open("../js/ProjectGraph-data.js", "w+") as outfile:

	outfile.write("var nodes = new vis.DataSet([\n")
	for n in net['nodes']:
		outfile.write(f"{{ id:{n['id']}, label: \"{n['label']}\", ")
		if 'color' in n and n['color'] is not None:
			outfile.write(f"color: \"{n['color']}\", ")
		if 'details' in n and n['details'] != "":
			outfile.write(f"details: `{n['details']}`, ")
		outfile.write("},\n")
	outfile.write("]);\n")

	outfile.write("var edges = new vis.DataSet([\n")
	for n in net['edges']:
		outfile.write(f"{{ from:{n['from']}, to: {n['to']} }},\n")
	outfile.write("]);")
