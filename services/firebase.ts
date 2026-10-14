// This file connects the app to Firebase.
// Other files import `auth` (for login) and `db` (for the database) from here.

import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

// The keys of our Firebase project.
// They come from the .env file (variables starting with EXPO_PUBLIC_).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Start Firebase with our config.
const app = initializeApp(firebaseConfig);

// Login system. AsyncStorage saves the user on the phone,
// so they stay logged in when they close and reopen the app.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// The database (Firestore).
// The normal connection mode does not work well in React Native,
// so we use "long polling" (the app asks the server again and again).
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
