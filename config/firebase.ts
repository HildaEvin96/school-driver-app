import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3sZU3sWYDygdv8F5vLm_y8uT35DL-kM4",
  authDomain: "school-driver-app-a7c7f.firebaseapp.com",
  projectId: "school-driver-app-a7c7f",
  storageBucket: "school-driver-app-a7c7f.firebasestorage.app",
  messagingSenderId: "626365856515",
  appId: "1:626365856515:web:39de90eee75f3760734736",
  measurementId: "G-GT7GZ5VS8E"
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;