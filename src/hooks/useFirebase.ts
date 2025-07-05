import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import {
  auth,
  authenticateUser,
  getUserProgressRef,
  getLeaderboardRef,
  getGlobalLeaderboardRef,
  initializeUserProgress,
  updateUserProgress as updateUserProgressFirestore,
  updateLeaderboard,
  updateGlobalLeaderboard,
} from '../firebase/config';
import {
  UserProgress,
  LeaderboardEntry,
  GlobalLeaderboardEntry,
} from '../types/game';

export const useFirebase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: LeaderboardEntry[] }>({});
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authenticatedUser = await authenticateUser();
        setUser(authenticatedUser);
      } catch (err) {
        setError('Failed to authenticate user');
        console.error('Auth error:', err);
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setUserProgress(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const progressRef = getUserProgressRef(user.uid);
    const unsubscribe = onSnapshot(
      progressRef,
      (doc) => {
        if (doc.exists()) {
          setUserProgress(doc.data() as UserProgress);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading user progress:', err);
        setError('Failed to load user progress');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const gameIds = ['higher-lower', 'quick-count', 'sequence-sprint', 'memory-match'];
    const unsubscribes: (() => void)[] = [];

    gameIds.forEach((gameId) => {
      const ref = getLeaderboardRef(gameId);
      const unsub = onSnapshot(
        ref,
        (doc) => {
          if (doc.exists()) {
            setLeaderboards((prev) => ({
              ...prev,
              [gameId]: doc.data().players || [],
            }));
          }
        },
        (err) => console.error(`${gameId} leaderboard error:`, err)
      );
      unsubscribes.push(unsub);
    });

    const globalRef = getGlobalLeaderboardRef();
    const unsubGlobal = onSnapshot(
      globalRef,
      (doc) => {
        if (doc.exists()) {
          setGlobalLeaderboard(doc.data().players || []);
        }
      },
      (err) => console.error('Global leaderboard error:', err)
    );

    unsubscribes.push(unsubGlobal);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const initializeUser = async (playerName: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const progress = await initializeUserProgress(user.uid, playerName);
      setUserProgress(progress as UserProgress);
      setError(null);
      return progress;
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize user');
      throw err;
    }
  };

  const updateUserProgress = async (gameId: string, updates: any) => {
    if (!user || !userProgress) throw new Error('Missing user or progress');
    try {
      await updateUserProgressFirestore(user.uid, gameId, updates);

      const playerData = {
        userId: user.uid,
        playerName: userProgress.playerName,
        bestLevel: updates.bestLevel,
        totalScore: updates.totalScore,
      };

      await updateLeaderboard(gameId, playerData);
      await updateGlobalLeaderboard({
        ...userProgress,
        games: {
          ...userProgress.games,
          [gameId]: updates,
        },
      });
    } catch (err) {
      console.error('Progress update error:', err);
      setError('Failed to update progress');
      throw err;
    }
  };

  return {
    user,
    userProgress,
    leaderboards,
    globalLeaderboard,
    loading,
    error,
    initializeUser,
    updateUserProgress,
  };
};
