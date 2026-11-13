import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
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

const firebaseConfig = {
  apiKey: typedConfig.apiKey,
  authDomain: typedConfig.authDomain,
  projectId: typedConfig.projectId,
  storageBucket: typedConfig.storageBucket,
  messagingSenderId: typedConfig.messagingSenderId,
  appId: typedConfig.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with robust long-polling support and undefined properties handling
const databaseId = typedConfig.firestoreDatabaseId && typedConfig.firestoreDatabaseId !== '(default)' 
  ? typedConfig.firestoreDatabaseId 
  : 'ai-studio-acedepassociaocu-fe62783f-4d2c-46d8-afc3-af28924ec5f2';

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  }, databaseId);
} catch {
  firestoreDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);

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
  // Log handled warning without crashing UI
  console.warn(`Firestore [${operationType}] at [${path || 'root'}]:`, errMessage);
}

// Non-blocking connection check on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore operating in offline cache mode. Please check your Firebase configuration.');
    }
  }
}

// Defer test connection slightly to allow initial long-polling setup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 300);
}

export { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, collection, query, orderBy, getDocs, getDocFromServer };

