import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD98johEiOeakAgL70dEAzM0FToPluEjmE",
  authDomain: "liran-barbershop.firebaseapp.com",
  projectId: "liran-barbershop",
  storageBucket: "liran-barbershop.firebasestorage.app",
  messagingSenderId: "183982501883",
  appId: "1:183982501883:web:9e8cf79ee5d9505edb255e",
  measurementId: "G-VGQEGGW0C1",
};

const app = initializeApp(firebaseConfig);

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
