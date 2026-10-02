"use client";

import { useSyncExternalStore } from "react";

const query = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function snapshot() {
  return window.matchMedia(query).matches ? "desktop" : "mobile";
}

/** One list markup at a time, so a hidden mobile/desktop copy does not fetch images. */
export function useListLayout() {
  return useSyncExternalStore(subscribe, snapshot, () => "pending" as const);
}
