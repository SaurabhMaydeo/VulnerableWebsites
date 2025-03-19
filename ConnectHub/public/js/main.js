// Vulnerable: Uses innerHTML and doesn't sanitize input
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card card';
    div.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${post.username}</h5>
            <div class="post-content">${post.content}</div>
            <div class="comment-section mt-3">
                <form onsubmit="addComment(event, ${post.id})">
                    <input type="text" name="comment" class="form-control" placeholder="Add a comment...">
                </form>
                <div id="comments-${post.id}"></div>
            </div>
        </div>
    `;
    return div;
}

// Vulnerable: No input sanitization
function addComment(event, postId) {
    event.preventDefault();
    const content = event.target.comment.value;
    fetch('/comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId, content })
    })
    .then(response => response.json())
    .then(comment => {
        const commentsDiv = document.getElementById(`comments-${postId}`);
        commentsDiv.innerHTML += `
            <div class="comment">
                <strong>${comment.username}</strong>: ${comment.content}
            </div>
        `;
        event.target.reset();
    });
}

// Vulnerable: Allows arbitrary HTML/CSS injection
function updateCustomCSS() {
    const css = document.getElementById('custom-css').value;
    const preview = document.getElementById('css-preview');
    const style = document.createElement('style');
    style.textContent = css;
    preview.innerHTML = '';
    preview.appendChild(style);
}

// Vulnerable: No message sanitization
if (typeof io !== 'undefined') {
    const socket = io();
    
    socket.on('new message', (data) => {
        const messagesDiv = document.getElementById('messages');
        if (messagesDiv) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${data.sender_id === currentUser.id ? 'sent' : 'received'}`;
            messageDiv.innerHTML = data.content;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });

    function sendMessage(event) {
        event.preventDefault();
        const content = event.target.message.value;
        const receiverId = event.target.receiver_id.value;
        
        socket.emit('private message', {
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content: content
        });
        
        event.target.reset();
    }
}

// Vulnerable: Uses innerHTML for search results
function searchUsers(query) {
    fetch(`/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(users => {
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = users.map(user => `
                <div class="user-card">
                    <h5>${user.username}</h5>
                    <p>${user.profile || ''}</p>
                    <a href="/profile/${user.id}" class="btn btn-primary">View Profile</a>
                </div>
            `).join('');
        });
}
