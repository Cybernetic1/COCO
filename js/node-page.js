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

// Functions for author management

/**
 * Get the node's authors list, falling back to ROOT node's authors if empty
 * @returns {Array} Array of author objects
 */
function getNodeAuthors() {
    // If current node has authors, return them
    if (currentAuthors && currentAuthors.length > 0) {
    return currentAuthors;
    }
    
    // Fall back to ROOT node's authors (map is the root node)
    if (map && map.authors && Array.isArray(map.authors)) {
    return map.authors;
    }
    
    // Return empty array if no authors found anywhere
    return [];
}

function displayAuthors() {
    const authorsList = document.getElementById('authors-list');
    authorsList.innerHTML = '';
    
    const authorsToDisplay = getNodeAuthors();
    
    // Check if we're using inherited authors from ROOT (node authors are empty)
    const isUsingInheritedAuthors = (!currentAuthors || currentAuthors.length === 0);
    
    // Show inheritance note whenever we're using ROOT authors
    if (isUsingInheritedAuthors) {
    const inheritedNote = document.createElement('div');
    inheritedNote.style.fontSize = '12px';
    inheritedNote.style.color = '#666';
    inheritedNote.style.fontStyle = 'italic';
    inheritedNote.style.marginBottom = '5px';
    
    // Combine inheritance note with empty list message if no authors found
    if (authorsToDisplay.length === 0) {
        inheritedNote.textContent = '(Default authors from ROOT - empty list)';
    } else {
        inheritedNote.textContent = '(Default authors from ROOT)';
    }
    
    authorsList.appendChild(inheritedNote);
    }
    
    if (authorsToDisplay.length === 0) {
    // If we already showed the combined message above, just create empty voting sliders
    if (isUsingInheritedAuthors) {
        createVotingSliders();
        return;
    }
    
    // This case shouldn't normally happen (node has authors but they're empty somehow)
    const emptyMsg = document.createElement('span');
    emptyMsg.style.color = '#999';
    emptyMsg.style.fontStyle = 'italic';
    emptyMsg.textContent = '[empty list]';
    authorsList.appendChild(emptyMsg);
    createVotingSliders();
    return;
    }
    
    authorsToDisplay.forEach((author, index) => {
    const authorTag = document.createElement('span');
    authorTag.className = 'author-tag';
    authorTag.innerHTML = `
        ${author.name || author.email || 'Unknown User'}
        <span class="remove-btn" onclick="removeAuthor(${index})">&times;</span>
    `;
    authorsList.appendChild(authorTag);
    });
    
    // Update voting sliders when authors change
    createVotingSliders();
}

function removeAuthor(index) {
    currentAuthors.splice(index, 1);
    displayAuthors();
}

async function loadUsers() {
    try {
    const response = await fetch('/api/users');
    if (response.ok) {
        availableUsers = await response.json();
    } else {
        console.error('Failed to load users:', response.statusText);
        availableUsers = [];
    }
    } catch (error) {
    console.error('Error loading users:', error);
    availableUsers = [];
    }
}

function showUserSelector() {
    // Load users if not already loaded
    if (availableUsers.length === 0) {
    loadUsers().then(() => {
        displayUserSelector();
    });
    } else {
    displayUserSelector();
    }
}

function displayUserSelector() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    if (availableUsers.length === 0) {
    usersList.innerHTML = '<p style="color: #999;">No users found or failed to load users.</p>';
    } else {
    // Filter out users already in authors list
    const currentAuthorIds = currentAuthors.map(a => a.id);
    const availableToAdd = availableUsers.filter(user => !currentAuthorIds.includes(user.id));
    
    if (availableToAdd.length === 0) {
        usersList.innerHTML = '<p style="color: #999;">All users are already added as authors.</p>';
    } else {
        availableToAdd.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-name">${user.name || 'Unnamed User'}</div>
            <div class="user-email">${user.email || 'No email'}</div>
        `;
        userItem.onclick = () => addAuthor(user);
        usersList.appendChild(userItem);
        });
    }
    }
    
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('user-selector').style.display = 'block';
}

function hideUserSelector() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('user-selector').style.display = 'none';
}

function addAuthor(user) {
    // Check if user is already in authors list
    if (!currentAuthors.find(a => a.id === user.id)) {
    currentAuthors.push(user);
    displayAuthors();
    }
    hideUserSelector();
}

if (nodeData) {
    // Set the node title
    const nodeNameEN = nodeData.labelEN || nodeData.label || `Node ${nodeId}`;
    document.getElementById('node-title').innerHTML = `<span style="color: #666; font-weight: normal; font-size: 16px;">Node:</span> ${nodeNameEN}`;
    
    // Set status radio buttons
    if (nodeData.status) {
    const statusRadio = document.getElementById(nodeData.status);
    if (statusRadio) statusRadio.checked = true;
    } else {
    // Default to in-progress if no status
    const defaultRadio = document.getElementById('in-progress');
    if (defaultRadio) defaultRadio.checked = true;
    }
    
    setField('labelEN', nodeData.labelEN || nodeData.label || '');
    setField('labelZH', nodeData.labelZH || '');
    const zhSection = document.getElementById('zh-section');
    if (nodeData.labelZH && nodeData.labelZH.trim() !== '') {
    zhSection.style.display = '';
    } else {
    zhSection.style.display = 'none';
    }
    // Remove Edge label section (already done above)
    // setField('edgeLabel', nodeData.edgeLabel || '');
    setField('details', nodeData.details || '');
    setField('expTokens', nodeData.expTokens || '');
    setField('expTime', nodeData.expTime || '');
    setField('expWorkers', nodeData.expWorkers || '');
    
    // Handle authors - convert from old format if needed
    if (nodeData.authors) {
    if (Array.isArray(nodeData.authors)) {
        // If it's already an array of objects, use it
        if (nodeData.authors.length > 0 && typeof nodeData.authors[0] === 'object') {
        currentAuthors = [...nodeData.authors];
        } else {
        // If it's an array of strings, convert to objects
        currentAuthors = nodeData.authors.map(authorName => ({
            name: authorName,
            email: '',
            id: authorName // Use name as temporary ID
        }));
        }
    } else if (typeof nodeData.authors === 'string') {
        // If it's a comma-separated string, convert to objects
        currentAuthors = nodeData.authors.split(',').map(name => name.trim()).filter(Boolean).map(authorName => ({
        name: authorName,
        email: '',
        id: authorName
        }));
    }
    }
    
    // If current node has no authors, inherit from ROOT node
    if (!currentAuthors || currentAuthors.length === 0) {
    currentAuthors = getNodeAuthors();
    }
    
    displayAuthors();
} else {
    // Set default title when no node data found
    document.getElementById('node-title').innerHTML = `<span style="color: #666; font-weight: normal; font-size: 16px;">Node:</span> ${nodeId || 'Unknown'}`;
    
    // Default to in-progress if no node data found
    const defaultRadio = document.getElementById('in-progress');
    if (defaultRadio) defaultRadio.checked = true;
    
    // Use ROOT node's authors as fallback
    currentAuthors = getNodeAuthors();
    
    const zhSection = document.getElementById('zh-section');
    if (zhSection) zhSection.style.display = 'none';
    
    displayAuthors();
}

// Handle form submission
document.getElementById('node-form').onsubmit = function(e) {
    e.preventDefault();
    if (!nodeData) return;
    
    // Update nodeData from form
    const checkedRadio = document.querySelector('input[name="status"]:checked');
    if (checkedRadio) nodeData.status = checkedRadio.value;
    
    nodeData.labelEN = document.getElementById('labelEN').value;
    nodeData.label = nodeData.labelEN;
    nodeData.labelZH = document.getElementById('labelZH').value;
    // nodeData.edgeLabel = document.getElementById('edgeLabel').value; // Removed edge label
    // nodeData.details = document.getElementById('details').value; // Comments replaced by chat

    // Only save these properties if they have values
    const expTokens = document.getElementById('expTokens').value;
    const expTime = document.getElementById('expTime').value;
    const expWorkers = document.getElementById('expWorkers').value;
    
    if (expTokens && expTokens.trim() !== '') {
    nodeData.expTokens = expTokens;
    } else {
    delete nodeData.expTokens;
    }
    
    if (expTime && expTime.trim() !== '') {
    nodeData.expTime = expTime;
    } else {
    delete nodeData.expTime;
    }
    
    if (expWorkers && expWorkers.trim() !== '') {
    nodeData.expWorkers = expWorkers;
    } else {
    delete nodeData.expWorkers;
    }
    
    // Save authors as array of objects
    nodeData.authors = currentAuthors;
    
    // Save back to localStorage
    localStorage.setItem('projectMapRoot', JSON.stringify(map));
    alert('Node updated! (Note: changes are local until you save the map)');
};

// --- Chat UI logic ---
// Get projectId and nodeId for unique chat room key
let projectId = null;
if (map && map.id) {
    projectId = map.id;
} else if (map && map.projectId) {
    projectId = map.projectId;
} else {
    // fallback: try to get from localStorage or URL
    projectId = localStorage.getItem('currentProjectId') || 'defaultProject';
}
// nodeId is already defined
const chatRoomKey = `${projectId}:${nodeId}`;

const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');

// Helper to escape HTML
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(tag) {
    const chars = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'};
    return chars[tag] || tag;
    });
}

// Fetch and display chat messages
let lastChatMessages = [];
async function loadChatMessages() {
    try {
    const res = await fetch(`/api/chat?room=${encodeURIComponent(chatRoomKey)}`);
    if (!res.ok) throw new Error('Failed to load chat');
    const data = await res.json();
    const messages = Array.isArray(data) ? data : data.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
        chatContainer.innerHTML = '<span style="color:#888;">No messages yet.</span>';
        lastChatMessages = [];
        return;
    }
    // Get current user name for delete button logic
    let myName = null;
    let myEmail = null;
    try {
        if (window.currentUser && window.currentUser.name) {
        myName = window.currentUser.name;
        }
        if (window.currentUser && window.currentUser.email) {
        myEmail = window.currentUser.email;
        }
        if (!myName && window.localStorage.getItem('currentUserName')) {
        myName = window.localStorage.getItem('currentUserName');
        }
        if (!myEmail && window.localStorage.getItem('currentUserEmail')) {
        myEmail = window.localStorage.getItem('currentUserEmail');
        }
    } catch (e) { myName = null; myEmail = null; }
    // Only append new messages, do not clear and rebuild
    let startIdx = 0;
    while (
        startIdx < messages.length &&
        lastChatMessages[startIdx] &&
        lastChatMessages[startIdx].user === messages[startIdx].user &&
        lastChatMessages[startIdx].text === messages[startIdx].text &&
        lastChatMessages[startIdx].time === messages[startIdx].time
    ) {
        startIdx++;
    }
    // If all messages are new or chat was empty, rebuild
    if (startIdx === 0 || lastChatMessages.length === 0 || messages.length < lastChatMessages.length) {
        chatContainer.innerHTML = '';
        messages.forEach((msg, idx) => {
        const div = document.createElement('div');
        div.style.marginBottom = '6px';
        div.innerHTML = `<b style='color:#06c;'>${escapeHTML(msg.user||'Anon')}</b>: <span>${escapeHTML(msg.text||'')}</span> <span style='color:#aaa; font-size:11px;'>${msg.time ? new Date(msg.time).toLocaleString() : ''}</span>`;
        // Add delete button if this is my message
        if (myName && msg.user === myName) {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.style.marginLeft = '8px';
            delBtn.style.fontSize = '11px';
            delBtn.style.padding = '2px 8px';
            delBtn.onclick = function() { deleteChatMessage(msg, idx); };
            delBtn.title = 'Delete this message';
            div.appendChild(delBtn);
        }
        chatContainer.appendChild(div);
        });
    } else if (startIdx < messages.length) {
        // Only append new messages
        for (let i = startIdx; i < messages.length; ++i) {
        const msg = messages[i];
        const div = document.createElement('div');
        div.style.marginBottom = '6px';
        div.innerHTML = `<b style='color:#06c;'>${escapeHTML(msg.user||'Anon')}</b>: <span>${escapeHTML(msg.text||'')}</span> <span style='color:#aaa; font-size:11px;'>${msg.time ? new Date(msg.time).toLocaleString() : ''}</span>`;
        if ((myName && msg.user === myName) || (myEmail && msg.user === myEmail)) {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.style.marginLeft = '8px';
            delBtn.style.fontSize = '11px';
            delBtn.style.padding = '2px 8px';
            delBtn.onclick = function() { deleteChatMessage(msg, i); };
            delBtn.title = 'Delete this message';
            div.appendChild(delBtn);
        }
        chatContainer.appendChild(div);
        }
    }
    lastChatMessages = messages;
    chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (e) {
    chatContainer.innerHTML = '<span style="color:#c00;">Failed to load chat.</span>';
    lastChatMessages = [];
    }

}

// Delete chat message (frontend only, calls backend to actually delete)
async function deleteChatMessage(msg, idx) {
    if (!confirm('Delete this message?')) return;
    // TODO: implement server-side API, for now just log
    // await fetch(`/api/chat/delete`, { method: 'POST', ... })
    alert('Delete API not implemented yet. Please provide server-side instructions.');
}
// Send a chat message
async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatSendBtn.disabled = true;
    try {
    const res = await fetch(`/api/chat?room=${encodeURIComponent(chatRoomKey)}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to send');
    chatInput.value = '';
    // Always reload from server after a short delay to ensure consistency and avoid duplicates
    setTimeout(loadChatMessages, 500);
    } catch (e) {
    alert('Failed to send message.');
    } finally {
    chatSendBtn.disabled = false;
    }
}

chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
    sendChatMessage();
    }
});

// Initial load
loadChatMessages();
// Optionally, poll for new messages every 10s
setInterval(loadChatMessages, 10000);

// Functions for dynamic voting sliders

function createVotingSliders() {
    const votingContainer = document.getElementById('voting-container');
    votingContainer.innerHTML = '';
    
    const authorsToDisplay = getNodeAuthors();
    
    if (authorsToDisplay.length === 0) {
    votingContainer.innerHTML = '<p style="color: #999; font-style: italic;">No authors available for voting</p>';
    // Clear votes array when no authors
    window.votes = [];
    return;
    }
    
    // Reset votes array to match number of authors, all starting at 0
    const n = authorsToDisplay.length;
    window.votes = new Array(n).fill(0);
    
    // Create slider for each author
    authorsToDisplay.forEach((author, index) => {
    const slideContainer = document.createElement('div');
    slideContainer.className = 'slidecontainer';
    
    const authorName = author.name || author.email || 'Unknown User';
    
    slideContainer.innerHTML = `
        <p class="name">${authorName}</p>
        <pre class="score">0.00</pre>
        <input type="range" min="0" max="1000" value="0" class="slider" data-author-index="${index}">
    `;
    
    votingContainer.appendChild(slideContainer);
    });
    
    // Add total display
    const totalContainer = document.createElement('div');
    totalContainer.className = 'slidecontainer';
    totalContainer.innerHTML = `
    <p class="name">Total</p>
    <pre class="score" id="total">0.00</pre>
    `;
    votingContainer.appendChild(totalContainer);
    
    // Add line break
    const lineBreak = document.createElement('br');
    votingContainer.appendChild(lineBreak);
    
    // Initialize voting logic - delay slightly to ensure DOM is ready
    setTimeout(() => initializeVoting(), 10);
}

