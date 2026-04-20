import { initializeApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Isolation Trick: We initialize a specific Firebase App based on the URL path
// This allows each panel (Admin, Chef, Dealer) to have its own independent PERSISTENT session
const getIsolatedAuth = () => {
  const path = window.location.pathname;
  let appName = '[DEFAULT]';
  
  if (path.startsWith('/admin')) appName = 'chilaquiles-admin';
  else if (path.startsWith('/chef')) appName = 'chilaquiles-chef';
  else if (path.startsWith('/repartidor')) appName = 'chilaquiles-repartidor';
  else if (path.startsWith('/ordenar')) appName = 'chilaquiles-client';

  try {
    const isolatedApp = initializeApp(firebaseConfig, appName);
    const isolatedAuth = getAuth(isolatedApp);
    setPersistence(isolatedAuth, browserLocalPersistence);
    isolatedAuth.useDeviceLanguage();
    return isolatedAuth;
  } catch (err) {
    // If already initialized, just get the auth
    return getAuth(initializeApp(firebaseConfig, appName));
  }
};

export const auth = getIsolatedAuth();
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};
