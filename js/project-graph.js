// New project-graph.js (tree version, clean slate)
// This file is for the new, more readable and intuitive tree-based project graph UI.
// - Enforces a tree structure (one parent per node, except root)
// - No Vis.js dependency by default (add if needed)
// - Right-click on a node brings up a modal for editing

// Example: minimal tree data
const treeData = {
  id: 0,
  label: 'Root',
  children: [
    { id: 1, label: 'Node 1', children: [] },
    { id: 2, label: 'Node 2', children: [] }
  ]
};

// Render tree (placeholder, replace with your preferred visualization)
function renderTree(container, node) {
  const el = document.createElement('div');
  el.className = 'tree-node';
  el.textContent = node.label;
  el.dataset.nodeId = node.id;
  el.oncontextmenu = function(e) {
    e.preventDefault();
    showNodeModal(node);
  };
  if (node.children && node.children.length) {
    const children = document.createElement('div');
    children.className = 'tree-children';
    node.children.forEach(child => children.appendChild(renderTree(container, child)));
    el.appendChild(children);
  }
  return el;
}

function showNodeModal(node) {
  const modal = document.getElementById('node-modal');
  document.getElementById('modal-node-label').value = node.label;
  modal.style.display = 'block';
  modal.dataset.nodeId = node.id;
  document.getElementById('modal-overlay').style.display = 'block';
}

function hideNodeModal() {
  document.getElementById('node-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('tree-container');
  container.innerHTML = '';
  container.appendChild(renderTree(container, treeData));
  document.getElementById('modal-cancel-btn').onclick = hideNodeModal;
  document.getElementById('modal-save-btn').onclick = function() {
    // Save logic here (update label, etc.)
    hideNodeModal();
    // Re-render tree if needed
  };
  document.getElementById('modal-overlay').onclick = hideNodeModal;
});
