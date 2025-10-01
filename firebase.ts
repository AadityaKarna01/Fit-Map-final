import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsg59p8f98EFi5Kp2x96yFqxdIlMsZ0NM",
  authDomain: "fitmap-a2e6e.firebaseapp.com",
  projectId: "fitmap-a2e6e",
  storageBucket: "fitmap-a2e6e.appspot.com",
  messagingSenderId: "1040491949431",
  appId: "1:1040491949431:web:fdbf68674532ec4731c572",
  measurementId: "G-FE5J8RQ340"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
