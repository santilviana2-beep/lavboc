import { auth } from './firebase-config.js';
import { initAuth } from './auth.js';
import { loadPosts, createPost } from './posts.js';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication
    initAuth();
    
    // Load posts
    loadPosts();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Create post button (in navbar)
    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', () => {
            if (!auth.currentUser) {
                showNotification('Please login first', 'error');
                return;
            }
            document.getElementById('postModal').classList.add('show');
        });
    }

    // Create post card input
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.addEventListener('click', () => {
            if (!auth.currentUser) {
                showNotification('Please login first', 'error');
                return;
            }
            document.getElementById('postModal').classList.add('show');
        });
    }

    // Submit post button
    const submitPost = document.getElementById('submitPost');
    if (submitPost) {
        submitPost.addEventListener('click', async () => {
            const content = document.getElementById('postContent').value;
            const privacy = document.querySelector('.privacy-select')?.value || 'public';
            
            const success = await createPost(content, privacy);
            
            if (success) {
                // Clear content
                document.getElementById('postContent').value = '';
            }
        });
    }

    // Close modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Photo/video button (for demo)
    const photoVideoBtn = document.getElementById('photoVideoBtn');
    if (photoVideoBtn) {
        photoVideoBtn.addEventListener('click', () => {
            if (!auth.currentUser) {
                showNotification('Please login first', 'error');
                return;
            }
            showNotification('Image upload is disabled in demo. Using random placeholder images instead!', 'info');
        });
    }

    // Feeling button
    const feelingBtn = document.getElementById('feelingBtn');
    if (feelingBtn) {
        feelingBtn.addEventListener('click', () => {
            if (!auth.currentUser) {
                showNotification('Please login first', 'error');
                return;
            }
            const feelings = ['Happy 😊', 'Sad 😢', 'Excited 🎉', 'Blessed 🙏', 'Grateful 💜'];
            const randomFeeling = feelings[Math.floor(Math.random() * feelings.length)];
            document.getElementById('postContent').value = `Feeling ${randomFeeling}`;
        });
    }

    // Live video button
    const liveVideoBtn = document.getElementById('liveVideoBtn');
    if (liveVideoBtn) {
        liveVideoBtn.addEventListener('click', () => {
            showNotification('Live video coming soon to LavBoc!', 'info');
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                if (query.trim()) {
                    showNotification(`Searching for "${query}"...`, 'info');
                }
            }
        });
    }

    // Nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.id;
            
            if (id === 'friendsLink') {
                showNotification('Friends feature coming soon!', 'info');
            } else if (id === 'watchLink') {
                showNotification('LavBoc Watch coming soon!', 'info');
            } else if (id === 'marketplaceLink') {
                showNotification('LavBoc Marketplace coming soon!', 'info');
            } else if (id === 'groupsLink') {
                showNotification('Groups feature coming soon!', 'info');
            }
        });
    });
}

// Toggle theme
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Show notification function (global)
window.showNotification = function(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};
