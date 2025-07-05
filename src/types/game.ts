// Enhanced type definitions for the game application
export type GameType = 'hub' | 'higher-lower' | 'quick-count' | 'sequence-sprint' | 'memory-match';

export interface GameProgress {
  currentLevel: number;
  bestLevel: number;
  totalScore: number;
  bestTime?: number; // For time-based leaderboards
  bestAttempts?: number; // For attempt-based leaderboards
  bestAccuracy?: number; // For accuracy-based leaderboards
}

export interface UserProgress {
  playerName: string;
  userId: string;
  createdAt: any;
  lastUpdated?: any;
  games: {
    'higher-lower': GameProgress;
    'quick-count': GameProgress;
    'sequence-sprint': GameProgress;
    'memory-match': GameProgress;
  };
  globalScore?: number; // Combined score across all games
}

export interface LeaderboardEntry {
  userId: string;
  playerName: string;
  bestLevel: number;
  totalScore: number;
  bestTime?: number;
  bestAttempts?: number;
  bestAccuracy?: number;
  updatedAt: any;
}

export interface GlobalLeaderboardEntry {
  userId: string;
  playerName: string;
  totalScore: number;
  averageLevel: number;
  gamesCompleted: number;
  updatedAt: any;
}

export interface DifficultyConfig {
  level: number;
  // Higher or Lower specific
  minRange?: number;
  maxRange?: number;
  maxAttempts?: number;
  proximityThreshold?: number;
  // Quick Count specific
  shapeCount?: number;
  displayTime?: number;
  colorVariety?: number;
  sizeVariation?: number;
  overlapProbability?: number;
  // Sequence Sprint specific
  sequenceLength?: number;
  complexity?: number;
  numberRange?: number;
  patternDifficulty?: number;
  // Memory Match specific
  gridSize?: { rows: number; cols: number };
  revealTime?: number;
  pairCount?: number;
  cardSimilarity?: number;
}

export interface GameStats {
  startTime: number;
  endTime?: number;
  attempts: number;
  accuracy: number;
  score: number;
}