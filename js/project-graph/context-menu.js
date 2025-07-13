/**
 * CONTEXT MENU MODULE
 * 
 * Handles all right-click context menu functionality for nodes, edges, and canvas.
 * Provides quick access to common operations like changing node status or edge types.
 * 
 * RESPONSIBILITIES:
 * - Node status changes via right-click menu (in-progress, finished, paused, research)
 * - Edge type changes via right-click menu (normal vs auxiliary/dashed)
 * - Context menu state management and cleanup
 * - Node page navigation from context menu
 * - Menu visibility and positioning (handled by network-events.js)
 * 
 * KEY FEATURES:
 * - Quick status changes: Right-click node → select new status → immediate update
 * - Edge type toggling: Right-click edge → toggle between normal and auxiliary
 * - Visual feedback: Status changes immediately update node colors
 * - Side panel sync: Updates side panel radio buttons when status changes
 * - Node navigation: Open dedicated page for selected node
 * 
 * DEPENDENCIES:
 * - Global: contextMenuNodeId, contextMenuEdgeId (set by network-events.js)
 * - Global: data.nodes, data.edges (Vis.js DataSets)
 * - Global: nodeColors (color configuration object)
 * - Global: selectedNodeId (for side panel synchronization)
 * - Audio: techClick2 for user feedback
 * - Functions: Called by HTML onclick handlers in context menu elements
 * 
 * EXPORTS:
 * - changeStatusFromContextMenu(newStatus): Updates node status from context menu
 * - changeEdgeTypeFromContextMenu(newType): Updates edge type from context menu
 * - openNodePage(): Opens dedicated page for the context menu node
 * 
 * USAGE:
 * Functions are called automatically when user clicks context menu options.
 * Context menu positioning and display is handled by network-events.js module.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
 */

// Handle status change from context menu
function changeStatusFromContextMenu(newStatus) {
    if (contextMenuNodeId !== null) {
        const node = data.nodes.get(contextMenuNodeId);
        if (node) {
            // Update node status and color
            data.nodes.update({
                id: contextMenuNodeId,
                status: newStatus,
                color: nodeColors[newStatus]
            });
            
            // If this node is also selected in the side pane, update the side pane radio buttons
            if (selectedNodeId === contextMenuNodeId) {
                const sideRadio = document.getElementById(newStatus);
                if (sideRadio) sideRadio.checked = true;
            }
            
            techClick2.play().catch(() => {}); // Ignore audio errors
        }
        
        // Hide context menu
        const contextMenu = document.getElementById('node-context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        contextMenuNodeId = null;
    }
}

// Handle edge type change from context menu
function changeEdgeTypeFromContextMenu(newType) {
    if (contextMenuEdgeId !== null) {
        const edge = data.edges.get(contextMenuEdgeId);
        if (edge) {
            // Update edge type (normal vs auxiliary)
            const isAuxiliary = (newType === 'auxiliary');
            data.edges.update({
                id: contextMenuEdgeId,
                dashes: isAuxiliary,
                color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }
            });
            
            // If this edge is also selected in the side pane, update the side pane radio buttons
            if (selectedEdgeId === contextMenuEdgeId) {
                if (isAuxiliary) {
                    document.getElementById("edgeColorAux").checked = true;
                    document.getElementById("edgeColorNormal").checked = false;
                } else {
                    document.getElementById("edgeColorNormal").checked = true;
                    document.getElementById("edgeColorAux").checked = false;
                }
            }
            
            techClick2.play().catch(() => {}); // Ignore audio errors
        }
        
        // Hide context menu
        const edgeContextMenu = document.getElementById('edge-context-menu');
        if (edgeContextMenu) {
            edgeContextMenu.style.display = 'none';
        }
        contextMenuEdgeId = null;
    }
}

// Open node page for the context menu node
function openNodePage() {
    if (contextMenuNodeId !== null) {
        // Open node-page.html in a new tab with the node ID as a URL parameter
        window.open(`node-page.html?id=${contextMenuNodeId}`, '_blank');
    }
    
    // Hide context menu
    const contextMenu = document.getElementById('node-context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    contextMenuNodeId = null;
}

// Setup context menu event listeners
function setupContextMenuEvents() {
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', function(e) {
        const nodeContextMenu = document.getElementById('node-context-menu');
        const edgeContextMenu = document.getElementById('edge-context-menu');
        const canvasContextMenu = document.getElementById('canvas-context-menu');
        
        if (nodeContextMenu && !nodeContextMenu.contains(e.target)) {
            nodeContextMenu.style.display = 'none';
            contextMenuNodeId = null;
        }
        
        if (edgeContextMenu && !edgeContextMenu.contains(e.target)) {
            edgeContextMenu.style.display = 'none';
            contextMenuEdgeId = null;
        }
        
        if (canvasContextMenu && !canvasContextMenu.contains(e.target)) {
            canvasContextMenu.style.display = 'none';
        }
    });

    // Hide context menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const nodeContextMenu = document.getElementById('node-context-menu');
            const edgeContextMenu = document.getElementById('edge-context-menu');
            const canvasContextMenu = document.getElementById('canvas-context-menu');
            
            if (nodeContextMenu) {
                nodeContextMenu.style.display = 'none';
                contextMenuNodeId = null;
            }
            
            if (edgeContextMenu) {
                edgeContextMenu.style.display = 'none';
                contextMenuEdgeId = null;
            }
            
            if (canvasContextMenu) {
                canvasContextMenu.style.display = 'none';
            }
        }
    });
}

// Make functions global
window.changeStatusFromContextMenu = changeStatusFromContextMenu;
window.changeEdgeTypeFromContextMenu = changeEdgeTypeFromContextMenu;
window.openNodePage = openNodePage;
window.setupContextMenuEvents = setupContextMenuEvents;

// Call the setup function to initialize event listeners
setupContextMenuEvents();
