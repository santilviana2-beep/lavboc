import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDf1ziglFkSYVIMsC6lfX5rp4KZgd_-sGg",
  authDomain: "lavboc-7a263.firebaseapp.com",
  projectId: "lavboc-7a263",
  storageBucket: "lavboc-7a263.firebasestorage.app",
  messagingSenderId: "628962930491",
  appId: "1:628962930491:web:77d1ed18fe9c32b12d511e",
  measurementId: "G-Y3LH3F7K05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
