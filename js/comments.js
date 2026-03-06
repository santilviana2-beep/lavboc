import { auth, db } from './firebase-config.js';
import { 
    doc, 
    getDoc,
    updateDoc,
    arrayUnion 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { addComment } from './posts.js';

// Open comments modal
window.openComments = function(postId, userName, postContent) {
    const modal = document.getElementById('commentsModal');
    const container = document.getElementById('commentsContainer');
    const commentInput = document.getElementById('commentInput');
    
    if (!modal || !container) return;
    
    // Store postId in modal for later use
    modal.dataset.postId = postId;
    
    // Load comments for this post
    loadComments(postId);
    
    // Setup comment submit button
    const submitBtn = document.getElementById('submitComment');
    if (submitBtn) {
        submitBtn.onclick = async () => {
            const comment = commentInput.value.trim();
            if (!comment) return;
            
            const success = await addComment(postId, comment);
            if (success) {
                commentInput.value = '';
                loadComments(postId); // Reload comments
            }
        };
    }
    
    // Handle enter key
    commentInput.onkeypress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitBtn.click();
        }
    };
    
    modal.classList.add('show');
};

// Load comments for a post
async function loadComments(postId) {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
    
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (!postSnap.exists()) {
            container.innerHTML = '<p class="no-comments">Post not found</p>';
            return;
        }
        
        const post = postSnap.data();
        const comments = post.comments || [];
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comments"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }
        
        // Sort comments by timestamp (newest first)
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <img src="${comment.userPhoto}" alt="${comment.userName}" class="comment-avatar"
                     onerror="this.src='https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}'">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-time">${timeAgo(comment.timestamp)}</span>
                    </div>
                    <p class="comment-text">${comment.content}</p>
                    <div class="comment-actions">
                        <button onclick="likeComment('${postId}', ${comment.timestamp})">
                            <i class="far fa-heart"></i> Like
                        </button>
                        <button onclick="replyToComment('${postId}', '${comment.userName}')">
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading comments:', error);
        container.innerHTML = '<p class="error">Failed to load comments</p>';
    }
}

// Time ago helper (reuse from posts.js)
function timeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return date.toLocaleDateString();
}

// Like comment (placeholder)
window.likeComment = function(postId, timestamp) {
    showNotification('Comment likes coming soon!', 'info');
};

// Reply to comment
window.replyToComment = function(postId, userName) {
    const input = document.getElementById('commentInput');
    if (input) {
        input.value = `@${userName} `;
        input.focus();
    }
};
