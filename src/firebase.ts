import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
try {
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  console.error('Config used:', firebaseConfig);
}

export { db };