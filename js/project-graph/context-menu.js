// Context Menu Module
// All right-click context menu functionality
//
// Functions to move here:
// - changeStatusFromContextMenu()
// - changeEdgeTypeFromContextMenu()
// - openNodePage()

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

