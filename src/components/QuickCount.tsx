// Enhanced Quick Count game with visual noise and improved mechanics
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Eye, Play, RotateCcw, Star, Trophy, Clock, Target, Zap } from 'lucide-react';
import { UserProgress, GameStats } from '../types/game';
import { getDifficultyConfig } from '../utils/difficulty';

interface QuickCountProps {
  onBack: () => void;
  userProgress: UserProgress;
  onUpdateProgress: (gameId: string, updates: any) => Promise<void>;
}

type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon';

interface ShapeData {
  type: Shape;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  opacity: number;
}

const QuickCount: React.FC<QuickCountProps> = ({ onBack, userProgress, onUpdateProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameProgress = userProgress.games['quick-count'];
  const difficulty = getDifficultyConfig('quick-count', gameProgress.currentLevel);
  
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'guessing' | 'result'>('waiting');
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [targetShape, setTargetShape] = useState<Shape>('circle');
  const [correctCount, setCorrectCount] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({ startTime: 0, attempts: 0, accuracy: 0, score: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);

  const shapeNames = {
    circle: 'circles',
    square: 'squares',
    triangle: 'triangles',
    diamond: 'diamonds',
    star: 'stars',
    hexagon: 'hexagons'
  };

  // Enhanced color palette with similar colors for higher difficulty
  const getColors = () => {
    const level = gameProgress.currentLevel;
    const baseColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', 
      '#F97316', '#84CC16', '#EC4899', '#6366F1', '#14B8A6', '#F59E0B'
    ];
    
    // Add similar colors for higher levels to increase difficulty
    if (level > 50) {
      baseColors.push('#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2');
    }
    
    return baseColors.slice(0, difficulty.colorVariety || 3);
  };

  const generateShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newShapes: ShapeData[] = [];
    const shapeCount = difficulty.shapeCount || 15;
    const colors = getColors();
    const sizeVariation = difficulty.sizeVariation || 0;
    const overlapProbability = difficulty.overlapProbability || 0;

    // Available shape types (more types at higher levels)
    const availableShapes: Shape[] = ['circle', 'square', 'triangle'];
    if (gameProgress.currentLevel > 20) availableShapes.push('diamond');
    if (gameProgress.currentLevel > 40) availableShapes.push('star');
    if (gameProgress.currentLevel > 60) availableShapes.push('hexagon');

    for (let i = 0; i < shapeCount; i++) {
      const type = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      
      // Base size with variation
      const baseSize = 15;
      const sizeRange = baseSize * sizeVariation;
      const size = baseSize + (Math.random() - 0.5) * sizeRange;
      
      // Position with potential overlap
      let x, y;
      if (Math.random() < overlapProbability && newShapes.length > 0) {
        // Overlap with existing shape
        const existingShape = newShapes[Math.floor(Math.random() * newShapes.length)];
        x = existingShape.x + (Math.random() - 0.5) * 40;
        y = existingShape.y + (Math.random() - 0.5) * 40;
      } else {
        // Random position
        x = Math.random() * (canvas.width - 60) + 30;
        y = Math.random() * (canvas.height - 60) + 30;
      }
      
      newShapes.push({
        type,
        x: Math.max(30, Math.min(canvas.width - 30, x)),
        y: Math.max(30, Math.min(canvas.height - 30, y)),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        opacity: 0.7 + Math.random() * 0.3 // Slight opacity variation
      });
    }

    setShapes(newShapes);
    
    // Choose random target shape from available types
    const target = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    setTargetShape(target);
    
    // Count correct shapes
    const count = newShapes.filter(shape => shape.type === target).length;
    setCorrectCount(count);
  };

  const drawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
      ctx.save();
      ctx.globalAlpha = shape.opacity;
      ctx.fillStyle = shape.color;
      ctx.translate(shape.x, shape.y);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      
      ctx.beginPath();

      switch (shape.type) {
        case 'circle':
          ctx.arc(0, 0, shape.size, 0, 2 * Math.PI);
          break;
        case 'square':
          ctx.rect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
          break;
        case 'triangle':
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(-shape.size, shape.size);
          ctx.lineTo(shape.size, shape.size);
          ctx.closePath();
          break;
        case 'diamond':
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size, 0);
          ctx.lineTo(0, shape.size);
          ctx.lineTo(-shape.size, 0);
          ctx.closePath();
          break;
        case 'star':
          const spikes = 5;
          const outerRadius = shape.size;
          const innerRadius = shape.size * 0.5;
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        case 'hexagon':
          const sides = 6;
          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const x = Math.cos(angle) * shape.size;
            const y = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
      }

      ctx.fill();
      ctx.restore();
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startGame = () => {
    setGameState('showing');
    setUserGuess('');
    setShowLevelComplete(false);
    generateShapes();
    setTimeLeft(Math.floor((difficulty.displayTime || 4000) / 1000));
    setElapsedTime(0);
    setGameStats({
      startTime: Date.now(),
      attempts: 0,
      accuracy: 0,
      score: 0
    });
  };

  const submitGuess = () => {
    if (!userGuess || isNaN(Number(userGuess))) return;

    const guess = parseInt(userGuess);
    const correct = guess === correctCount;
    const endTime = Date.now();
    const timeTaken = endTime - gameStats.startTime;
    
    setIsCorrect(correct);
    setGameState('result');
    
    if (correct) {
      const accuracy = 100;
      const timeBonus = Math.max(0, 10000 - timeTaken) / 100; // Time bonus
      const levelBonus = gameProgress.currentLevel * 5;
      const score = Math.floor(100 + timeBonus + levelBonus);
      
      setGameStats(prev => ({
        ...prev,
        endTime,
        attempts: 1,
        accuracy,
        score
      }));
    } else {
      setGameStats(prev => ({
        ...prev,
        endTime,
        attempts: 1,
        accuracy: 0,
        score: 0
      }));
    }
  };

  const handleLevelComplete = async () => {
    try {
      const newLevel = gameProgress.currentLevel + 1;
      const newScore = gameProgress.totalScore + (isCorrect ? gameStats.score : 0);
      const timeTaken = gameStats.endTime! - gameStats.startTime;
      
      await onUpdateProgress('quick-count', {
        currentLevel: Math.min(newLevel, 100),
        bestLevel: Math.max(gameProgress.bestLevel, gameProgress.currentLevel),
        totalScore: newScore,
        bestTime: timeTaken ? Math.min(gameProgress.bestTime || Infinity, timeTaken) : gameProgress.bestTime,
        bestAccuracy: Math.max(gameProgress.bestAccuracy || 0, gameStats.accuracy)
      });
      
      if (newLevel <= 100) {
        setGameState('waiting');
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleGameOver = async () => {
    try {
      await onUpdateProgress('quick-count', {
        currentLevel: 1,
        bestLevel: gameProgress.bestLevel,
        totalScore: gameProgress.totalScore,
        bestTime: gameProgress.bestTime,
        bestAccuracy: gameProgress.bestAccuracy
      });
      
      setGameState('waiting');
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Timer effect for showing phase
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'showing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('guessing');
            clearCanvas(); // Clear the canvas when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, timeLeft]);

  // Elapsed time effect for overall game timing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'showing' || gameState === 'guessing') {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStats.startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, gameStats.startTime]);

  // Draw shapes when they're generated and game is showing
  useEffect(() => {
    if (gameState === 'showing' && shapes.length > 0) {
      drawShapes();
    }
  }, [gameState, shapes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
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
              <span className="text-white font-semibold">Level {gameProgress.currentLevel}/100</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Best: {gameProgress.bestLevel}</span>
            </div>
            {(gameState === 'showing' || gameState === 'guessing') && (
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
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Quick Count</h2>
            <p className="text-purple-200 text-lg">Count the shapes as quickly as you can!</p>
            
            {/* Enhanced Difficulty Info */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">Shapes: {difficulty.shapeCount}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">Time: {Math.floor((difficulty.displayTime || 4000) / 1000)}s</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">Colors: {difficulty.colorVariety}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-purple-200 text-sm">Complexity: {Math.round((difficulty.overlapProbability || 0) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="mb-6">
            <canvas
              ref={canvasRef}
              className="w-full h-80 bg-white/5 rounded-lg border border-white/10"
              style={{ maxHeight: '400px' }}
            />
          </div>

          {/* Game Controls */}
          <div className="space-y-4">
            {gameState === 'waiting' && (
              <div className="text-center">
                <p className="text-purple-200 mb-4">Ready to test your counting skills?</p>
                <button
                  onClick={startGame}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Start Level {gameProgress.currentLevel}
                </button>
              </div>
            )}

            {gameState === 'showing' && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold text-xl">
                    Memorize: {timeLeft}s
                  </span>
                </div>
                <p className="text-white text-lg font-semibold">
                  Study the shapes carefully!
                </p>
                
                {/* Live stats during memorization */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold">{shapes.length}</span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">Total Shapes</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-semibold">{difficulty.colorVariety}</span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">Colors</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      <span className="text-white font-semibold">{Object.keys(shapeNames).length}</span>
                    </div>
                    <p className="text-purple-200 text-xs mt-1">Shape Types</p>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'guessing' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-white text-xl font-semibold mb-4">
                    How many <span className="text-green-400">{shapeNames[targetShape]}</span> were there?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input
                      type="number"
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your count..."
                      min="0"
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    />
                    <button
                      onClick={submitGuess}
                      disabled={!userGuess}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'result' && (
              <div className="text-center space-y-4">
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <p className="text-xl font-semibold">
                    {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                  </p>
                  <p className="text-lg">
                    There were <span className="font-bold">{correctCount}</span> {shapeNames[targetShape]}
                  </p>
                  {isCorrect && (
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <span className="text-green-300">Time: </span>
                        <span className="font-semibold">{Math.floor((gameStats.endTime! - gameStats.startTime) / 1000)}s</span>
                      </div>
                      <div>
                        <span className="text-green-300">Score: </span>
                        <span className="font-semibold">+{gameStats.score}</span>
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
                      <p className="text-2xl font-bold text-yellow-400">🏆 All Levels Complete!</p>
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
                    <p className="text-yellow-400 font-semibold">Progress reset to Level 1</p>
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
        </div>
      </div>
    </div>
  );
};

export default QuickCount;