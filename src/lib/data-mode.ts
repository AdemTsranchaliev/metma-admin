/** Firebase flags without importing the Firebase SDK. */
export const firebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
);

export const useFirebase =
  process.env.NEXT_PUBLIC_USE_FIREBASE === "true" && firebaseConfigured;

export const useMockData =
  !useFirebase && process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
