import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cmai-ffc7e.firebaseapp.com",
  projectId: "cmai-ffc7e",
  storageBucket: "cmai-ffc7e.firebasestorage.app",
  messagingSenderId: "297490220283",
  appId: "1:297490220283:web:f10d668b33631f69a91c5e",
  measurementId: "G-BJ91BRJ5WK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, analytics };