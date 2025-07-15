// Global variables
let currentAuthors = [];
let availableUsers = [];

// Get node id from URL
const params = new URLSearchParams(window.location.search);
const nodeId = params.get('id');
document.getElementById('node-id').textContent = 'Node ID: ' + nodeId;

// Load node data from localStorage (if available)
let nodeData = null;
let map = null;
try {
    map = JSON.parse(localStorage.getItem('projectMapRoot'));
    function findNode(node, id) {
    if (!node) return null;
    if (String(node.id) === String(id)) return node;
    if (node.children) {
        for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
        }
    }
    return null;
    }
    nodeData = findNode(map, nodeId);
} catch {}

function setField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

// Load users on page load
loadUsers();

// In the script, after the form is loaded, move the Save button into the form for correct submission
const form = document.getElementById('node-form');
const saveBtn = document.getElementById('save-btn');
if (form && saveBtn) {
    form.insertBefore(saveBtn, form.firstChild);
}
