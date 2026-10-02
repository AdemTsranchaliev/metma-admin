import { getFirestore, type Firestore } from "firebase/firestore";
import { getApp } from "./client";

let db: Firestore | undefined;

export function getDb() {
  if (!db) db = getFirestore(getApp());
  return db;
}
