import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNRUWxYDEaNG0YrFfzfZSmMff2A4XjtcY",
  authDomain: "receipt-scanner-petru.firebaseapp.com",
  projectId: "receipt-scanner-petru",
  storageBucket: "receipt-scanner-petru.firebasestorage.app",
  messagingSenderId: "906835820228",
  appId: "1:906835820228:web:982ccbc57871841c329391",
  measurementId: "G-1PSC68EZPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };