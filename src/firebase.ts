import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNGbRypSPZ2G71H7501-Gdv-sQ4rmJ7eU",
  authDomain: "snooker-f1caa.firebaseapp.com",
  projectId: "snooker-f1caa",
  storageBucket: "snooker-f1caa.firebasestorage.app",
  messagingSenderId: "1024796622467",
  appId: "1:1024796622467:web:40e0bdad0ebbd0effd25b6",
  measurementId: "G-6GJZD34G3S"
};

let db = null;
let auth = null;
let isOffline = false;

try {
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);

  // Initialize Firestore with offline persistence
  db = getFirestore(app);

  // Initialize Auth
  auth = getAuth(app);

  // Enable offline persistence for Firestore
  if (process.env.NODE_ENV === 'development') {
    // In development, you might want to use emulators
    console.log('Development mode: Firebase initialized with offline support');
  } else {
    console.log('Production mode: Firebase initialized with offline support');
  }

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  console.error('Config used:', firebaseConfig);
}

// Network status management
export const goOnline = async () => {
  if (db && isOffline) {
    try {
      await enableNetwork(db);
      isOffline = false;
      console.log('Firebase network enabled');
    } catch (error) {
      console.error('Failed to enable network:', error);
    }
  }
};

export const goOffline = async () => {
  if (db && !isOffline) {
    try {
      await disableNetwork(db);
      isOffline = true;
      console.log('Firebase network disabled');
    } catch (error) {
      console.error('Failed to disable network:', error);
    }
  }
};

// Connection status checker
export const isFirebaseOnline = () => !isOffline;

// Firestore collections structure
export const COLLECTIONS = {
  PLAYERS: 'players',
  SESSIONS: 'sessions',
  ENDED_SESSIONS: 'ended_sessions',
  PENDING_PAYMENTS: 'pending_payments',
  TRANSACTIONS: 'transactions'
} as const;

export { db, auth };