import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMOGejvEGHNQ-Ij_fTcr_oMEI3rcLGZtM",
  authDomain: "lost-and-found-portal-76722.firebaseapp.com",
  projectId: "lost-and-found-portal-76722",
  storageBucket: "lost-and-found-portal-76722.firebasestorage.app",
  messagingSenderId: "377807165294",
  appId: "1:377807165294:web:525a423a6f1a23ed5fd37f",
  measurementId: "G-KCQH1WR5G6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };