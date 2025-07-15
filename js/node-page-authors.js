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

