import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  addDoc, 
  query, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, CompletedWorkout, MealLog } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged };

// Initialize Firestore (using custom database ID from config if available)
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot as mandated by skill
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore running in offline cache mode.");
    }
  }
}
testFirestoreConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Cloud Persistence helpers for Firestore
export async function syncUserProfileToCloud(userId: string, profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn("Failed to sync profile to cloud", e);
  }
}

export async function loadUserProfileFromCloud(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (e) {
    console.warn("Failed to load profile from cloud", e);
  }
  return null;
}

export async function saveWorkoutToCloud(userId: string, workout: CompletedWorkout): Promise<void> {
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workout.id);
    await setDoc(workoutRef, workout);
  } catch (e) {
    console.warn("Failed to save workout to cloud", e);
  }
}

export async function saveMealToCloud(userId: string, meal: MealLog): Promise<void> {
  try {
    const mealRef = doc(db, 'users', userId, 'meals', meal.id);
    await setDoc(mealRef, meal);
  } catch (e) {
    console.warn("Failed to save meal to cloud", e);
  }
}
