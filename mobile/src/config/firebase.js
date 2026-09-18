import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'firebase-not-configured',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'firebase-not-configured',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'firebase-not-configured',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'firebase-not-configured',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'firebase-not-configured',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'firebase-not-configured',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && value !== 'firebase-not-configured',
);

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  // The React Native persistence adapter is not part of the browser bundle.
  // Web Firebase Auth uses its own local persistence implementation.
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error?.code === 'auth/already-initialized') {
      return getAuth(firebaseApp);
    }

    throw error;
  }
}

export const auth = createAuth();
