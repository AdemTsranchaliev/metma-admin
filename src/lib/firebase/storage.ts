import type { FirebaseStorage } from "firebase/storage";
import { getApp } from "./client";

let storage: FirebaseStorage | undefined;

export async function getFirebaseStorage() {
  if (!storage) {
    const { getStorage } = await import("firebase/storage");
    storage = getStorage(getApp());
  }
  return storage;
}
