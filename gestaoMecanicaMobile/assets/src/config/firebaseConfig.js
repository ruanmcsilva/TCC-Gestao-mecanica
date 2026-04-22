import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCPxjAlC3qSElvUZjP-AiTVPHYES03A_hk",
  authDomain: "appmobileplaneta.firebaseapp.com",
  projectId: "appmobileplaneta",
  storageBucket: "appmobileplaneta.firebasestorage.app",
  messagingSenderId: "759174343292",
  appId: "1:759174343292:web:91bd9126c1ff098e79b7f9",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