// Initialize voting sliders
function initializeVoting() {
    const sliders = document.getElementsByClassName("slider");
    const outputs = document.getElementsByClassName("score");
    
    var scores = [];
    const n = sliders.length;
    
    // Always create fresh votes array to match current number of sliders
    window.votes = new Array(n).fill(0);
    
    // Initialize sliders and displays - ensure no NaN values
    for (let j = 0; j < n; ++j) {
    scores[j] = window.votes[j] || 0; // Ensure it's never undefined/NaN
    sliders[j].value = Math.round(scores[j]);
    const displayValue = isNaN(scores[j]) ? 0 : scores[j] / 10.0;
    outputs[j].innerHTML = displayValue.toFixed(2);
    }
    
    var total = 0.0;
    for (const score of scores) {
    total += (isNaN(score) ? 0 : score);
    }
    const totalDisplay = document.getElementById("total");
    if (totalDisplay) {
    totalDisplay.innerHTML = (total / 10.0).toFixed(2);
    }
    
    // Add event listeners to sliders
    [...sliders].forEach(function (slider, k) {
    slider.addEventListener("input", function() {
        const newValue = parseFloat(this.value);
        scores[k] = window.votes[k] = isNaN(newValue) ? 0 : newValue;
        
        // Update the current slider's display
        const displayValue = scores[k] / 10.0;
        outputs[k].innerHTML = displayValue.toFixed(2);
        
        // Calculate surplus value
        var subtotal = 0;
        for (const score of scores) {
        subtotal += (isNaN(score) ? 0 : score);
        }
        var surplus = 1000.0 - subtotal;
        var adjustment = (n > 1) ? surplus / (n - 1) : 0;
        
        // Adjust other sliders proportionally
        for (let j = 0; j < n; ++j) {
        if (j != k) {
            scores[j] = window.votes[j] = Math.max(0, (window.votes[j] || 0) + adjustment);
            if (isNaN(scores[j])) scores[j] = window.votes[j] = 0;
            sliders[j].value = Math.round(scores[j]);
            const adjustedDisplayValue = scores[j] / 10.0;
            outputs[j].innerHTML = adjustedDisplayValue.toFixed(2);
        }
        }
        
        // Update total
        var newTotal = 0.0;
        for (const score of scores) {
        newTotal += (isNaN(score) ? 0 : score);
        }
        const totalDisplay = document.getElementById("total");
        if (totalDisplay) {
        totalDisplay.innerHTML = (newTotal / 10.0).toFixed(2);
        }
    });
    });
}

// Load users on page load
loadUsers();

// In the script, after the form is loaded, move the Save button into the form for correct submission
const form = document.getElementById('node-form');
const saveBtn = document.getElementById('save-btn');
if (form && saveBtn) {
    form.insertBefore(saveBtn, form.firstChild);
}
