import React, { useState, useEffect } from "react";
import { ArrowLeft, Zap, Star, Trophy } from "lucide-react";
import { UserProgress, GameStats } from "../types/game";

interface MemoryMatchProps {
  onBack: () => void;
  userProgress: UserProgress;
  onUpdateProgress: (gameId: string, updates: any) => Promise<void>;
}

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const symbolPool = [
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🍓",
  "🍒",
  "🍑",
  "🥝",
  "🍍",
  "🥥",
  "🍆",
  "🥕",
  "🌽",
  "🌶️",
  "🧄",
  "🧅",
  "🥔",
  "🥦",
  "🥬",
  "🥒",
  "🫑",
  "🍅",
  "🍋",
  "🥭",
  "🫐",
  "🍏",
  "🍈",
  "🥜",
  "🌰",
  "🥖",
  "🥐",
  "🍞",
  "🧀",
  "🍗",
  "🍖",
  "🍤",
  "🍣",
  "🍕",
  "🍔",
  "🌭",
  "🍟",
  "🥪",
  "🍿",
  "🍩",
  "🍪",
  "🍰",
  "🎂",
  "🍫",
  "🍬",
  "🍭",
  "🍼",
];

// ✅ Dynamically increase grid by level (max 6x6)
const getDifficultyConfig = (level: number) => {
  const totalCards = Math.min(4 + (level - 1) * 2, 36); // max 36 (6x6)
  let rows = Math.floor(Math.sqrt(totalCards));
  let cols = Math.ceil(totalCards / rows);

  while (rows * cols < totalCards) {
    cols++;
  }

  const pairs = Math.floor((rows * cols) / 2);
  return { rows, cols, pairs };
};

const MemoryMatch: React.FC<MemoryMatchProps> = ({
  onBack,
  userProgress,
  onUpdateProgress,
}) => {
  const level = userProgress.games["memory-match"].currentLevel;
  const { rows, cols, pairs } = getDifficultyConfig(level);

  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);
  const [gameStats, setGameStats] = useState<GameStats>({
    startTime: 0,
    accuracy: 0,
    attempts: 0,
    score: 0,
  });

  const initializeGame = () => {
    const symbols = symbolPool.slice(0, pairs);
    const cards: Card[] = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, i) => ({
        id: i,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(cards);
    setFlipped([]);
    setMatches(0);
    setMoves(0);
    setGameStarted(true);
    setGameWon(false);
    setShowPreview(true);
    setTimeLeft(5);
    setGameStats({
      startTime: Date.now(),
      accuracy: 0,
      attempts: 0,
      score: 0,
    });
  };

  useEffect(() => {
    if (!gameStarted) return;
    if (showPreview && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [timeLeft, showPreview, gameStarted]);

  useEffect(() => {
    if (matches === pairs) {
      const endTime = Date.now();
      const timeTaken = (endTime - gameStats.startTime) / 1000;
      const accuracy = (pairs / moves) * 100;
      const score = Math.max(100, Math.floor(accuracy + (60 - timeTaken)));

      setGameWon(true);
      setGameStats((prev) => ({
        ...prev,
        attempts: moves,
        accuracy,
        score,
      }));
    }
  }, [matches, moves]);

  const flipCard = (id: number) => {
    if (showPreview || gameWon || flipped.length >= 2) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const updated = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(updated);

    const newFlipped = [...flipped, { ...card, isFlipped: true }];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;

      setTimeout(() => {
        if (a.symbol === b.symbol) {
          setCards((prev) =>
            prev.map((c) =>
              c.symbol === a.symbol ? { ...c, isMatched: true } : c
            )
          );
          setMatches((prev) => prev + 1);
        } else {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a.id || c.id === b.id ? { ...c, isFlipped: false } : c
            )
          );
        }
        setFlipped([]);
      }, 800);
    }
  };

  const handleNextLevel = async () => {
    const progress = userProgress.games["memory-match"];
    const newLevel = Math.min(progress.currentLevel + 1, 100);
    const newScore = progress.totalScore + gameStats.score;

    await onUpdateProgress("memory-match", {
      currentLevel: newLevel,
      bestLevel: Math.max(progress.bestLevel, progress.currentLevel),
      totalScore: newScore,
      bestAttempts: Math.min(progress.bestAttempts || Infinity, moves),
      bestAccuracy: Math.max(progress.bestAccuracy || 0, gameStats.accuracy),
      bestTime: Math.min(
        progress.bestTime || Infinity,
        Date.now() - gameStats.startTime
      ),
    });

    setGameStarted(false);
  };

  const cardSize = `calc(min(12vw, ${(90 / rows).toFixed(2)}vh))`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
        <div className="flex justify-between items-center w-full mb-4">
          <button
            onClick={onBack}
            className="text-purple-300 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Hub
          </button>
          <div className="flex gap-3">
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
              <Star className="inline w-4 h-4 mr-1 text-yellow-400" />
              Level {level}/100
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
              <Trophy className="inline w-4 h-4 mr-1 text-yellow-400" />
              Best: {userProgress.games["memory-match"].bestLevel}
            </span>
          </div>
        </div>

        {!gameStarted ? (
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Memory Match</h2>
            <p className="text-purple-200">
              Memorize cards and find all matching pairs.
            </p>
            <button
              onClick={initializeGame}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold"
            >
              <Zap className="inline w-5 h-5 mr-2" />
              Start Level {level}
            </button>
          </div>
        ) : (
          <>
            {showPreview && (
              <div className="text-center mb-3">
                <p className="text-yellow-400 text-lg">Memorize: {timeLeft}s</p>
              </div>
            )}

            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cardSize})`,
                gridTemplateRows: `repeat(${rows}, ${cardSize})`,
              }}
            >
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`flex items-center justify-center rounded-md border-2 font-bold select-none cursor-pointer transition-all
                    ${
                      card.isFlipped || card.isMatched || showPreview
                        ? "bg-white text-black"
                        : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                    }`}
                  onClick={() => flipCard(card.id)}
                  style={{
                    width: cardSize,
                    height: cardSize,
                    fontSize: `calc(${cardSize} * 0.5)`,
                  }}
                >
                  {card.isFlipped || card.isMatched || showPreview
                    ? card.symbol
                    : "?"}
                </div>
              ))}
            </div>

            {gameWon && (
              <div className="text-center mt-6 space-y-2">
                <h3 className="text-green-400 text-xl font-bold">
                  🎉 Level Complete!
                </h3>
                <p>
                  Moves: {moves}, Accuracy: {Math.round(gameStats.accuracy)}%,
                  Score: {gameStats.score}
                </p>
                <button
                  onClick={handleNextLevel}
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold"
                >
                  Continue to Level {level + 1}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
