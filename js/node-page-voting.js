
// --- Voting Backend Integration ---
async function loadVotesFromBackend(projectId, nodeId) {
    try {
        // Use GET to match backend (not POST)
        const params = new URLSearchParams({ projectId, nodeId });
        const res = await fetch(`/api/load-votes?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load votes');
        const data = await res.json();
        if (Array.isArray(data.votes) && data.votes.length > 0) {
            setNodeVotes(data.votes);
            return data.votes;
        } else {
            // No votes in backend: clear nodeData.votes to zeros
            const authors = (typeof getNodeAuthors === 'function') ? getNodeAuthors() : [];
            const zeros = new Array(authors.length).fill(0);
            setNodeVotes(zeros);
            return zeros;
        }
    } catch (e) {
        console.error('Error loading votes from backend:', e);
        // On error, also clear nodeData.votes to zeros
        const authors = (typeof getNodeAuthors === 'function') ? getNodeAuthors() : [];
        const zeros = new Array(authors.length).fill(0);
        setNodeVotes(zeros);
        return zeros;
    }
}

async function saveVotesToBackend(projectId, nodeId, votes) {
    try {
        console.log('[saveVotesToBackend] Sending:', { projectId, nodeId, votes });
        const res = await fetch('/api/save-votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, nodeId, votes })
        });
        if (!res.ok) throw new Error('Failed to save votes');
        const data = await res.json();
        if (!data.success) {
            console.warn('Backend did not accept votes:', data.error);
        } else {
            console.log('[saveVotesToBackend] Success:', data);
        }
    } catch (e) {
        console.error('Error saving votes to backend:', e);
    }
}

// Functions for dynamic voting sliders

function getNodeVotes() {
    if (nodeData && Array.isArray(nodeData.votes)) {
        return [...nodeData.votes];
    }
    // If not present, initialize to zeros
    const authors = getNodeAuthors();
    return new Array(authors.length).fill(0);
}

function setNodeVotes(votesArray) {
    if (nodeData) {
        nodeData.votes = [...votesArray];
    }
}

// Helper to get projectId from map
// Helper to get projectId from projectData (unified structure)
function getProjectId() {
    if (typeof projectData !== 'undefined' && projectData && projectData.projectId) {
        return projectData.projectId;
    }
    // Fallback: try to get from localStorage if not already loaded
    try {
        const pd = JSON.parse(localStorage.getItem('projectData'));
        if (pd && pd.projectId) return pd.projectId;
    } catch {}
    console.error('[Voting] No projectId found in projectData. Voting cannot be saved.');
    return null;
}

function createVotingSliders() {
    const votingContainer = document.getElementById('voting-container');
    votingContainer.innerHTML = '';
    
    const authorsToDisplay = getNodeAuthors();
    if (authorsToDisplay.length === 0) {
        votingContainer.innerHTML = '<p style="color: #999; font-style: italic;">No authors available for voting</p>';
        setNodeVotes([]);
        return;
    }
    const n = authorsToDisplay.length;
    let votes = getNodeVotes();
    if (votes.length !== n) {
        votes = new Array(n).fill(0);
        setNodeVotes(votes);
    }
    // Create slider for each author
    authorsToDisplay.forEach((author, index) => {
        const slideContainer = document.createElement('div');
        slideContainer.className = 'slidecontainer';
        const authorName = author.name || author.email || 'Unknown User';
        const voteValue = votes[index] || 0;
        slideContainer.innerHTML = `
            <p class="name">${authorName}</p>
            <pre class="score">${(voteValue/10).toFixed(2)}</pre>
            <input type="range" min="0" max="1000" value="${voteValue}" class="slider" data-author-index="${index}">
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
async function initializeVoting() {
    const sliders = document.getElementsByClassName("slider");
    const outputs = document.getElementsByClassName("score");
    let votes = getNodeVotes();
    const n = sliders.length;
    // Initialize sliders and displays
    for (let j = 0; j < n; ++j) {
        sliders[j].value = Math.round(votes[j] || 0);
        const displayValue = isNaN(votes[j]) ? 0 : votes[j] / 10.0;
        outputs[j].innerHTML = displayValue.toFixed(2);
    }
    var total = 0.0;
    for (const score of votes) {
        total += (isNaN(score) ? 0 : score);
    }
    const totalDisplay = document.getElementById("total");
    if (totalDisplay) {
        totalDisplay.innerHTML = (total / 10.0).toFixed(2);
    }
    // Add event listeners to sliders (no backend save here)
    [...sliders].forEach(function (slider, k) {
        slider.addEventListener("input", function() {
            const newValue = parseFloat(this.value);
            votes[k] = isNaN(newValue) ? 0 : newValue;
            setNodeVotes(votes);
            // Update the current slider's display
            const displayValue = votes[k] / 10.0;
            outputs[k].innerHTML = displayValue.toFixed(2);
            // Calculate surplus value
            var subtotal = 0;
            for (const score of votes) {
                subtotal += (isNaN(score) ? 0 : score);
            }
            var surplus = 1000.0 - subtotal;
            var adjustment = (n > 1) ? surplus / (n - 1) : 0;
            // Adjust other sliders proportionally
            for (let j = 0; j < n; ++j) {
                if (j != k) {
                    votes[j] = Math.max(0, (votes[j] || 0) + adjustment);
                    if (isNaN(votes[j])) votes[j] = 0;
                    sliders[j].value = Math.round(votes[j]);
                    const adjustedDisplayValue = votes[j] / 10.0;
                    outputs[j].innerHTML = adjustedDisplayValue.toFixed(2);
                }
            }
            // Update total
            var newTotal = 0.0;
            for (const score of votes) {
                newTotal += (isNaN(score) ? 0 : score);
            }
            if (totalDisplay) {
                totalDisplay.innerHTML = (newTotal / 10.0).toFixed(2);
            }
            setNodeVotes(votes);
        });
    });

    // Add event listener to Save button to persist votes to backend
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const projectId = getProjectId();
            if (!projectId) {
                alert('Cannot save votes: Project ID not found.');
                return;
            }
            // Use latest votes from nodeData
            const currentVotes = getNodeVotes();
            await saveVotesToBackend(projectId, nodeId, currentVotes);
        });
    }
}

