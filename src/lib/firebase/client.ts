import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfigured } from "@/lib/data-mode";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = firebaseConfigured;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getApp() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase не е конфигуриран. Попълнете NEXT_PUBLIC_FIREBASE_* в .env.local",
    );
  }
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth() {
  if (!auth) auth = getAuth(getApp());
  return auth;
}
