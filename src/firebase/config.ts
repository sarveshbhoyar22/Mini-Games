import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';

// Global variables provided by the environment
declare global {
  var __app_id: string;
  var __firebase_config: any;
  var __initial_auth_token: string | undefined;
}


// Firebase configuration
const firebaseConfig = (globalThis as any).__firebase_config || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// App ID for Firestore paths
export const appId = (globalThis as any).__app_id || 'demo-app';

// Authentication helper
export const authenticateUser = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const initialToken = (globalThis as any).__initial_auth_token;
          if (initialToken) {
            await signInWithCustomToken(auth, initialToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

// Google Sign-In helper
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await initializeUserProgress(user.uid, user.displayName || user.email || 'Player');
  return user;
};

// Firestore helper functions
export const getUserProgressRef = (userId: string) => 
  doc(db, `artifacts/${appId}/users/${userId}`);

export const getLeaderboardRef = (gameName: string) => 
  doc(db, `artifacts/${appId}/public/data/leaderboards/${gameName}`);

export const getGlobalLeaderboardRef = () => 
  doc(db, `artifacts/${appId}/public/data/leaderboards/global`);

// Initialize user progress document
export const initializeUserProgress = async (userId: string, playerName: string) => {
  const progressRef = getUserProgressRef(userId);
  const progressDoc = await getDoc(progressRef);
  
  if (!progressDoc.exists()) {
    const initialProgress = {
      playerName,
      userId,
      createdAt: Timestamp.now(),
      games: {
        'higher-lower': { currentLevel: 1, bestLevel: 1, totalScore: 0 },
        'quick-count': { currentLevel: 1, bestLevel: 1, totalScore: 0 },
        'sequence-sprint': { currentLevel: 1, bestLevel: 1, totalScore: 0 },
        'memory-match': { currentLevel: 1, bestLevel: 1, totalScore: 0 }
      }
    };
    await setDoc(progressRef, initialProgress);
    return initialProgress;
  }
  
  return progressDoc.data();
};

// Update user progress
export const updateUserProgress = async (userId: string, gameId: string, updates: any) => {
  const progressRef = getUserProgressRef(userId);
  await updateDoc(progressRef, {
    [`games.${gameId}`]: updates,
    lastUpdated: Timestamp.now()
  });
};

// Enhanced leaderboard update with better sorting
export const updateLeaderboard = async (gameId: string, playerData: any) => {
  const leaderboardRef = getLeaderboardRef(gameId);
  const leaderboardDoc = await getDoc(leaderboardRef);
  
  let leaderboard = leaderboardDoc.exists() ? leaderboardDoc.data().players || [] : [];
  
  // Remove existing entry for this player
  leaderboard = leaderboard.filter((p: any) => p.userId !== playerData.userId);
  
  // Add new entry
  leaderboard.push({
    ...playerData,
    updatedAt: Timestamp.now()
  });
  
  // Enhanced sorting based on game type
  leaderboard.sort((a: any, b: any) => {
    // Primary sort: Best level (descending)
    if (b.bestLevel !== a.bestLevel) {
      return b.bestLevel - a.bestLevel;
    }
    // Secondary sort based on game-specific metrics
    switch (gameId) {
      case 'higher-lower':
        if (a.bestAttempts && b.bestAttempts) {
          return a.bestAttempts - b.bestAttempts;
        }
        break;
      case 'quick-count':
      case 'memory-match':
        if (a.bestTime && b.bestTime) {
          return a.bestTime - b.bestTime;
        }
        break;
      case 'sequence-sprint':
        if (a.bestAccuracy && b.bestAccuracy) {
          return b.bestAccuracy - a.bestAccuracy;
        }
        break;
    }
    // Tertiary sort: Total score (descending)
    return b.totalScore - a.totalScore;
  });
  
  leaderboard = leaderboard.slice(0, 10);
  
  await setDoc(leaderboardRef, { players: leaderboard, updatedAt: Timestamp.now() });
};

// Enhanced global leaderboard with better metrics
export const updateGlobalLeaderboard = async (playerData: any) => {
  const globalRef = getGlobalLeaderboardRef();
  const globalDoc = await getDoc(globalRef);
  
  let leaderboard = globalDoc.exists() ? globalDoc.data().players || [] : [];
  
  // Remove existing entry for this player
  leaderboard = leaderboard.filter((p: any) => p.userId !== playerData.userId);
  
  // Calculate comprehensive metrics
  const games = Object.values(playerData.games);
  const totalScore = games.reduce((sum: number, game: any) => sum + game.totalScore, 0);
  const totalLevels = games.reduce((sum: number, game: any) => sum + game.bestLevel, 0);
  const averageLevel = Math.round(totalLevels / games.length);
  const gamesCompleted = games.filter((game: any) => game.bestLevel >= 100).length;
  
  // Weighted score calculation
  const levelWeight = 10;
  const scoreWeight = 1;
  const completionBonus = gamesCompleted * 1000;
  const weightedScore = (totalLevels * levelWeight) + (totalScore * scoreWeight) + completionBonus;
  
  // Add new entry
  leaderboard.push({
    userId: playerData.userId,
    playerName: playerData.playerName,
    totalScore: weightedScore,
    averageLevel,
    gamesCompleted,
    rawScore: totalScore,
    totalLevels,
    updatedAt: Timestamp.now()
  });
  
  // Sort by weighted score (descending)
  leaderboard.sort((a: any, b: any) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.gamesCompleted !== a.gamesCompleted) {
      return b.gamesCompleted - a.gamesCompleted;
    }
    return b.averageLevel - a.averageLevel;
  });
  
  leaderboard = leaderboard.slice(0, 10);
  
  await setDoc(globalRef, { players: leaderboard, updatedAt: Timestamp.now() });
};
