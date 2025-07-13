/**
 * TREE VALIDATION MODULE
 * 
 * Validates graph structure and highlights tree structure violations.
 * Ensures the project graph maintains a valid tree structure with auxiliary edges
 * for non-tree connections, supporting project hierarchy visualization.
 * 
 * RESPONSIBILITIES:
 * - Tree structure validation and cycle detection
 * - Auxiliary edge identification and highlighting
 * - Graph structure analysis and reporting
 * - Visual feedback for structural violations
 * - Preservation of manually set auxiliary edges
 * - Root node identification and validation
 * 
 * KEY FEATURES:
 * - Cycle detection: Identifies and marks edges that create cycles
 * - Auxiliary edge preservation: Maintains user-set auxiliary edges
 * - Visual highlighting: Uses dashed lines for auxiliary/non-tree edges
 * - Tree verification: Validates that graph forms a proper tree structure
 * - Root-based analysis: Performs tree validation from identified root nodes
 * - Incremental updates: Can re-validate after graph modifications
 * 
 * DEPENDENCIES:
 * - Global: edges (Vis.js DataSet for graph edges)
 * - Global: nodes (Vis.js DataSet for graph nodes) 
 * - Graph theory: Uses DFS and topological concepts
 * - Visual feedback: Updates edge appearance (dashes, colors)
 * 
 * EXPORTS:
 * - highlightTreeViolations(): Main validation function, identifies and marks violations
 * - verifyTreeIgnoringAuxEdges(): Validates tree structure ignoring auxiliary edges
 * - [Internal helper functions for graph analysis]
 * 
 * USAGE:
 * Called after graph modifications to maintain tree structure integrity.
 * Automatically highlights violations and preserves user-designated auxiliary edges.
 * Used by UI actions that need to verify graph structure validity.
 * 
 * ALGORITHM:
 * 1. Preserve manually set auxiliary edges
 * 2. Build adjacency maps for graph traversal  
 * 3. Identify root nodes (nodes with no incoming edges)
 * 4. Perform DFS from roots to find spanning tree
 * 5. Mark remaining edges as auxiliary (cycle-creating)
 * 6. Update visual representation with dashed lines
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-13
 */
function highlightTreeViolations() {
    // Store manually set auxiliary edges before resetting
    const manuallyAuxEdges = new Set();
    edges.forEach(function(edge) {
        const dashes = edge.dashes;
        if (dashes === true) {
            manuallyAuxEdges.add(edge.id);
        }
    });

    // Reset only non-manually-auxiliary edges to default
    edges.forEach(function(edge) {
        if (!manuallyAuxEdges.has(edge.id)) {
            edges.update({ id: edge.id, color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }, dashes: false });
        }
    });

    // 1. Build outgoing edge map: nodeId -> [edge]
    const outgoingMap = {};
    edges.forEach(function(edge) {
        if (!outgoingMap[edge.from]) outgoingMap[edge.from] = [];
        outgoingMap[edge.from].push(edge);
    });

    // 2. Mark nodes with multiple outgoing edges (multiple parents)
    const multiParentEdges = new Set();
    for (const from in outgoingMap) {
        if (from != '0' && outgoingMap[from].length > 1) {
            outgoingMap[from].forEach(edge => multiParentEdges.add(edge.id));
        }
    }

    // 3. For each node (except root), follow parent links up to root
    //    Mark all edges on valid paths as treeEdges
    const treeEdges = new Set();
    const cycleEdges = new Set();
    const notConnectedEdges = new Set();
    const nodeIds = nodes.getIds().map(String);
    for (const nodeId of nodeIds) {
        if (nodeId === '0') continue; // skip root
        let current = nodeId;
        const path = [];
        const visited = new Set();
        let foundRoot = false;
        while (true) {
            if (visited.has(current)) {
                // Cycle detected
                for (const e of path) cycleEdges.add(e.id);
                break;
            }
            visited.add(current);
            const outs = outgoingMap[current];
            if (!outs || outs.length === 0) {
                // Dead end, not connected to root
                for (const e of path) notConnectedEdges.add(e.id);
                break;
            }
            // Only follow the first outgoing edge (if multiple, all are already marked as multi-parent)
            const edge = outs[0];
            path.push(edge);
            if (edge.to == '0') {
                // Reached root
                for (const e of path) treeEdges.add(e.id);
                foundRoot = true;
                break;
            }
            current = String(edge.to);
        }
    }

    // 4. Highlight violations as auxiliary edges (but preserve manually set auxiliary edges)
    edges.forEach(function(edge) {
        if (!manuallyAuxEdges.has(edge.id) && (multiParentEdges.has(edge.id) || cycleEdges.has(edge.id) || notConnectedEdges.has(edge.id) || !treeEdges.has(edge.id))) {
            edges.update({ id: edge.id, color: { color: '#AAA', highlight: '#000', inherit: false, opacity: 1.0 }, dashes: true });
        }
    });
}
// --- End tree structure violation highlighting ---

// Only call highlightTreeViolations after add/remove edge/node, but not on load
edges.on("add", function() { 
    // Add a small delay to ensure the edge is fully added before highlighting
    setTimeout(highlightTreeViolations, 10); 
});
edges.on("remove", function() { highlightTreeViolations(); });
nodes.on("remove", function() { highlightTreeViolations(); });



// --- Verify tree structure ignoring auxiliary edges ---
function verifyTreeIgnoringAuxEdges() {
    // 1. Collect all non-auxiliary edges
    const nonAuxEdges = [];
    edges.forEach(function(edge) {
        const c = edge.color && edge.color.color ? edge.color.color : '#AAA';
        const dashes = edge.dashes === true;
        if (c !== 'red' && !dashes) nonAuxEdges.push(edge);
    });
    // 2. Build parent map: child -> parent
    const parent = {};
    nonAuxEdges.forEach(function(edge) {
        if (parent[edge.from] !== undefined) {
            // Multiple parents
            alert('Node ' + edge.from + ' has multiple parents (ignoring auxiliary edges). Not a tree.');
            return;
        }
        parent[edge.from] = edge.to;
    });
    // 3. Check for cycles and connectivity
    const nodeIds = nodes.getIds().map(String);
    const visited = new Set();
    let hasCycle = false;
    function dfs(node, ancestors) {
        if (visited.has(node)) return;
        if (ancestors.has(node)) {
            hasCycle = true;
            return;
        }
        ancestors.add(node);
        if (parent[node] !== undefined) {
            dfs(String(parent[node]), ancestors);
        }
        ancestors.delete(node);
        visited.add(node);
    }
    for (const nodeId of nodeIds) {
        if (nodeId === '0') continue;
        dfs(nodeId, new Set());
        if (hasCycle) break;
    }
    if (hasCycle) {
        alert('Cycle detected (ignoring auxiliary edges). Not a tree.');
        return;
    }
    // 4. Check all nodes (except root) are connected to root
    let allToRoot = true;
    for (const nodeId of nodeIds) {
        if (nodeId === '0') continue;
        let cur = nodeId;
        let steps = 0;
        while (cur !== '0' && parent[cur] !== undefined && steps < 1000) {
            cur = String(parent[cur]);
            steps++;
        }
        if (cur !== '0') {
            allToRoot = false;
            break;
        }
    }
    if (!allToRoot) {
        alert('Not all nodes are connected to root (ignoring auxiliary edges). Not a tree.');
        return;
    }
    alert('The graph (ignoring auxiliary edges) is a valid tree rooted at node 0!');
}

// Make functions global
window.verifyTreeIgnoringAuxEdges = verifyTreeIgnoringAuxEdges;
