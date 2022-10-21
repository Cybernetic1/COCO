# TO-DO:

# DONE:
# * radio buttons for Done (pink) vs In-progress
# * link nodes
# * color node bug (fixed: set global variable)
# * fill task_name when select node
# * add "Paused" task status
# * add "Description" for nodes
# * ability to delete edges

import dash
import visdcc
from dash import dcc, html, callback_context
# import dash_core_components as dcc
from dash.dependencies import Input, Output, State
# from dash import Dash, Input, Output, State, dcc, html, callback_context
import json

app = dash.Dash(__name__)
app.config.suppress_callback_exceptions = True

app.layout = html.Div(style={'font-size':'20px'}, children=[
	html.Button('Renew node ① details', id='renewNode'),
	html.Button('Add to node ①', id='addNode'),
	html.Button('Delete node ① or edge', id='delNode_or_Edge'),
	html.Button('Link nodes ②⇢①', id='linkNodes'),
	html.P(children = "②=none ①=none", id='selectedNode',
		style={'display':'inline-block', 'margin':'10px'}),
	html.Br(),
	html.Div([
		html.Label("Task name", id='task_name_label'),
		html.Br(),
		dcc.Input(id = 'task_name',
			placeholder = 'Task name:',
			type = 'text',
			value = '' ),
		html.Div([
			dcc.RadioItems(id = 'task_status',
				options=[
					{'label': 'In Progress', 'value': None},
					{'label': 'Done', 'value': '#f77'},
					{'label': 'Paused', 'value': '#999'} ],
				labelStyle={'display': 'block'},
				style = {'display':'inline-block'},
				value = None),
			html.Div([
				html.Label("[blue]", style={'color':'#33f'}, id='dummy'),
				html.Br(),
				html.Label("[red]", style={'color':'#f44'}),
				html.Br(),
				html.Label("[grey]", style={'color':'#777'}),
				], style={'display':'inline-block', 'margin-left':'20px'})
			]),
		dcc.Textarea(id = 'task_details',
			placeholder = 'Task details...',
			style = {'height': 730},
			value = '' ),
		], style = {'display':'inline-block', 'vertical-align':'top'}),
	html.Div([
		visdcc.Network(id = 'net',
			options = dict(height= '880px', width= '950px'),
			style = {
			'background-color': '#C9F9FF',
			'nodes': {
			'font': {
				# required: enables displaying <b>text</b> in the label as bold text
				'multi': 'html',
				# optional: use this if you want to specify the font of bold text
				# bold: '16px arial black'
				}
			}})
		], style = {'display':'inline-block'}),
	html.Br(),
	html.Button('Save ProjectGraph.json', id='saveGraph'),
	html.Button('Load ProjectGraph.json', id='loadGraph'),
])

selected_node_1 = None
selected_node_2 = None
selected_edge = None

task_name = ""
task_status = None
task_details = ""

def ordinal(a, b):
	"""
	# A function to convert 2 numbers ('to' and 'from') into 1 number
	# But it's not very meaningful to save just a few bytes
	# So we won't use it.
	oct_a = "{0:o}".format(a)
	oct_b = "{0:o}".format(b)
	c = ""
	for i in range(max(len(oct_a), len(oct_b))):
		hex_c = "0123456789ABCDEF"[int(oct_a[i]) + int(oct_b[i])]
		c = hex_c + c
	return int(c, 16)
	"""
	return str(a)+'-'+str(b)

# ===== Create initial Project Graph =====

init_nodes = ["Root", "商业计划书", "技术白皮书", "网站", "Git 界面", "Neo4j 界面",
	"聊天室 界面", "DAO 界面"]

net = { 'nodes': [], 'edges': []}
node_index = 0
for n in init_nodes:
	net['nodes'].append({'id': node_index, 'label': n, 'shape': 'box'})
	node_index += 1

# decorate Root node
net['nodes'][0]['color'] = 'cyan'
# net['nodes'][0]['style'] = {'font': { 'size': 24, 'color': 'white' }}

node_index = 1
for n in init_nodes[1:]:
	net['edges'].append({'id': ordinal(node_index, 0), 'from': node_index, 'to': 0, 'arrows': 'to'})
	node_index += 1

# When new network is loaded, need to set index > all other nodes
def set_node_index():
	global node_index
	node_index = 0
	for n in net['nodes']:
		if n['id'] > node_index:
			node_index = n['id']
	node_index += 1
	return

# ===== Process callback events =====

@app.callback(								# select Node / Edge in graph
	Output('selectedNode', 'children'),
	Input('net', 'selection'))
def clicked_node(selected):
	global selected_node_1, selected_node_2, selected_edge
	print("selected =", selected)
	if selected is not None:
		if len(selected['nodes']) > 0:
			newNode = selected['nodes'][0]
			if selected_node_1 != newNode:
				selected_node_2 = selected_node_1
				selected_node_1 = newNode
		elif len(selected['edges']) > 0:
			selected_node_1 = None
			selected_node_2 = None
			selected_edge = selected['edges'][0]
			return "edge:" + selected_edge
	selected_edge = None
	name_1 = next((n['label'] for n in net['nodes'] if n["id"] == selected_node_1), "none")
	name_2 = next((n['label'] for n in net['nodes'] if n["id"] == selected_node_2), "none")
	return "②=[" + name_2 + "] ①=[" + name_1 + "]"

