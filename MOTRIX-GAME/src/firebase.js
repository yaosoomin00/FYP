
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDznUPKNfqUgMlUHqv8dxixwDPz0KgTHm0",
  authDomain: "motrix-c5354.firebaseapp.com",
  projectId: "motrix-c5354",
  storageBucket: "motrix-c5354.firebasestorage.app",
  messagingSenderId: "820139508681",
  appId: "1:820139508681:web:f5b5367cce617256f11e18",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
