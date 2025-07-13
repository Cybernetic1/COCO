/**
 * NETWORK EVENTS MODULE
 * 
 * Handles all network interaction events and user input for the Vis.js network visualization.
 * This module manages mouse interactions, keyboard shortcuts, and network event listeners.
 * 
 * RESPONSIBILITIES:
 * - Drag-to-link functionality (Ctrl+drag between nodes)
 * - Node/edge selection and highlighting
 * - Right-click context menu positioning and detection
 * - Mouse hover effects and visual feedback
 * - Click handling for nodes, edges, and canvas
 * - Coordinate transformations between DOM and network space
 * 
 * KEY FEATURES:
 * - Ctrl+drag linking: Hold Ctrl and drag from one node to another to create edges
 * - Context-sensitive menus: Right-click nodes, edges, or canvas for different options
 * - Visual feedback: Nodes highlight on hover, selection states update UI
 * - Geometric edge detection: Custom algorithm for detecting edge clicks with tolerance
 * - Error handling: Robust error handling for network API calls
 * 
 * DEPENDENCIES:
 * - Global: network, nodes, edges, data, options, viz
 * - Global: selectedNodeId, selectedEdgeId, contextMenuNodeId, contextMenuEdgeId
 * - Global: dragSourceNodeId, dragToLinkActive (defined in this module)
 * - Functions: updateChineseNameSectionVisibility() from ui-operations.js
 * - Audio: techClick, techClick2 from main project-graph.js
 * 
 * EXPORTS:
 * - setupNetworkEvents(network): Main initialization function
 * - onClick(params): Click event handler for network elements
 * 
 * USAGE:
 * Called automatically when network is stabilized. Sets up all event listeners
 * and interaction handlers for the network visualization.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
 */

// --- Drag-to-link functionality variables ---
let dragSourceNodeId = null;
let dragToLinkActive = false;


// Helper function to set up network event listeners
function setupNetworkEvents(network) {
    // Ensure network is fully initialized before setting up events
    if (!network || !network.body || !network.body.container || !network.getNodeAt) {
        console.warn('Network not fully initialized, skipping event setup');
        return;
    }
    
    // Additional check for selection handler
    if (!network.selectionHandler && !network.body.selectionHandler) {
        console.warn('Network selection handler not ready, skipping event setup');
        return;
    }
    
    // Helper function to calculate distance from a point to a line segment
    function distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            // Line segment is actually a point
            return Math.sqrt(A * A + B * B);
        }
        
        let param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // --- Drag-to-link hover events ---
    // Highlight hovered node for feedback (use bold font, not color)
    network.on("hoverNode", function(params) {
        nodes.update({ id: params.node, font: { bold: true } });
    });
    network.on("blurNode", function(params) {
        nodes.update({ id: params.node, font: { bold: false } });
    });

    // --- Drag-to-link mouse events ---
    // Listen for mousedown to start drag-to-link if Ctrl is pressed
    viz.addEventListener('mousedown', function(e) {
        // Only proceed if network is fully initialized
        if (!network || !network.body || !network.body.container) return;
        
        const rect = viz.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let nodeId;
        try {
            // Try getNodeAt with proper error handling
            nodeId = network.getNodeAt.call(network, {x, y});
        } catch (error) {
            console.warn('getNodeAt failed in mousedown:', error);
            return;
        }
        
        if (nodeId !== undefined && e.ctrlKey) {
            dragSourceNodeId = nodeId;
            dragToLinkActive = true;
            network.body.container.style.cursor = "crosshair";
            // Prevent panning and node dragging when Ctrl is held and node is clicked
            network.setOptions({ interaction: { ...options.interaction, dragView: false, dragNodes: false } });
            // Disable physics for the whole network during drag-to-link
            network.setOptions({ physics: { enabled: false } });
            e.preventDefault();
            return false;
        }
    });

    // Listen for mousemove to highlight possible target node (use bold font, not color)
    viz.addEventListener('mousemove', function(e) {
        // Only proceed if network is fully initialized
        if (!network || !network.body || !network.body.container) return;
        
        if (dragToLinkActive && dragSourceNodeId !== null) {
            const rect = viz.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            let targetNodeId;
            try {
                // Try getNodeAt with proper error handling
                targetNodeId = network.getNodeAt.call(network, {x, y});
            } catch (error) {
                console.warn('getNodeAt failed in mousemove:', error);
                return;
            }
            
            // Optionally highlight target node (not source)
            if (targetNodeId !== undefined && targetNodeId !== dragSourceNodeId) {
                nodes.update({ id: targetNodeId, font: { bold: true } });
            }
        }
    });

    // Listen for mouseup to finish drag-to-link
    viz.addEventListener('mouseup', function(e) {
        // Only proceed if network is fully initialized
        if (!network || !network.body || !network.body.container) return;
        
        if (dragToLinkActive && dragSourceNodeId !== null) {
            const rect = viz.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            let targetNodeId;
            try {
                // Try getNodeAt with proper error handling
                targetNodeId = network.getNodeAt.call(network, {x, y});
            } catch (error) {
                console.warn('getNodeAt failed in mouseup:', error);
                targetNodeId = undefined;
            }
            
            if (targetNodeId !== undefined && targetNodeId !== dragSourceNodeId) {
                data.edges.add({ from: dragSourceNodeId, to: targetNodeId });
                techClick2.play();
            }
            dragSourceNodeId = null;
            dragToLinkActive = false;
            network.body.container.style.cursor = "";
            // Restore panning and node dragging after drag-to-link
            network.setOptions({ interaction: { ...options.interaction, dragView: true, dragNodes: true } });
            // Re-enable physics for the network
            network.setOptions({ physics: { enabled: true } });
        }
    });

    network.on("click", onClick);
    
    // Right-click event handler for nodes
    network.on("oncontext", function(params) {
        params.event.preventDefault(); // Prevent default browser context menu
        
        // Try node detection first (prioritize nodes over edges)
        let nodeId = null;
        if (params.nodes.length > 0) {
            nodeId = params.nodes[0];
        } else {
            // Alternative method: use getNodeAt with canvas coordinates
            try {
                const nodeAtPosition = network.getNodeAt.call(network, params.pointer);
                if (nodeAtPosition !== undefined) {
                    nodeId = nodeAtPosition;
                }
            } catch (error) {
                console.warn('getNodeAt failed in oncontext, network may not be ready:', error);
            }
        }
        
        // Check for edges only if no node was found
        let edgeId = null;
        if (nodeId === null && params.edges.length > 0) {
            edgeId = params.edges[0];
        } else if (nodeId === null) {
            // No edge detected by vis.js - try geometric fallback
            let closestEdge = null;
            let minDistance = Infinity;
            const scale = network.getScale();
            const toleranceInWorldUnits = 20 / scale; // Convert pixel tolerance to world units
            
            edges.forEach(function(edge) {
                try {
                    const fromPos = network.getPositions([edge.from])[edge.from];
                    const toPos = network.getPositions([edge.to])[edge.to];
                    
                    if (fromPos && toPos) {
                        // Use mouse position in world coordinates
                        const clickWorldPos = network.DOMtoCanvas(params.pointer.DOM);
                        
                        // Calculate distance from click point to edge line using world coordinates
                        const distance = distanceToLineSegment(
                            clickWorldPos,
                            fromPos,
                            toPos
                        );
                        
                        if (distance < toleranceInWorldUnits && distance < minDistance) {
                            minDistance = distance;
                            closestEdge = edge;
                        }
                    }
                } catch (error) {
                    // Skip this edge if there's an error getting positions
                }
            });
            
            if (closestEdge) {
                edgeId = closestEdge.id;
            }
        }
        
        // Hide any open context menus first
        const nodeContextMenu = document.getElementById('node-context-menu');
        const edgeContextMenu = document.getElementById('edge-context-menu');
        const canvasContextMenu = document.getElementById('canvas-context-menu');
        if (nodeContextMenu) nodeContextMenu.style.display = 'none';
        if (edgeContextMenu) edgeContextMenu.style.display = 'none';
        if (canvasContextMenu) canvasContextMenu.style.display = 'none';
        
        if (nodeId !== null) {
            // Right-clicked on a node (prioritized)
            contextMenuNodeId = nodeId;
            contextMenuEdgeId = null;
            const node = data.nodes.get(contextMenuNodeId);
            
            if (node) {
                // Update radio buttons to reflect current node status
                const statusRadios = document.querySelectorAll('#node-context-menu input[name="context-status"]');
                statusRadios.forEach(radio => {
                    radio.checked = (radio.value === (node.status || 'in-progress'));
                });
                
                // Show node context menu at mouse position
                if (nodeContextMenu) {
                    nodeContextMenu.style.display = 'block';
                    nodeContextMenu.style.left = params.event.clientX + 'px';
                    nodeContextMenu.style.top = params.event.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = nodeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        nodeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        nodeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        } else if (edgeId !== null) {
            // Right-clicked on an edge (only if no node found)
            contextMenuEdgeId = edgeId;
            contextMenuNodeId = null;
            const edge = data.edges.get(contextMenuEdgeId);
            
            if (edge) {
                // Update radio buttons to reflect current edge type
                const typeRadios = document.querySelectorAll('#edge-context-menu input[name="context-edge-type"]');
                const isAuxiliary = edge.dashes === true;
                typeRadios.forEach(radio => {
                    radio.checked = (radio.value === (isAuxiliary ? 'auxiliary' : 'normal'));
                });
                
                // Show edge context menu at mouse position
                if (edgeContextMenu) {
                    edgeContextMenu.style.display = 'block';
                    edgeContextMenu.style.left = params.event.clientX + 'px';
                    edgeContextMenu.style.top = params.event.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = edgeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        edgeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        edgeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        } else {
            // Right-clicked on empty space - reset context menu state
            contextMenuNodeId = null;
            contextMenuEdgeId = null;
        }
    });

    // Alternative right-click handler using direct canvas event
    const canvas = network.body.container;
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Hide any open context menus first
        const nodeContextMenu = document.getElementById('node-context-menu');
        const edgeContextMenu = document.getElementById('edge-context-menu');
        const canvasContextMenu = document.getElementById('canvas-context-menu');
        if (nodeContextMenu) nodeContextMenu.style.display = 'none';
        if (edgeContextMenu) edgeContextMenu.style.display = 'none';
        if (canvasContextMenu) canvasContextMenu.style.display = 'none';
        
        let nodeId = null;
        try {
            // Try to get node at position, with error handling
            nodeId = network.getNodeAt.call(network, {x: x, y: y});
        } catch (error) {
            console.warn('getNodeAt failed, network may not be ready:', error);
            return;
        }
        
        if (nodeId !== undefined) {
            // Found a node
            contextMenuNodeId = nodeId;
            contextMenuEdgeId = null;
            const node = data.nodes.get(contextMenuNodeId);
            
            if (node) {
                // Update radio buttons to reflect current node status
                const statusRadios = document.querySelectorAll('#node-context-menu input[name="context-status"]');
                statusRadios.forEach(radio => {
                    radio.checked = (radio.value === (node.status || 'in-progress'));
                });
                
                // Show node context menu at mouse position
                if (nodeContextMenu) {
                    nodeContextMenu.style.display = 'block';
                    nodeContextMenu.style.left = e.clientX + 'px';
                    nodeContextMenu.style.top = e.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = nodeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        nodeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        nodeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        } else {
            // No node found, try to find an edge by checking if click is near any edge
            let closestEdge = null;
            let minDistance = 15; // world coordinate units tolerance for edge detection
            
            // Get current zoom scale for conversion
            const scale = network.getScale();
            const pixelToWorldRatio = 1 / scale;
            const toleranceInWorldUnits = 20 * pixelToWorldRatio; // Convert pixel tolerance to world units
            
            edges.forEach(function(edge) {
                try {
                    const fromPos = network.getPositions([edge.from])[edge.from];
                    const toPos = network.getPositions([edge.to])[edge.to];
                    
                    if (fromPos && toPos) {
                        // Convert canvas coordinates to world coordinates for consistent comparison
                        const clickWorldPos = network.DOMtoCanvas({x: x, y: y});
                        
                        // Calculate distance from click point to edge line using world coordinates
                        const distance = distanceToLineSegment(
                            clickWorldPos,
                            fromPos,
                            toPos
                        );
                        
                        if (distance < toleranceInWorldUnits && distance < minDistance) {
                            minDistance = distance;
                            closestEdge = edge;
                        }
                    }
                } catch (error) {
                    // Skip this edge if there's an error getting positions
                }
            });
            
            // console.log('Closest edge found:', closestEdge ? closestEdge.id : 'none');
            
            if (closestEdge) {
                // Found an edge
                contextMenuEdgeId = closestEdge.id;
                contextMenuNodeId = null;
                
                // Update radio buttons to reflect current edge type
                const typeRadios = document.querySelectorAll('#edge-context-menu input[name="context-edge-type"]');
                const isAuxiliary = closestEdge.dashes === true;
                typeRadios.forEach(radio => {
                    radio.checked = (radio.value === (isAuxiliary ? 'auxiliary' : 'normal'));
                });
                
                // Show edge context menu at mouse position
                if (edgeContextMenu) {
                    edgeContextMenu.style.display = 'block';
                    edgeContextMenu.style.left = e.clientX + 'px';
                    edgeContextMenu.style.top = e.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = edgeContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        edgeContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        edgeContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            } else {
                // No node or edge found - show canvas context menu
                contextMenuNodeId = null;
                contextMenuEdgeId = null;
                
                // Show canvas context menu at mouse position
                const canvasContextMenu = document.getElementById('canvas-context-menu');
                if (canvasContextMenu) {
                    canvasContextMenu.style.display = 'block';
                    canvasContextMenu.style.left = e.clientX + 'px';
                    canvasContextMenu.style.top = e.clientY + 'px';
                    
                    // Ensure menu stays within viewport
                    const rect = canvasContextMenu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    if (rect.right > viewportWidth) {
                        canvasContextMenu.style.left = (viewportWidth - rect.width - 10) + 'px';
                    }
                    if (rect.bottom > viewportHeight) {
                        canvasContextMenu.style.top = (viewportHeight - rect.height - 10) + 'px';
                    }
                }
                
                techClick.play().catch(() => {}); // Ignore audio errors
            }
        }
    });
}

// On clicking a node or edge on Vis.js canvas
function onClick(params) {
    if (dragToLinkActive) return;
    if (params['nodes'].length > 0) {
        selectedNodeId = params['nodes'][0];
        selectedEdgeId = null;
        const node = data.nodes.get(selectedNodeId);
        if (node) {
            const taskNameEN = document.getElementById("TaskNameEN");
            const taskNameZH = document.getElementById("TaskNameZH");
            const details = document.getElementById("Details");
            
            if (taskNameEN) taskNameEN.value = node.labelEN || "";
            if (taskNameZH) taskNameZH.value = node.labelZH || "";
            updateChineseNameSectionVisibility(node.labelZH);
            if (details) details.value = node.details || "";
            
            // Update status radio buttons
            const statuses = ["in-progress", "finished", "paused", "research"];
            statuses.forEach(status => {
                const radio = document.getElementById(status);
                if (radio) radio.checked = (node.status === status);
            });
        }
        
        // Show node-specific elements, hide edge-specific elements
        const nodeElements = document.getElementById("nodeElements");
        const edgeElements = document.getElementById("edgeElements");
        if (nodeElements) nodeElements.style.display = "block";
        if (edgeElements) edgeElements.style.display = "none";
        
        techClick.play();
    } else if (params['edges'].length > 0) {
        selectedEdgeId = params['edges'][0];
        selectedNodeId = null;
        const edge = data.edges.get(selectedEdgeId);
        if (edge) {
            const edgeNameEN = document.getElementById("EdgeNameEN");
            if (edgeNameEN) edgeNameEN.value = edge.label || "";
            
            // Show edge-specific elements, hide node-specific elements
            const nodeElements = document.getElementById("nodeElements");
            const edgeElements = document.getElementById("edgeElements");
            if (nodeElements) nodeElements.style.display = "none";
            if (edgeElements) edgeElements.style.display = "block";
            
            const dashes = edge.dashes === true;
            const edgeColorAux = document.getElementById("edgeColorAux");
            const edgeColorNormal = document.getElementById("edgeColorNormal");
            
            if (dashes) {
                if (edgeColorAux) edgeColorAux.checked = true;
                if (edgeColorNormal) edgeColorNormal.checked = false;
            } else {
                if (edgeColorNormal) edgeColorNormal.checked = true;
                if (edgeColorAux) edgeColorAux.checked = false;
            }
        }
        
        // Show edge-specific elements, hide node-specific elements
        const nodeElements = document.getElementById("nodeElements");
        const edgeElements = document.getElementById("edgeElements");
        if (nodeElements) nodeElements.style.display = "none";
        if (edgeElements) edgeElements.style.display = "block";
        
        techClick.play();
    } else {
        selectedNodeId = null;
        selectedEdgeId = null;
        
        // Show both node and edge elements when nothing is selected
        const nodeElements = document.getElementById("nodeElements");
        const edgeElements = document.getElementById("edgeElements");
        if (nodeElements) nodeElements.style.display = "block";
        if (edgeElements) edgeElements.style.display = "none"; // Hide edge elements by default
        
        // Optionally clear the side pane fields
        const taskNameEN = document.getElementById("TaskNameEN");
        const taskNameZH = document.getElementById("TaskNameZH");
        const details = document.getElementById("Details");
        const edgeNameEN = document.getElementById("EdgeNameEN");
        
        if (taskNameEN) taskNameEN.value = "";
        if (taskNameZH) taskNameZH.value = "";
        updateChineseNameSectionVisibility("");
        if (details) details.value = "";
        if (edgeNameEN) edgeNameEN.value = "";
    }
}

// Make setupNetworkEvents globally available
window.setupNetworkEvents = setupNetworkEvents;

