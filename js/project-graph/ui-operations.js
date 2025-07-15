/**
 * UI OPERATIONS MODULE
 * 
 * Manages user interface controls, modal dialogs, and visual layout operations.
 * Handles side panel management, modal window lifecycle, and language switching
 * for the project graph editor interface.
 * 
 * RESPONSIBILITIES:
 * - Side panel show/hide toggle with responsive layout adjustment
 * - Modal dialog management (open/close for JSON, Git, Node, Help modals)
 * - Language switching between English and Chinese
 * - Chinese input field visibility management
 * - Visualization area resizing and layout updates
 * - Node page navigation from side panel
 * - Audio feedback for user interactions
 * 
 * KEY FEATURES:
 * - Responsive side panel: Automatically adjusts visualization area when toggled
 * - Modal lifecycle: Proper show/hide management for all dialog types
 * - Bilingual support: Dynamic language switching with field visibility
 * - Layout management: Maintains proper sizing for visualization canvas
 * - Navigation integration: Opens dedicated node pages from side panel
 * - Audio feedback: Plays appropriate sounds for user actions
 * 
 * DEPENDENCIES:
 * - Global: viz (visualization canvas element)
 * - Global: pane (side panel DOM element)
 * - Global: lang (current language setting)
 * - DOM: Modal elements (json_modal, git_modal, node_modal, help_modal)
 * - DOM: Side panel elements and buttons
 * - Audio: techClick2 for user feedback
 * - Window: innerHeight, innerWidth for responsive sizing
 * 
 * EXPORTS:
 * - toggleSidePane(): Shows/hides side panel and adjusts layout
 * - close_json_modal(): Closes JSON file operations modal
 * - close_git_modal(): Closes Git operations modal  
 * - close_node_modal(): Closes node editing modal
 * - close_help_modal(): Closes help documentation modal
 * - switchLang(): Toggles between English and Chinese languages
 * - updateChineseNameSectionVisibility(): Shows/hides Chinese input fields
 * - openNodePageFromSidePane(): Opens dedicated page for selected node
 * 
 * USAGE:
 * Functions are called by HTML onclick handlers and UI event listeners.
 * Provides centralized UI state management for the entire application.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
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
        // Save current graph data to localStorage as projectData before opening node-page
        const allNodes = nodes.get();
        const allEdges = edges.get();
        const projectId = typeof projectName !== 'undefined' ? projectName : (window.projectName || 'project-graph');
        const projectData = {
            dataType: 'graph',
            projectId: projectId,
            data: {
                nodes: allNodes,
                edges: allEdges
            }
        };
        localStorage.setItem('projectData', JSON.stringify(projectData));
        // Open node-page.html in a new tab with the node ID as a URL parameter
        window.open(`node-page.html?id=${selectedNodeId}`, '_blank');
    } else {
        alert('Please select a node first');
    }
}

// Make functions global
window.openNodePageFromSidePane = openNodePageFromSidePane;
