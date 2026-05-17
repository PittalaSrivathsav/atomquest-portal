"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

import {
  getFirebaseClientSdkConfig,
  isFirebaseClientConfigured,
} from "@/lib/env/client";

let clientApp: FirebaseApp | undefined;
let clientAuth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local.",
    );
  }

  if (!clientApp) {
    const config = getFirebaseClientSdkConfig();
    if (!config) {
      throw new Error("Firebase client configuration is invalid.");
    }
    clientApp = getApps().length ? getApp() : initializeApp(config);
  }

  return clientApp;
}

export function getClientAuth(): Auth {
  if (!clientAuth) {
    clientAuth = getAuth(getFirebaseApp());
  }
  return clientAuth;
}
