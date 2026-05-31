import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

let adminApp: App | null = null;

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim(),
  );
}

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();

  if (!raw || !databaseURL) {
    throw new Error("Firebase Admin SDK not configured");
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON");
  }

  adminApp = initializeApp({
    credential: cert(credentials as Parameters<typeof cert>[0]),
    databaseURL,
  });

  return adminApp;
}

export function getAdminDatabase(): Database {
  return getDatabase(getAdminApp());
}
