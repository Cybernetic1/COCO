/* Module 6: js/project-graph/utility-functions.js
Purpose: Core utility functions and helpers

get_label_in_lang() - Get label in current language
init_nodes() - Initialize node dataset
update_node_index() - Update node index mapping
*/

// Initialize node labels to be in default language; set node colors
function init_nodes() {
	nodes.forEach((node) => {
		node.label = get_label_in_lang(node);
		node.color = ('status' in node) ? nodeColors[node.status] : nodeColors['in-progress'];
		});
	nodes.updateOnly({ id: 0, color: 'cyan' });
	}
init_nodes();

// Returns a node's label in the language in 'lang' variable
function get_label_in_lang(node) {
	return (lang == 'ZH' && ('labelZH' in node)) ? node.labelZH : node.labelEN;
	}


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

