// Firebase config for React Native (Expo)
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC47SqSbnqw0FNdy5YQ_d2-4AjYetiSGgk",
  authDomain: "blossomsaroma-c660f.firebaseapp.com",
  projectId: "blossomsaroma-c660f",
  storageBucket: "blossomsaroma-c660f.firebasestorage.app",
  messagingSenderId: "218486640029",
  appId: "1:218486640029:web:4019fa211a0446910ab374",
  measurementId: "G-B8RQTC0VMR"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth }; 