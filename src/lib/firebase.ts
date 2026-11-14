import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const typedConfig = config as typeof config & { firestoreDatabaseId?: string };

export const FIRESTORE_PROJECT_ID = typedConfig.projectId || 'gen-lang-client-0490377599';
export const FIRESTORE_DATABASE_ID =
  typedConfig.firestoreDatabaseId && typedConfig.firestoreDatabaseId !== '(default)'
    ? typedConfig.firestoreDatabaseId
    : 'ai-studio-acedepassociaocu-fe62783f-4d2c-46d8-afc3-af28924ec5f2';

export const FIRESTORE_QUOTA_CONSOLE_URL = `https://console.firebase.google.com/project/${FIRESTORE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`;
export const FIRESTORE_PRICING_URL = 'https://firebase.google.com/pricing#cloud-firestore';

const firebaseConfig = {
  apiKey: typedConfig.apiKey,
  authDomain: typedConfig.authDomain,
  projectId: FIRESTORE_PROJECT_ID,
  storageBucket: typedConfig.storageBucket,
  messagingSenderId: typedConfig.messagingSenderId,
  appId: typedConfig.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreDb;
try {
  // Enable persistent IndexedDB cache so photos and cloud data remain cached across refreshes/tabs
  // and drastically reduce Firestore daily read units consumption
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    FIRESTORE_DATABASE_ID
  );
} catch {
  try {
    firestoreDb = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      FIRESTORE_DATABASE_ID
    );
  } catch {
    firestoreDb = FIRESTORE_DATABASE_ID
      ? getFirestore(app, FIRESTORE_DATABASE_ID)
      : getFirestore(app);
  }
}

export const db = firestoreDb;
export const auth = getAuth(app);

// Global Firestore Quota Exceeded notification state
let quotaExceededState = false;
let quotaErrorMessage = '';
const quotaListeners = new Set<(exceeded: boolean, message: string) => void>();

export function getFirestoreQuotaExceeded(): { exceeded: boolean; message: string } {
  return { exceeded: quotaExceededState, message: quotaErrorMessage };
}

export function subscribeFirestoreQuotaError(
  listener: (exceeded: boolean, message: string) => void
): () => void {
  quotaListeners.add(listener);
  listener(quotaExceededState, quotaErrorMessage);
  return () => {
    quotaListeners.delete(listener);
  };
}

function notifyQuotaError(message: string) {
  quotaExceededState = true;
  quotaErrorMessage = message;
  quotaListeners.forEach((cb) => cb(true, message));
}

// Helper to remove any undefined fields before writing to Firestore
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanFirestoreData(value);
    }
  }
  return result as T;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code ? String((error as any).code) : '';
  const lowerMsg = errMessage.toLowerCase();

  if (
    errCode === 'resource-exhausted' ||
    lowerMsg.includes('quota exceeded') ||
    lowerMsg.includes('resource-exhausted') ||
    lowerMsg.includes('free daily read units') ||
    lowerMsg.includes('429')
  ) {
    notifyQuotaError(errMessage);
  }

  console.warn(`Firestore [${operationType}] at [${path || 'root'}]:`, errMessage);
}

// Non-blocking connection check on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'test/connection');
  }
}

// Defer test connection slightly to allow initial long-polling setup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 300);
}

export { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, collection, query, orderBy, getDocs, getDocFromServer };
