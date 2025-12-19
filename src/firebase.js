// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjgfuvxrGVPZ5MmmhmzgZdAoZH2P8d_1M",
  authDomain: "dairy-manager-13542.firebaseapp.com",
  projectId: "dairy-manager-13542",
  storageBucket: "dairy-manager-13542.firebasestorage.app",
  messagingSenderId: "144256578676",
  appId: "1:144256578676:web:db38124c7b0fb19ed20d21",
  measurementId: "G-MXJQ1G1D6V",
  databaseURL: 'https://console.firebase.google.com/u/0/project/dairy-manager-13542/database/dairy-manager-13542-default-rtdb/data/~2F'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);