@app.callback(								# Task Name should change when node clicked
	Output(component_id='task_name', component_property='value'),
	Input('net', 'selection'))
def myfun(selected):
	if selected is not None and len(selected['nodes']) > 0:
		s = selected['nodes'][0]
		val = next((n['label'] for n in net['nodes'] if n["id"] == s), None)
		return val
	return None

@app.callback(								# Task Details should change when node clicked
	Output(component_id='task_details', component_property='value'),
	Input('net', 'selection'))
def myfun(selected):
	if selected is not None and len(selected['nodes']) > 0:
		s = selected['nodes'][0]
		found = next((n for n in net['nodes'] if n["id"] == s), None)
		if 'details' in found:
			return found['details']
	return ""

@app.callback(								# Task Status should change when node clicked
	Output(component_id='task_status', component_property='value'),
	Input('net', 'selection'))
def myfun(selected):
	if selected is not None and len(selected['nodes']) > 0:
		s = selected['nodes'][0]
		found = next((n for n in net['nodes'] if n["id"] == s), None)
		if 'color' in found:
			return found['color']
	return None

@app.callback(								# typing in Task Name
	Output('task_name_label', 'children'),
	Input('task_name', 'value'),
	)
def myfun(val):
	global task_name
	task_name = val
	return "Task name = " + (val if val is not None else "")

@app.callback(								# typing in Task Details
	# dummy output:
	Output('dummy', 'style'),
	Input('task_details', 'value'),
	)
def myfun(val):
	global task_details
	task_details = val
	# must return this (dummy) value:
	return {'color':'33f'}

@app.callback(								# Task status radio button changed
	# dummy output:
    Output('task_name_label', 'style'),
    Input('task_status', 'value'))
def myfun(val):
	global task_status
	print("Status =", val)
	task_status = val
	return None

@app.callback(								# Click various buttons
	Output('net', 'data'),
	dash.dependencies.Input('addNode', 'n_clicks'),
	dash.dependencies.Input('delNode_or_Edge', 'n_clicks'),
	dash.dependencies.Input('linkNodes', 'n_clicks'),
	dash.dependencies.Input('renewNode', 'n_clicks'),
	dash.dependencies.Input('saveGraph', 'n_clicks'),
	dash.dependencies.Input('loadGraph', 'n_clicks')
	)
def myfun(btn1, btn2, btn3, btn4, btn5, btn6):
	global net, node_index, task_name, task_status, task_details, selected_node_1, selected_node_2
	print("node_index =", node_index)
	print("task_name =", task_name)
	print("selected_node_1 =", selected_node_1)
	# print("triggered = ", callback_context.triggered)
	button_id = callback_context.triggered[0]['prop_id']
	print(button_id + " clicked")

	if button_id[:7] == 'addNode':
		net['nodes'].append({'id': node_index, 'label': task_name, 'shape': 'box'})
		net['edges'].append({'id': ordinal(node_index, selected_node_1),
			'from': node_index, 'to': selected_node_1, 'arrows': 'to'})
		node_index += 1
		return net

	if button_id[:15] == 'delNode_or_Edge':
		if selected_edge is not None:
			for e in net['edges']:
				if e['id'] == selected_edge:
					net['edges'].remove(e)
			return net
		print("# nodes =", len(net['nodes']))
		for n in net['nodes']:
			print("matching:", n)
			if n['id'] == selected_node_1:
				net['nodes'].remove(n)
		# Don't forget to delete all edges to OR from this node!
		collection = []
		for e in net['edges']:
			print("matching:", e)
			if e['to'] == selected_node_1 or \
			   e['from'] == selected_node_1:
				print("Will delete edge:", e)
				collection.append(e)
		for e in collection:
			net['edges'].remove(e)
		# print("result =", net)
		return net

	if button_id[:9] == 'linkNodes':
		net['edges'].append({'id': ordinal(selected_node_2, selected_node_1),
			'from': selected_node_2, 'to': selected_node_1, 'arrows': 'to'})
		return net

	if button_id[:9] == 'renewNode':
		for n in net['nodes']:
			if n['id'] == selected_node_1:
				if task_name is not None:
					n['label'] = task_name
				n['color'] = task_status
				n['details'] = task_details
				# etc ...
		return net

	if button_id[:9] == 'saveGraph':
		# json_str = json.dumps(net, indent=2)
		json_str = json.dumps(net, separators=(',', ':'))
		print("To save: ", json_str)
		with open("ProjectGraph.json", "w+") as outfile:
			outfile.write(json_str)
		return net

	if button_id[:9] == 'loadGraph':
		with open("ProjectGraph.json", "r") as infile:
			json_str = infile.read()
		net = json.loads(json_str)
		# print("Net = ", net)
		set_node_index()
		return net

	return net

if __name__ == '__main__':
	app.run_server()
