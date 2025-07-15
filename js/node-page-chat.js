// --- Chat UI logic ---
// Get projectId and nodeId for unique chat room key
// Use projectId and nodeId from global scope (set in node-page.js)
// If not present, fallback to localStorage or default
let chatProjectId = (typeof projectId !== 'undefined' && projectId) ? projectId : (window.map && window.map.id) ? window.map.id : (window.map && window.map.projectId) ? window.map.projectId : localStorage.getItem('currentProjectId') || 'defaultProject';
let chatNodeId = (typeof nodeId !== 'undefined' && nodeId) ? nodeId : (window.nodeId) ? window.nodeId : null;
const chatRoomKey = `${chatProjectId}:${chatNodeId}`;

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
// Use a single global variable to avoid redeclaration errors if this script is loaded multiple times
if (typeof window.lastChatMessages === 'undefined') {
    window.lastChatMessages = [];
}
let lastChatMsgs = window.lastChatMessages;
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
            // Time (show only time, full date-time on hover)
            const timeSpan = document.createElement('span');
            timeSpan.style.color = '#aaa';
            timeSpan.style.fontSize = '11px';
            timeSpan.style.marginRight = '8px';
            if (msg.time) {
                const dt = new Date(msg.time);
                timeSpan.textContent = dt.toLocaleTimeString();
                timeSpan.title = dt.toLocaleString();
            } else {
                timeSpan.textContent = '';
            }
            div.appendChild(timeSpan);
            // User name (show only part before '@', full on hover)
            const userB = document.createElement('b');
            userB.style.color = '#06c';
            let displayName = msg.user || 'Anon';
            if (displayName.includes('@')) {
                userB.textContent = displayName.split('@')[0];
                userB.title = displayName;
            } else {
                userB.textContent = displayName;
                userB.title = '';
            }
            div.appendChild(userB);
            div.appendChild(document.createTextNode(': '));
            // Message text (strikethrough if deleted)
            const textSpan = document.createElement('span');
            textSpan.textContent = msg.text || '';
            if (msg.deleted) {
                textSpan.style.textDecoration = 'line-through';
                textSpan.style.color = '#888';
            }
            div.appendChild(textSpan);
            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '☒';
            // delBtn.className = 'chat-delete-debug-btn';
            delBtn.setAttribute('style', `font-size:18px; color:#c00; border:0; background:none; cursor:pointer; z-index:9999;`);
            delBtn.onclick = function() { deleteChatMessage(msg, idx); };
            delBtn.title = 'Delete this message';
            div.appendChild(delBtn);
            chatContainer.appendChild(div);
        });
    } else if (startIdx < messages.length) {
        // Only append new messages
        for (let i = startIdx; i < messages.length; ++i) {
        const msg = messages[i];
        const div = document.createElement('div');
        div.style.marginBottom = '6px';
        // User name (show only part before '@', full on hover)
        const userB = document.createElement('b');
        userB.style.color = '#06c';
        let displayName = msg.user || 'Anon';
        if (displayName.includes('@')) {
            userB.textContent = displayName.split('@')[0];
            userB.title = displayName;
        } else {
            userB.textContent = displayName;
            userB.title = '';
        }
        div.appendChild(userB);
        div.appendChild(document.createTextNode(': '));
        // Message text (strikethrough if deleted)
        const textSpan = document.createElement('span');
        textSpan.textContent = msg.text || '';
        if (msg.deleted) {
            textSpan.style.textDecoration = 'line-through';
            textSpan.style.color = '#888';
        }
        div.appendChild(textSpan);
        // Time (show only time, full date-time on hover)
        const timeSpan = document.createElement('span');
        timeSpan.style.color = '#aaa';
        timeSpan.style.fontSize = '11px';
        timeSpan.style.marginLeft = '8px';
        if (msg.time) {
            const dt = new Date(msg.time);
            timeSpan.textContent = dt.toLocaleTimeString();
            timeSpan.title = dt.toLocaleString();
        } else {
            timeSpan.textContent = '';
        }
        div.appendChild(timeSpan);
        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'chat-delete-debug-btn';
        delBtn.setAttribute('style', `font-size:12px; color:#c00;`);
        delBtn.onclick = function() { deleteChatMessage(msg, i); };
        delBtn.title = 'Delete this message';
        div.appendChild(delBtn);
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
    try {
        const res = await fetch('/api/chat/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room: chatRoomKey,
                time: msg.time,
                user: msg.user,
                text: msg.text
            })
        });
        if (!res.ok) throw new Error('Failed to delete');
        setTimeout(loadChatMessages, 300);
    } catch (e) {
        alert('Failed to delete message.');
    }
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

