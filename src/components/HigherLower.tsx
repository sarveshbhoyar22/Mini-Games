// Enhanced Higher or Lower game with proximity feedback and improved mechanics
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Target,
  RotateCcw,
  Trophy,
  Star,
  TrendingUp,
  Clock,
  Thermometer,
} from "lucide-react";
import { UserProgress, GameStats } from "../types/game";
import { getDifficultyConfig } from "../utils/difficulty";

interface HigherLowerProps {
  onBack: () => void;
  userProgress: UserProgress;
  onUpdateProgress: (gameId: string, updates: any) => Promise<void>;
}

const HigherLower: React.FC<HigherLowerProps> = ({
  onBack,
  userProgress,
  onUpdateProgress,
}) => {
  const gameProgress = userProgress.games["higher-lower"];
  const difficulty = getDifficultyConfig(
    "higher-lower",
    gameProgress.currentLevel
  );

  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    startTime: 0,
    attempts: 0,
    accuracy: 0,
    score: 0,
  });
  const [previousGuesses, setPreviousGuesses] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    startNewGame();
  }, [gameProgress.currentLevel]);

  // Timer effect for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameWon && !gameLost) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStats.startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameWon, gameLost, gameStats.startTime]);

  const startNewGame = () => {
    const min = difficulty.minRange || 1;
    const max = difficulty.maxRange || 1000;
    const target = Math.floor(Math.random() * (max - min + 1)) + min;

    setTargetNumber(target);
    setGuess("");
    setFeedback("");
    setAttempts(0);
    setGameWon(false);
    setGameLost(false);
    setGameStarted(true);
    setShowLevelComplete(false);
    setPreviousGuesses([]);
    setElapsedTime(0);
    setGameStats({
      startTime: Date.now(),
      attempts: 0,
      accuracy: 0,
      score: 0,
    });
  };

  const getProximityFeedback = (guessNum: number, target: number): string => {
    const distance = Math.abs(guessNum - target);
    const threshold = difficulty.proximityThreshold || 50;

    if (distance <= threshold * 0.1) return "🔥 Burning hot!";
    if (distance <= threshold * 0.3) return "🌡️ Very warm!";
    if (distance <= threshold * 0.6) return "☀️ Getting warmer...";
    if (distance <= threshold) return "🌤️ Warm";
    if (distance <= threshold * 2) return "❄️ Cool";
    if (distance <= threshold * 4) return "🧊 Cold";
    return "🥶 Freezing!";
  };

  const handleGuess = () => {
    if (!guess || isNaN(Number(guess))) return;

    const guessNum = parseInt(guess);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setPreviousGuesses((prev) => [...prev, guessNum]);

    if (guessNum === targetNumber) {
      const endTime = Date.now();
      const timeTaken = endTime - gameStats.startTime;
      const accuracy =
        ((difficulty.maxAttempts! - newAttempts + 1) /
          difficulty.maxAttempts!) *
        100;
      const timeBonus = Math.max(0, 60000 - timeTaken) / 1000; // Bonus for speed
      const score = Math.floor(100 + timeBonus + accuracy);

      setFeedback("🎉 Correct! You got it!");
      setGameWon(true);
      setShowLevelComplete(true);
      setGameStats((prev) => ({
        ...prev,
        endTime,
        attempts: newAttempts,
        accuracy,
        score,
      }));
    } else if (newAttempts >= (difficulty.maxAttempts || 15)) {
      setFeedback(`💥 Game Over! The number was ${targetNumber}`);
      setGameLost(true);
    } else {
      const direction = guessNum < targetNumber ? "📈 Higher!" : "📉 Lower!";
      const proximity = getProximityFeedback(guessNum, targetNumber);
      const distance = Math.abs(guessNum - targetNumber);
      setFeedback(`${direction} ${proximity} `);
    }

    setGuess("");
  };

  const handleLevelComplete = async () => {
    try {
      const newLevel = gameProgress.currentLevel + 1;
      const newScore = gameProgress.totalScore + gameStats.score;
      const bestTime = gameStats.endTime
        ? gameStats.endTime - gameStats.startTime
        : undefined;

      await onUpdateProgress("higher-lower", {
        currentLevel: Math.min(newLevel, 100),
        bestLevel: Math.max(gameProgress.bestLevel, gameProgress.currentLevel),
        totalScore: newScore,
        bestAttempts: Math.min(gameProgress.bestAttempts || Infinity, attempts),
        bestTime: bestTime
          ? Math.min(gameProgress.bestTime || Infinity, bestTime)
          : gameProgress.bestTime,
      });

      if (newLevel <= 100) {
        startNewGame();
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleGameOver = async () => {
    try {
      await onUpdateProgress("higher-lower", {
        currentLevel: 1,
        bestLevel: gameProgress.bestLevel,
        totalScore: gameProgress.totalScore,
        bestAttempts: gameProgress.bestAttempts,
        bestTime: gameProgress.bestTime,
      });

      startNewGame();
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const getScoreColor = () => {
    if (attempts <= 3) return "text-green-400";
    if (attempts <= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const remainingAttempts = (difficulty.maxAttempts || 15) - attempts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Hub
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">
                Level {gameProgress.currentLevel}/100
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">
                Best: {gameProgress.bestLevel}
              </span>
            </div>
            {gameStarted && !gameWon && !gameLost && (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">{elapsedTime}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Higher or Lower
            </h2>
            <p className="text-purple-200 text-lg">
              Guess the number between {difficulty.minRange} and{" "}
              {difficulty.maxRange}
            </p>

            {/* Enhanced Difficulty Info */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">
                  Range: {difficulty.minRange}-{difficulty.maxRange}
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">
                  Max Attempts: {difficulty.maxAttempts}
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">
                  Proximity Hints: Enabled
                </span>
              </div>
            </div>
          </div>

          {gameStarted && !showLevelComplete && !gameLost && (
            <div className="space-y-6">
              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className={`font-semibold ${getScoreColor()}`}>
                      {attempts}/{difficulty.maxAttempts}
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs mt-1">Attempts</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-semibold">
                      {remainingAttempts}
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs mt-1">Remaining</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">
                      {elapsedTime}s
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs mt-1">Time</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-semibold">
                      {previousGuesses.length}
                    </span>
                  </div>
                  <p className="text-purple-200 text-xs mt-1">Guesses</p>
                </div>
              </div>

              {/* Previous Guesses */}
              {previousGuesses.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">
                    Previous Guesses:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previousGuesses.map((prevGuess, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-full text-purple-200 text-sm"
                      >
                        {prevGuess}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="number"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your guess..."
                    min={difficulty.minRange}
                    max={difficulty.maxRange}
                    disabled={gameWon || gameLost}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleGuess}
                    disabled={!guess || gameWon || gameLost}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guess
                  </button>
                </div>

                {/* Enhanced Feedback */}
                {feedback && (
                  <div
                    className={`text-center p-4 rounded-lg ${
                      gameWon
                        ? "bg-green-500/20 text-green-400"
                        : gameLost
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="text-xl font-semibold">{feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Level Complete */}
          {showLevelComplete && (
            <div className="text-center space-y-6">
              <div className="bg-green-500/20 text-green-400 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">
                  🎉 Level {gameProgress.currentLevel} Complete!
                </h3>
                <p className="text-lg mb-4">
                  You found the number {targetNumber} in {attempts} attempts!
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-300">Time: </span>
                    <span className="font-semibold">
                      {Math.floor(
                        (gameStats.endTime! - gameStats.startTime) / 1000
                      )}
                      s
                    </span>
                  </div>
                  <div>
                    <span className="text-green-300">Score: </span>
                    <span className="font-semibold">+{gameStats.score}</span>
                  </div>
                  <div>
                    <span className="text-green-300">Accuracy: </span>
                    <span className="font-semibold">
                      {Math.round(gameStats.accuracy)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-green-300">Efficiency: </span>
                    <span className="font-semibold">
                      {attempts}/{difficulty.maxAttempts}
                    </span>
                  </div>
                </div>
              </div>

              {gameProgress.currentLevel < 100 ? (
                <button
                  onClick={handleLevelComplete}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  <Star className="w-5 h-5" />
                  Continue to Level {gameProgress.currentLevel + 1}
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-yellow-400">
                    🏆 Congratulations!
                  </p>
                  <p className="text-white">You've completed all 100 levels!</p>
                  <button
                    onClick={handleLevelComplete}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300"
                  >
                    <Trophy className="w-5 h-5" />
                    Return to Hub
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game Over */}
          {gameLost && (
            <div className="text-center space-y-6">
              <div className="bg-red-500/20 text-red-400 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">💥 Level Failed!</h3>
                <p className="text-lg mb-4">
                  You've used all {difficulty.maxAttempts} attempts. The number
                  was {targetNumber}.
                </p>
                <p className="text-yellow-400 font-semibold">
                  Progress reset to Level 1. Try again!
                </p>
              </div>

              <button
                onClick={handleGameOver}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                Start Over from Level 1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HigherLower;
