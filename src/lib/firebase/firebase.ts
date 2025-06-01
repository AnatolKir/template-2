import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

if (
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  !process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
  !process.env.NEXT_PUBLIC_FIREBASE_APP_ID
) {
  throw new Error(
    'Missing Firebase configuration. Please check your .env.local file.'
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
