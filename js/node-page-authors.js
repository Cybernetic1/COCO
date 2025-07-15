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
    
    // Fall back to ROOT node's authors (projectData.data is the root node for map, or nodes[0] for graph)
    if (typeof projectData !== 'undefined' && projectData !== null) {
        let rootAuthors = [];
        if (projectData.dataType === 'map' && projectData.data && Array.isArray(projectData.data.authors)) {
            rootAuthors = projectData.data.authors;
        } else if (projectData.dataType === 'graph' && projectData.data && Array.isArray(projectData.data.nodes) && projectData.data.nodes.length > 0 && Array.isArray(projectData.data.nodes[0].authors)) {
            rootAuthors = projectData.data.nodes[0].authors;
        }
        if (rootAuthors.length > 0) return rootAuthors;
    }
    
    // Return empty array if no authors found anywhere
    return [];
}

// Make getNodeAuthors globally available
window.getNodeAuthors = getNodeAuthors;

function displayAuthors() {
    const authorsList = document.getElementById('authors-list');
    authorsList.innerHTML = '';

    const authorsToDisplay = getNodeAuthors();

    // Debugging output
    console.log('[displayAuthors] nodeId:', typeof nodeId !== 'undefined' ? nodeId : '(undefined)');
    console.log('[displayAuthors] nodeData:', nodeData);
    console.log('[displayAuthors] currentAuthors:', currentAuthors);
    console.log('[displayAuthors] authorsToDisplay:', authorsToDisplay);
    // Check if we're using inherited authors from ROOT (node authors are missing or empty)
    const isUsingInheritedAuthors = !nodeData.authors || nodeData.authors.length === 0;
    console.log('[displayAuthors] isUsingInheritedAuthors:', isUsingInheritedAuthors);

    // Show inheritance note whenever we're using ROOT authors
    if (isUsingInheritedAuthors) {
        const inheritedNote = document.createElement('span');
        inheritedNote.style.fontSize = '12px';
        inheritedNote.style.color = '#666';
        inheritedNote.style.fontStyle = 'italic';
        inheritedNote.style.marginBottom = '5px';
        inheritedNote.style.marginRight = '6px';

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
    
    // Debug: log nodeData and nodeData.authors after nodeData is set
    console.log('[Authors Init] nodeData:', nodeData);
    console.log('[Authors Init] nodeData.authors:', nodeData ? nodeData.authors : undefined);

    // Initialize currentAuthors from nodeData.authors if present
    if (nodeData && nodeData.authors && Array.isArray(nodeData.authors)) {
        currentAuthors = [...nodeData.authors];
        console.log('[Authors Init] currentAuthors initialized:', currentAuthors);
    }

    // Then call displayAuthors()
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

// Use saveBtn from node-page.js, do not redeclare here
if (saveBtn) {
  saveBtn.onclick = function(e) {
    e.preventDefault();
    console.log('[Save Handler] Save button clicked');
    if (!nodeData) {
      console.warn('[Save Handler] nodeData is undefined or null');
      alert('Error: nodeData is not loaded.');
      return;
    }
    if (typeof projectData === 'undefined' || !projectData) {
      console.warn('[Save Handler] projectData is undefined or null');
      alert('Error: projectData is not loaded.');
      return;
    }
    // Update nodeData from form
    const checkedRadio = document.querySelector('input[name="status"]:checked');
    if (checkedRadio) nodeData.status = checkedRadio.value;
    nodeData.labelEN = document.getElementById('labelEN').value;
    nodeData.label = nodeData.labelEN;
    nodeData.labelZH = document.getElementById('labelZH').value;
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
    nodeData.authors = [...currentAuthors]; // ensure up-to-date

    // --- Ensure the correct node in projectData is updated before saving ---
    if (projectData && projectData.dataType === 'graph' && Array.isArray(projectData.data.nodes)) {
      // Find the node by id and update its authors
      const nodeArr = projectData.data.nodes;
      const idx = nodeArr.findIndex(n => String(n.id) === String(nodeData.id));
      if (idx !== -1) {
        // Update only the authors property to avoid overwriting other changes
        nodeArr[idx].authors = [...currentAuthors];
        // Optionally update other fields from nodeData as needed
        nodeArr[idx] = { ...nodeArr[idx], ...nodeData };
        console.log('[Save Handler] Updated node in projectData:', nodeArr[idx]);
      } else {
        console.warn('[Save Handler] Node not found in projectData for update.');
      }
      // Debug: log the full node array
      console.log('[Save Handler] All nodes after update:', nodeArr);
    } else if (projectData && projectData.dataType === 'map' && projectData.data) {
      // Recursively find and update the node in a tree
      function updateNode(node, id, newData) {
        if (!node) return false;
        if (String(node.id) === String(id)) {
          Object.assign(node, newData);
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (updateNode(child, id, newData)) return true;
          }
        }
        return false;
      }
      updateNode(projectData.data, nodeData.id, nodeData);
      console.log('[Save Handler] Updated node in projectData (map).');
    }
    // --- End update logic ---

    // Update lastModified timestamp before saving
    projectData.lastModified = Date.now();

    // Save back to localStorage (update projectData)
    console.log('[Save Handler] projectData before saving to localStorage:', projectData);
    localStorage.setItem('projectData', JSON.stringify(projectData));
    // Also save to server
    let dir = '';
    if (projectData.dataType === 'map') {
      dir = 'project-maps/';
    } else if (projectData.dataType === 'graph') {
      dir = 'project-graphs/';
    } else {
      dir = '';
    }
    let filename = dir + (projectData.projectId || 'defaultProject') + '.json';
    console.log('[Save Handler] Saving to server:', filename, projectData);
    fetch('/saveJSON', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, data: projectData })
    })
    .then(res => res.json())
    .then(data => {
      console.log('[Save Handler] Server response:', data);
      if (data.success) {
        alert('Node and authors saved to server!');
      } else {
        alert('Failed to save to server: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error('[Save Handler] Error saving to server:', err);
      alert('Error saving to server: ' + err);
    });
    // Removed outdated alert about local changes
  };
}

// Load users immediately when this script is loaded
loadUsers();

