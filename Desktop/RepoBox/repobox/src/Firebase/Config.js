import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ← add this

const firebaseConfig = {
  apiKey: "AIzaSyCV9ZH3EnPHb57nQb8Bn-1EW3IgE-t-DQ8",
  authDomain: "repobox-c85a7.firebaseapp.com",
  projectId: "repobox-c85a7",
  storageBucket: "repobox-c85a7.firebasestorage.app",
  messagingSenderId: "293024629621",
  appId: "1:293024629621:web:8771655f92b5d20b6c093c",
  measurementId: "G-KV38HTV423"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ← add this
export default app;