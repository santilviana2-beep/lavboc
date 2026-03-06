import { auth, db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDocs,
    limit,
    deleteDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Placeholder images (free, no upload needed)
const PLACEHOLDER_IMAGES = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5',
    'https://picsum.photos/800/600?random=6',
    null,
    null,
    null
];

// Load posts with real-time updates
export function loadPosts() {
    const postsFeed = document.getElementById('postsFeed');
    if (!postsFeed) return;

    const q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            addSamplePosts();
            return;
        }

        const posts = [];
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        displayPosts(posts);
    }, (error) => {
        console.error('Error loading posts:', error);
        showNotification('Failed to load posts', 'error');
    });
}

// Add sample posts (for new users)
async function addSamplePosts() {
    const samplePosts = [
        {
            content: "Welcome to LavBoc! 🎉 Ang purple social platform para sa lahat ng Pilipino!",
            userId: "system",
            userName: "LavBoc Team",
            userPhoto: "https://i.pravatar.cc/150?img=1",
            image: "https://picsum.photos/800/600?random=100",
            timestamp: new Date().toISOString(),
            likes: [],
            likedBy: [],
            comments: []
        },
        {
            content: "Sulit na sulit ang purple theme! Sobrang ganda! 💜 Sino gusto ng purple na profile?",
            userId: "system",
            userName: "Maria Santos",
            userPhoto: "https://i.pravatar.cc/150?img=2",
            image: null,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            likes: [],
            likedBy: [],
            comments: []
        },
        {
            content: "Kumusta kayo dito sa LavBoc? Share naman kayo ng mga ganap niyo! 😊",
            userId: "system",
            userName: "Juan Dela Cruz",
            userPhoto: "https://i.pravatar.cc/150?img=3",
            image: "https://picsum.photos/800/600?random=101",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            likes: [],
            likedBy: [],
            comments: []
        },
        {
            content: "Purple is life! ✨ Sana all may purple theme!",
            userId: "system",
            userName: "Ana Reyes",
            userPhoto: "https://i.pravatar.cc/150?img=4",
            image: "https://picsum.photos/800/600?random=102",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            likes: [],
            likedBy: [],
            comments: []
        }
    ];

    for (const post of samplePosts) {
        try {
            await addDoc(collection(db, 'posts'), post);
        } catch (error) {
            console.error('Error adding sample post:', error);
        }
    }
}

// Create new post
export async function createPost(content, privacy = 'public') {
    if (!auth.currentUser) {
        showNotification('Please login first', 'error');
        return false;
    }

    if (!content.trim()) {
        showNotification('Please write something', 'error');
        return false;
    }

    try {
        // Randomly add placeholder image (30% chance)
        const randomImage = Math.random() > 0.7 
            ? PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)]
            : null;

        const postData = {
            content: content,
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || 'LavBoc User',
            userPhoto: auth.currentUser.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            image: randomImage,
            timestamp: new Date().toISOString(),
            privacy: privacy,
            likes: [],
            likedBy: [],
            comments: []
        };

        await addDoc(collection(db, 'posts'), postData);

        // Clear and close modal
        const postContent = document.getElementById('postContent');
        if (postContent) postContent.value = '';
        
        const postModal = document.getElementById('postModal');
        if (postModal) postModal.classList.remove('show');

        showNotification('Post created successfully!', 'success');
        return true;

    } catch (error) {
        console.error('Error creating post:', error);
        showNotification('Failed to create post', 'error');
        return false;
    }
}

// Like/unlike post
export async function likePost(postId) {
    if (!auth.currentUser) {
        showNotification('Please login to like posts', 'error');
        return;
    }

    const postRef = doc(db, 'posts', postId);
    
    try {
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists()) return;

        const post = postSnap.data();
        const userId = auth.currentUser.uid;
        const isLiked = post.likedBy?.includes(userId);

        if (isLiked) {
            await updateDoc(postRef, {
                likes: arrayRemove(userId),
                likedBy: arrayRemove(userId)
            });
        } else {
            await updateDoc(postRef, {
                likes: arrayUnion(userId),
                likedBy: arrayUnion(userId)
            });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        showNotification('Failed to like post', 'error');
    }
}

