/*
 * Module 3: js/project-graph/ui-operations.js
Purpose: UI controls and modal management

toggleSidePane() - Show/hide side panel
close_json_modal() - Close JSON file modal
close_git_modal() - Close Git modal
close_node_modal() - Close node edit modal
close_help_modal() - Close help modal
switchLang() - Switch between languages
updateChineseNameSectionVisibility() - Show/hide Chinese fields
openNodePageFromSidePane() - Open node page from side panel
*/

// Side pane starts hidden - no need to auto-click the button
// document.getElementById("SidePaneButton").click();

function toggleSidePane() {
	techClick2.play().catch(function (error) {
		// console.log("cannot play sound without user click first");
		});
	viz.style.height = window.innerHeight -40 + "px";
	viz.style.width = window.innerWidth -16 + "px";

	if (pane.style.display == "none") {
		pane.style.display = "inline-block";
		document.getElementById("SidePaneButton2").style.display = "none";
		}
	else {
		pane.style.display = "none";
		document.getElementById("SidePaneButton2").style.display = "inline-block";
		}
	}

// Make sure toggleSidePane is global
window.toggleSidePane = toggleSidePane;

// Prepare modal window for user to input filenames etc
const json_modal = document.getElementById("JSON_modal");
const  git_modal = document.getElementById("Git_modal");
const node_modal = document.getElementById("Node_modal");
const help_modal = document.getElementById("Help_modal");

// Close JSON modal
function close_json_modal() {
    document.getElementById("JSON_modal").style.display = "none";
}
window.close_json_modal = close_json_modal;

// Close modal functions
function close_git_modal() {
    document.getElementById("Git_modal").style.display = "none";
}

function close_node_modal() {
    document.getElementById("Node_modal").style.display = "none";
}

function close_help_modal() {
    document.getElementById("Help_modal").style.display = "none";
}

// Make functions global
window.close_git_modal = close_git_modal;
window.close_node_modal = close_node_modal;
window.close_help_modal = close_help_modal;

// Language switching function
function switchLang() {
  lang = (lang === "EN") ? "ZH" : "EN";
  
  // Update the display of all nodes with new language
  if (typeof nodes !== 'undefined' && nodes) {
    const nodeArray = nodes.get();
    nodeArray.forEach(node => {
      const newLabel = get_label_in_lang(node);
      nodes.update({id: node.id, label: newLabel});
    });
  }
  
  // Update the side panel if a node is selected
  if (selectedNodeId && typeof data !== 'undefined' && data.nodes) {
    const node = data.nodes.get(selectedNodeId);
    if (node) {
      const taskNameEN = document.getElementById("TaskNameEN");
      const taskNameZH = document.getElementById("TaskNameZH");
      
      if (taskNameEN) taskNameEN.value = node.labelEN || "";
      if (taskNameZH) taskNameZH.value = node.labelZH || "";
      updateChineseNameSectionVisibility(node.labelZH);
    }
  }
  
  console.log(`Language switched to: ${lang}`);
}

/**
 * Shows or hides the Chinese name section in the side pane based on whether there's content
 * @param {string} chineseValue - The Chinese label value (can be empty or undefined)
 */
function updateChineseNameSectionVisibility(chineseValue) {
    const chineseSection = document.getElementById("chineseNameSection");
    if (chineseSection) {
        // Show the section if there's content, or if we're in Chinese language mode
        const shouldShow = (chineseValue && chineseValue.trim() !== "") || lang === "ZH";
        chineseSection.style.display = shouldShow ? "block" : "none";
    }
}

function openNodePageFromSidePane() {
    if (selectedNodeId !== null) {
        // Open node-page.html in a new tab with the node ID as a URL parameter
        window.open(`node-page.html?id=${selectedNodeId}`, '_blank');
    } else {
        alert('Please select a node first');
    }
}

// Make functions global
window.openNodePageFromSidePane = openNodePageFromSidePane;
