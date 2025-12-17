// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore import करा
import { getStorage } from "firebase/storage"; // Storage import करा

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1LQOQgSw_iYnyL2ti7PB_-kmsECmNhco",
  authDomain: "govt-gram-panchayat-project.firebaseapp.com",
  projectId: "govt-gram-panchayat-project",
  storageBucket: "govt-gram-panchayat-project.appspot.com", // .firebasestorage.app बदला .appspot.com ने
  messagingSenderId: "22205845601",
  appId: "1:22205845601:web:817b22295d5d8ca3dd1a20",
  measurementId: "G-6Q38QJMY4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore सुरु करा
const storage = getStorage(app); // Storage सुरु करा

export { auth, db, storage }; // db आणि storage एक्सपोर्ट करा
export default app;