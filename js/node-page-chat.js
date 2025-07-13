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

