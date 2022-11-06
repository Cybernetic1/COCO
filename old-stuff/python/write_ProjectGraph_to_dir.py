# Output Project Graph to Git repo
# ================================
# Each node = one file
# Organized flatly

import json
import os
import re
import sys

# Clean filename of any unwanted chars, allowing Chinese chars etc to remain
def clean_name(name):
	return ''.join(
		map(lambda ch: '%%%02x' % ord(ch)
		if re.match(r"[/\\?%*:|\"<>\x7F\x00-\x1F]", ch)
		else ch, name) )

# Inverse function of the above
# TO-DO:  need rigorous proof that the inverve holds
# May need to escape the symbol % via % --> %% to prevent ambiguity
def unclean_name(name):
	return

# print(clean_name("试吓先*.txt"))

TestRun = False

def write_ProjectGraph_to_dir():

	with open("ProjectGraph.json", "r") as infile:
		json_str = infile.read()
	net = json.loads(json_str)
	# print("Net = ", net)

	if not TestRun:
		import datetime
		stamp = datetime.datetime.now().strftime("%d-%b-%Y[%H:%M:%S]")
		path = "../ProjectGraph-" + stamp + '/'
		os.mkdir(path)

	# Algorithm:
	# - Iterate over all nodes
	# - Create file, mention all edges connected to it (both to and from)
	# -List properties of node in the file

	f = sys.stdout
	for n in net['nodes']:
		filename = clean_name(n['label'])
		if not TestRun:
			f = open(path + filename, "w+")
		else:
			print("\nFilename = " + filename, file=f)
		i = n['id']
		print("ID: " + str(i), file=f)
		print("Name: " + n['label'], file=f)
		if 'color' in n:
			status = "Paused" if n['color'] == '999' else "Done"
			# Note: the color #999 has to match that of ProjectGraph server
		else:
			status = "In progress"
		print("Status: " + status, file=f)
		if 'details' in n:
			print("Details: " + n['details'], file=f)
		# find in-coming and out-going edges
		in_edges = []
		out_edges = []
		for e in net['edges']:
			if e["to"] == i:
				in_edges.append(e['id'])
			elif e['from'] == i:
				out_edges.append(e['id'])
		print("In-coming edges: " + str(in_edges), file=f)
		print("Out-going edges: " + str(out_edges), file=f)
