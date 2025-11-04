// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiFt0vms6LFblXpgcu1jYSH4XrGFU8RTQ",
    authDomain: "smartcar-bc22a.firebaseapp.com",
    projectId: "smartcar-bc22a",
    storageBucket: "smartcar-bc22a.firebasestorage.app",
    messagingSenderId: "784172495003",
    appId: "1:784172495003:web:c34d18a12492a0d345163e",
    measurementId: "G-KJL05DTV84"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Configure Firestore settings to avoid offline issues
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true
});

// Clear any existing offline data that might be causing issues
db.clearPersistence().catch(() => {
  // Ignore errors if persistence is not enabled
});

// Export for use in other files
window.db = db;