// Delete post
export async function deletePost(postId) {
    if (!auth.currentUser) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        await deleteDoc(doc(db, 'posts', postId));
        showNotification('Post deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Failed to delete post', 'error');
    }
}

// Add comment
export async function addComment(postId, comment) {
    if (!auth.currentUser) {
        showNotification('Please login to comment', 'error');
        return false;
    }

    if (!comment.trim()) return false;

    const postRef = doc(db, 'posts', postId);
    const commentData = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'LavBoc User',
        userPhoto: auth.currentUser.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        content: comment,
        timestamp: new Date().toISOString()
    };

    try {
        await updateDoc(postRef, {
            comments: arrayUnion(commentData)
        });
        
        showNotification('Comment added', 'success');
        return true;
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Failed to add comment', 'error');
        return false;
    }
}

// Display posts in feed
function displayPosts(posts) {
    const postsFeed = document.getElementById('postsFeed');
    if (!postsFeed) return;

    if (posts.length === 0) {
        postsFeed.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-comment-dots" style="font-size: 4rem; color: var(--primary-light);"></i>
                <h3>No posts yet</h3>
                <p>Be the first to post on LavBoc! 💜</p>
                <button class="create-first-post-btn" onclick="document.getElementById('createPostBtn').click()">
                    Create First Post
                </button>
            </div>
        `;
        return;
    }

    postsFeed.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-user-info">
                    <img src="${post.userPhoto}" alt="${post.userName}" class="post-avatar" 
                         onerror="this.src='https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}'">
                    <div class="post-user-details">
                        <h4>${post.userName}</h4>
                        <span class="post-time">${timeAgo(post.timestamp)}</span>
                        <span class="post-privacy"><i class="fas fa-globe"></i></span>
                    </div>
                </div>
                ${post.userId === auth.currentUser?.uid ? `
                    <button class="post-options" onclick="handleDeletePost('${post.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            
            <div class="post-content">
                ${post.content}
            </div>
            
            ${post.image ? `
                <img src="${post.image}" alt="Post image" class="post-image" loading="lazy"
                     onclick="openLightbox('${post.image}')">
            ` : ''}
            
            <div class="post-stats">
                <span class="like-stat">
                    <i class="fas fa-heart" style="color: #f56565;"></i>
                    ${post.likedBy?.length || 0} likes
                </span>
                <span class="comment-stat">
                    <i class="fas fa-comment"></i>
                    ${post.comments?.length || 0} comments
                </span>
            </div>
            
            <div class="post-actions">
                <button class="post-action-btn like-btn ${post.likedBy?.includes(auth.currentUser?.uid) ? 'liked' : ''}" 
                        onclick="handleLike('${post.id}')">
                    <i class="fas fa-heart"></i>
                    Like
                </button>
                <button class="post-action-btn" onclick="openComments('${post.id}', '${post.userName}', '${post.content.replace(/'/g, "\\'")}')">
                    <i class="fas fa-comment"></i>
                    Comment
                </button>
                <button class="post-action-btn" onclick="sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    Share
                </button>
            </div>
        </div>
    `).join('');
}

// Time ago helper function
function timeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
    return date.toLocaleDateString();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Open lightbox for images
window.openLightbox = function(imageUrl) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox show';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img src="${imageUrl}" alt="Full size">
    `;
    
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', () => {
        lightbox.remove();
    });
};

// Handle like (global function)
window.handleLike = function(postId) {
    likePost(postId);
};

// Handle delete (global function)
window.handleDeletePost = function(postId) {
    deletePost(postId);
};

// Share post
window.sharePost = function(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'LavBoc Post',
            text: 'Check out this post on LavBoc!',
            url: window.location.href,
        });
    } else {
        // Fallback
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
    }
};
