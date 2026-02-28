import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Add this
import { getStorage } from "firebase/storage"; // Add this for your calendar PDFs

const firebaseConfig = {
  apiKey: "AIzaSyBMz3ci3jMNJqzyWGWlUtOSS93O-0Dv6VA",
  authDomain: "hostel-survival-kit.firebaseapp.com",
  projectId: "hostel-survival-kit",
  storageBucket: "hostel-survival-kit.firebasestorage.app",
  messagingSenderId: "453209875257",
  appId: "1:453209875257:web:a7e0fd1f5eb17ef3847ee8"
};

const app = initializeApp(firebaseConfig);

// Export all services so your other files can use them
export const db = getFirestore(app);
export const auth = getAuth(app); // Added this
export const storage = getStorage(app); // Added this