// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore import करा
import { getStorage } from "firebase/storage"; // Storage import करा

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOtbOd6lYytUfOZENEcqcV4dLogXoh3eo",
  authDomain: "grampanchayat-6832a.firebaseapp.com",
  projectId: "grampanchayat-6832a",
  storageBucket: "grampanchayat-6832a.firebasestorage.app",
  messagingSenderId: "596529411514",
  appId: "1:596529411514:web:aada1c39bd7d7873b81983",
  measurementId: "G-9NYZ9Q4CDZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore सुरु करा
const storage = getStorage(app); // Storage सुरु करा

export { auth, db, storage, analytics }; // db, storage आणि analytics एक्सपोर्ट करा
export default app;