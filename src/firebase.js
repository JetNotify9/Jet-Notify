// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDmVYM_30nRAhDDVdK8Mzl1Wo2LXRUVRvg",
    authDomain: "jetnotify-6f46b.firebaseapp.com",
    projectId: "jetnotify-6f46b",
    storageBucket: "jetnotify-6f46b.firebasestorage.app",
    messagingSenderId: "914858025485",
    appId: "1:914858025485:web:8212d5e1066b89edc9eb44"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
