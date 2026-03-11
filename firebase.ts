
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

/**
 * IPHECO SMART COLLECTIONS - FIREBASE CONFIGURATION
 * Using your provided project credentials for ipheco-fb5d8
 */
const firebaseConfig = {
  apiKey: "AIzaSyDHnwhxMSxujHTvujsIVDdXOwCGXtZbx3I",
  authDomain: "ipheco-fb5d8.firebaseapp.com",
  projectId: "ipheco-fb5d8",
  storageBucket: "ipheco-fb5d8.firebasestorage.app",
  messagingSenderId: "983892462969",
  appId: "1:983892462969:web:e1bf1c86c0eafa320d33a8",
  measurementId: "G-2ZGHD0CPSZ"
};

// Simple check to see if placeholders are still present (for developer feedback)
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_API_KEY" && firebaseConfig.apiKey !== "";
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
