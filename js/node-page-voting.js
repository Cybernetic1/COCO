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

