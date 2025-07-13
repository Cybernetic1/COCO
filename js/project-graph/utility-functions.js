/**
 * UTILITY FUNCTIONS MODULE
 * 
 * Provides core utility functions and helper methods used throughout the
 * project graph application. Contains language handling, node initialization,
 * and common data processing functions.
 * 
 * RESPONSIBILITIES:
 * - Language-aware label retrieval for bilingual support
 * - Node dataset initialization and setup
 * - Node index management and mapping updates
 * - Common utility functions for data processing
 * - Default value handling and data normalization
 * 
 * KEY FEATURES:
 * - Bilingual label support: Automatically selects correct language labels
 * - Node initialization: Sets up default colors, labels, and properties
 * - Index management: Maintains node ID mapping for efficient operations
 * - Language fallback: Graceful handling when translations are missing
 * - Color management: Applies status-based colors to nodes
 * - Root node special handling: Ensures root node maintains cyan color
 * 
 * DEPENDENCIES:
 * - Global: nodes (Vis.js DataSet)
 * - Global: lang (current language setting: "EN" or "ZH")
 * - Global: nodeColors (status-to-color mapping configuration)
 * - Global: node_index (for unique ID generation)
 * 
 * EXPORTS:
 * - get_label_in_lang(node): Returns appropriate label for current language
 * - init_nodes(): Initializes all nodes with proper labels and colors
 * - update_node_index(): Updates node index mapping after changes
 * 
 * USAGE:
 * Called during application initialization and after data changes.
 * Provides utility functions used by other modules for consistent
 * language and data handling.
 * 
 * LANGUAGE HANDLING:
 * - Uses 'labelEN' as primary label field
 * - Falls back to 'labelZH' when lang="ZH" and Chinese label exists
 * - Ensures consistent labeling across the application
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
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

