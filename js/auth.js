import { auth, db } from './firebase-config.js';
import { 
    signInWithPopup, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize auth
export function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User logged in:', user.email);
            hideLoginModal();
            updateUserInterface(user);
            await initializeUserData(user);
        } else {
            console.log('User logged out');
            showLoginModal();
        }
    });

    // Setup event listeners
    setupAuthListeners();
}

// Setup all auth-related event listeners
function setupAuthListeners() {
    // Google login
    const googleBtn = document.getElementById('googleLogin');
    if (googleBtn) {
        googleBtn.addEventListener('click', signInWithGoogle);
    }

    // Email login form
    const emailForm = document.getElementById('emailLoginForm');
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await signInWithEmail(email, password);
        });
    }

    // Show signup form
    const showSignup = document.getElementById('showSignup');
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            const signupForm = document.getElementById('signupForm');
            signupForm.style.display = signupForm.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Email signup form
    const signupForm = document.getElementById('emailSignupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPass = document.getElementById('signupConfirmPassword').value;

            if (password !== confirmPass) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            await signUpWithEmail(name, email, password);
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOutUser();
        });
    }

    // User menu dropdown
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            document.getElementById('dropdownMenu').classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('show');
        }
    });
}

// Google Sign In
export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        showNotification('Logged in successfully!', 'success');
        return result.user;
    } catch (error) {
        console.error('Google sign in error:', error);
        showNotification(error.message, 'error');
    }
}

// Email Sign In
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        showNotification('Logged in successfully!', 'success');
        return result.user;
    } catch (error) {
        console.error('Email sign in error:', error);
        showNotification(error.message, 'error');
    }
}

// Email Sign Up
export async function signUpWithEmail(name, email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(result.user, {
            displayName: name
        });
        
        showNotification('Account created successfully!', 'success');
        return result.user;
    } catch (error) {
        console.error('Sign up error:', error);
        showNotification(error.message, 'error');
    }
}

// Sign Out
export async function signOutUser() {
    try {
        await signOut(auth);
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification(error.message, 'error');
    }
}

// Initialize user data in Firestore
async function initializeUserData(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || 'LavBoc User',
            email: user.email,
            photoURL: user.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            bio: 'Welcome to my LavBoc profile! 💜',
            followers: [],
            following: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        });
    } else {
        // Update last active
        await setDoc(userRef, {
            lastActive: new Date().toISOString()
        }, { merge: true });
    }
}

// Update user interface
function updateUserInterface(user) {
    // Update display names
    const nameElements = document.querySelectorAll('#displayName, #sidebarName, #modalUserName');
    nameElements.forEach(el => {
        if (el) el.textContent = user.displayName || 'LavBoc User';
    });

    // Update avatars
    const avatarElements = document.querySelectorAll('#profileAvatar, .large-avatar, .small-avatar, .medium-avatar');
    avatarElements.forEach(el => {
        if (el && el.tagName === 'IMG') {
            el.src = user.photoURL || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
        }
    });
}

// Show login modal
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('show');
    }
}

// Hide login modal
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('show');
    }
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
