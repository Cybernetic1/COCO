// Global variables
let currentAuthors = [];
let availableUsers = [];

// Get node id from URL
const params = new URLSearchParams(window.location.search);
const nodeId = params.get('id');
document.getElementById('node-id').textContent = 'Node ID: ' + nodeId;

// Load node data from localStorage (if available)
let nodeData = null;
let projectData = null;
let projectId = null;
try {
    projectData = JSON.parse(localStorage.getItem('projectData'));
    if (projectData) {
        projectId = projectData.projectId || 'defaultProject';
        if (projectData.dataType === 'map') {
            // Tree structure
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
            nodeData = findNode(projectData.data, nodeId);
        } else if (projectData.dataType === 'graph') {
            // Graph structure
            const nodeArr = projectData.data.nodes || [];
            nodeData = nodeArr.find(n => String(n.id) === String(nodeId));
        }
    }
} catch {}

function setField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}


// --- Voting: Load votes from backend after nodeData is loaded ---
async function loadAndInitVotes() {
    if (!nodeData) return;
    // projectId is already set above
    if (typeof loadVotesFromBackend === 'function') {
        const votes = await loadVotesFromBackend(projectId, nodeId);
        if (votes && Array.isArray(votes)) {
            nodeData.votes = [...votes];
        }
    }
    // Now initialize voting UI
    if (typeof createVotingSliders === 'function') {
        createVotingSliders();
    }
}

// Call after nodeData is loaded
loadAndInitVotes();

// (loadUsers is now called in node-page-authors.js)

// In the script, after the form is loaded, move the Save button into the form for correct submission
const form = document.getElementById('node-form');
const saveBtn = document.getElementById('save-btn');
if (form && saveBtn) {
    form.insertBefore(saveBtn, form.firstChild);
}
