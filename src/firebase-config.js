// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcNSafSw-RgwwKW1jxqRiSuykAxSslAM8",
  authDomain: "loverappp-43cdf.firebaseapp.com",
  databaseURL: "https://loverappp-43cdf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "loverappp-43cdf",
  storageBucket: "loverappp-43cdf.firebasestorage.app",
  messagingSenderId: "179466202395",
  appId: "1:179466202395:web:e68c2f51877f69fc88f7be",
  measurementId: "G-8VCMJDRJXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider };