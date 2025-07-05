// Enhanced Sequence Sprint game with 100 unique patterns
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Brain,
  RotateCcw,
  Trophy,
  Star,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import { UserProgress, GameStats } from "../types/game";
import {
  getDifficultyConfig,
  generateSequencePattern,
} from "../utils/difficulty";

interface SequenceSprintProps {
  onBack: () => void;
  userProgress: UserProgress;
  onUpdateProgress: (gameId: string, updates: any) => Promise<void>;
}

const SequenceSprint: React.FC<SequenceSprintProps> = ({
  onBack,
  userProgress,
  onUpdateProgress,
}) => {
  const gameProgress = userProgress.games["sequence-sprint"];
  const difficulty = getDifficultyConfig(
    "sequence-sprint",
    gameProgress.currentLevel
  );

  const [currentSequence, setCurrentSequence] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [gameState, setGameState] = useState<"playing" | "result">("playing");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    startTime: 0,
    attempts: 0,
    accuracy: 0,
    score: 0,
  });
  const [hint, setHint] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const generateNewSequence = () => {
    const pattern = generateSequencePattern(
      gameProgress.currentLevel,
      difficulty.sequenceLength || 4
    );
    setCurrentSequence(pattern);
    setUserAnswer("");
    setFeedback("");
    setGameState("playing");
    setShowLevelComplete(false);
    setShowHint(false);
    setHint("");
    setElapsedTime(0);
    setGameStats({
      startTime: Date.now(),
      attempts: 0,
      accuracy: 0,
      score: 0,
    });
  };

  const submitAnswer = () => {
    if (!userAnswer || !currentSequence) return;

    const answer = parseInt(userAnswer);
    const correct = answer === currentSequence.answer;
    const endTime = Date.now();
    const timeTaken = endTime - gameStats.startTime;

    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.max(0, 30000 - timeTaken) / 1000; // 30 second time bonus
      const levelBonus = gameProgress.currentLevel * 10;
      const score = Math.floor(100 + timeBonus + levelBonus);

      setFeedback(
        `🎉 Correct! The pattern was: ${currentSequence.description}`
      );
      setGameStats((prev) => ({
        ...prev,
        endTime,
        attempts: 1,
        accuracy: 100,
        score,
      }));
    } else {
      setFeedback(
        `❌ Wrong! The correct answer was ${currentSequence.answer}. Pattern: ${currentSequence.description}`
      );
      setGameStats((prev) => ({
        ...prev,
        endTime,
        attempts: 1,
        accuracy: 0,
        score: 0,
      }));
    }

    setGameState("result");
  };

  const getHint = () => {
    if (!currentSequence) return;

    const hintMessages = {
      arithmetic: "Look for a constant difference between consecutive numbers",
      geometric: "Check if each number is multiplied by the same value",
      fibonacci: "Each number might be the sum of previous numbers",
      powers: "Consider exponential growth patterns",
      squares: "Think about perfect squares",
      prime: "These might be prime numbers",
      factorial: "Consider factorial sequences (n!)",
      alternating: "Look for alternating patterns",
      polynomial: "This might follow a quadratic pattern",
      tribonacci: "Each number is the sum of the three preceding ones",
      lucas: "Similar to Fibonacci but with different starting values",
      catalan: "These are Catalan numbers",
      collatz: "Apply the 3n+1 rule for odd numbers, n/2 for even",
      "digital-root": "Consider the sum of digits",
      modular: "Look for patterns in remainders",
    };

    setHint(
      hintMessages[currentSequence.type as keyof typeof hintMessages] ||
        "Look for mathematical relationships between the numbers"
    );
    setShowHint(true);
  };

  const handleLevelComplete = async () => {
    try {
      const newLevel = gameProgress.currentLevel + 1;
      const newScore =
        gameProgress.totalScore + (isCorrect ? gameStats.score : 0);
      const timeTaken = gameStats.endTime! - gameStats.startTime;

      await onUpdateProgress("sequence-sprint", {
        currentLevel: Math.min(newLevel, 100),
        bestLevel: Math.max(gameProgress.bestLevel, gameProgress.currentLevel),
        totalScore: newScore,
        bestTime: timeTaken
          ? Math.min(gameProgress.bestTime || Infinity, timeTaken)
          : gameProgress.bestTime,
        bestAccuracy: Math.max(
          gameProgress.bestAccuracy || 0,
          gameStats.accuracy
        ),
      });

      if (newLevel <= 100) {
        generateNewSequence();
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleGameOver = async () => {
    try {
      await onUpdateProgress("sequence-sprint", {
        currentLevel: 1,
        bestLevel: gameProgress.bestLevel,
        totalScore: gameProgress.totalScore,
        bestTime: gameProgress.bestTime,
        bestAccuracy: gameProgress.bestAccuracy,
      });

      generateNewSequence();
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  useEffect(() => {
    generateNewSequence();
  }, [gameProgress.currentLevel]);

  // Timer effect for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === "playing") {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStats.startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, gameStats.startTime]);

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
            {gameState === "playing" && (
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
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Sequence Sprint
            </h2>
            <p className="text-purple-200 text-lg">
              Find the pattern and predict the next number
            </p>

            {/* Enhanced Difficulty Info */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">
                  Length: {difficulty.sequenceLength}
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">
                  Complexity: {difficulty.complexity}/10
                </span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">
                  Pattern: {currentSequence?.type || "Loading..."}
                </span>
              </div>
            </div>
          </div>

          {currentSequence && (
            <div className="space-y-6">
              {/* Sequence Display */}
              <div className="text-center">
                <p className="text-purple-200 mb-4 text-lg">
                  What comes next in this sequence?
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
                  {currentSequence.numbers.map((num: number, index: number) => (
                    <div
                      key={index}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg transform hover:scale-105 transition-transform"
                    >
                      {num}
                    </div>
                  ))}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    ?
                  </div>
                </div>
              </div>

              {/* Game Stats */}
              {gameState === "playing" && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold">
                        {elapsedTime}s
                      </span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">Time</p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-white font-semibold">
                        {difficulty.complexity}
                      </span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">Difficulty</p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-semibold">
                        {currentSequence.numbers.length}
                      </span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">Length</p>
                  </div>
                </div>
              )}

              {/* Input Section */}
              {gameState === "playing" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the next number..."
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    />
                    <button
                      onClick={submitAnswer}
                      disabled={!userAnswer}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>

                  {/* Hint System */}
                  <div className="text-center">
                    {!showHint ? (
                      <button
                        onClick={getHint}
                        className="text-purple-300 hover:text-white transition-colors text-sm underline"
                      >
                        Need a hint? Click here
                      </button>
                    ) : (
                      <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-lg">
                        <p className="text-sm">💡 Hint: {hint}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Result Section */}
              {gameState === "result" && (
                <div className="text-center space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      isCorrect
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    <p className="text-xl font-semibold mb-2">{feedback}</p>
                    {isCorrect && (
                      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
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
                          <span className="font-semibold">
                            +{gameStats.score}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isCorrect ? (
                    gameProgress.currentLevel < 100 ? (
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
                          🏆 All Levels Complete!
                        </p>
                        <button
                          onClick={handleLevelComplete}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300"
                        >
                          <Trophy className="w-5 h-5" />
                          Return to Hub
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <p className="text-yellow-400 font-semibold">
                        Progress reset to Level 1
                      </p>
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SequenceSprint;
