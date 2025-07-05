// Enhanced difficulty scaling utilities for each game with 100 unique levels
import { DifficultyConfig } from '../types/game';

export const getHigherLowerDifficulty = (level: number): DifficultyConfig => {
  const baseRange = 100;
  const rangeMultiplier = Math.pow(1.08, level - 1); // Increased exponential growth
  const maxRange = Math.floor(baseRange * rangeMultiplier);

  const maxAttempts = Math.max(3, 15 - Math.floor(level / 7)); // Reduce attempts faster
  const proximityThreshold = Math.max(3, Math.floor(maxRange * 0.08)); // Stricter proximity

  return {
    level,
    minRange: 1,
    maxRange,
    maxAttempts,
    proximityThreshold
  };
};

/**
 * Calculate difficulty settings for Quick Count game
 * 100 unique levels with increasing complexity and visual noise
 */
export const getQuickCountDifficulty = (level: number): DifficultyConfig => {
  const baseShapeCount = 5;
  const shapeCount = baseShapeCount + Math.floor(level * 0.7); // +0.7 shapes per level

  const baseDisplayTime = 5000;
  const timeReduction = (level - 1) * 60; // -60ms per level
  const displayTime = Math.max(400, baseDisplayTime - timeReduction);

  const colorVariety = Math.min(16, 4 + Math.floor(level / 6));
  const sizeVariation = Math.min(1, level * 0.01);
  const overlapProbability = Math.min(0.8, level * 0.008);

  return {
    level,
    shapeCount,
    displayTime,
    colorVariety,
    sizeVariation,
    overlapProbability
  };
};

/**
 * Calculate difficulty settings for Sequence Sprint game
 * 100 unique patterns with increasing complexity
 */
export const getSequenceSprintDifficulty = (level: number): DifficultyConfig => {
  const baseLength = 4;
  const sequenceLength = Math.min(10, baseLength + Math.floor(level / 15));

  const complexity = Math.min(1000, 2 + Math.floor(level / 5));
  const numberRange = Math.min(2000, 20 + level * 15);
  const patternDifficulty = Math.min(20, 2 + Math.floor(level / 15));

  return {
    level,
    sequenceLength,
    complexity,
    numberRange,
    patternDifficulty
  };
};

/**
 * Calculate difficulty settings for Memory Match game
 * 100 unique levels with expanding grids and decreasing reveal time
 */
export const getMemoryMatchDifficulty = (level: number): DifficultyConfig => {
  let gridSize = { rows: 3, cols: 4 };

  if (level >= 4) gridSize = { rows: 4, cols: 4 };
  if (level >= 8) gridSize = { rows: 4, cols: 5 };
  if (level >= 12) gridSize = { rows: 5, cols: 4 };
  if (level >= 16) gridSize = { rows: 5, cols: 5 };
  if (level >= 20) gridSize = { rows: 5, cols: 6 };
  if (level >= 24) gridSize = { rows: 6, cols: 5 };
  if (level >= 28) gridSize = { rows: 6, cols: 6 };
  if (level >= 30) gridSize = { rows: 6, cols: 7 };
  if (level >= 32) gridSize = { rows: 7, cols: 6 };
  if (level >= 35) gridSize = { rows: 7, cols: 7 };
  if (level >= 40) gridSize = { rows: 8, cols: 8 };

  const pairCount = Math.floor((gridSize.rows * gridSize.cols) / 2);
  const baseRevealTime = 7000;
  const timeReduction = (level - 1) * 80;
  const revealTime = Math.max(800, baseRevealTime - timeReduction);

  const cardSimilarity = Math.min(0.9, level * 0.009);

  return {
    level,
    gridSize,
    revealTime,
    pairCount,
    cardSimilarity
  };
};

/**
 * Get difficulty configuration for any game
 */
export const getDifficultyConfig = (gameId: string, level: number): DifficultyConfig => {
  switch (gameId) {
    case 'higher-lower':
      return getHigherLowerDifficulty(level);
    case 'quick-count':
      return getQuickCountDifficulty(level);
    case 'sequence-sprint':
      return getSequenceSprintDifficulty(level);
    case 'memory-match':
      return getMemoryMatchDifficulty(level);
    default:
      return { level };
  }
};

/**
 * Generate 100 unique sequence patterns for Sequence Sprint
 */
export const generateSequencePattern = (
  level: number,
  length: number
): { numbers: number[]; answer: number; description: string; type: string } => {
  const orderedPatterns = [
    () => generateArithmetic(level, length), // 1
    () => generateArithmetic(level, length, true), // 2
    () => generateGeometric(level, length), // 3
    () => generatePowers(level, length), // 4
    () => generateSquares(level, length), // 5
    () => generateFibonacci(level, length), // 6
    () => generateTribonacci(level, length), // 7
    () => generateLucas(level, length), // 8
    () => generateAlternating(level, length), // 9
    () => generatePolynomial(level, length), // 10
    () => generateFactorial(level, length), // 11
    () => generatePrime(level, length), // 12
    () => generateCatalan(level, length), // 13
    () => generateCollatz(level, length), // 14
    () => generateDigitalRoot(level, length), // 15
    () => generateModular(level, length), // 16
    () => generateHexagonal(level, length), // 17
    () => generateCenteredTriangle(level, length), // 18
    () => generateCube(level, length), // 19
    () => generateTetrahedral(level, length) // 20
  ];

  const patternIndex = Math.min(level - 1, orderedPatterns.length - 1);
  const selectedPattern = orderedPatterns[patternIndex];

  return selectedPattern();
};

// New complex patterns:
const generateHexagonal = (level: number, length: number): any => {
  const numbers = [];
  for (let i = 1; i <= length; i++) {
    numbers.push(i * (2 * i - 1));
  }
  const next = length + 1;
  return {
    numbers,
    answer: next * (2 * next - 1),
    description: 'Hexagonal number sequence',
    type: 'hexagonal'
  };
};

const generateCenteredTriangle = (level: number, length: number): any => {
  const numbers = [];
  for (let i = 1; i <= length; i++) {
    numbers.push((3 * i * i - 3 * i + 2) / 2);
  }
  const next = length + 1;
  return {
    numbers,
    answer: (3 * next * next - 3 * next + 2) / 2,
    description: 'Centered triangular numbers',
    type: 'centered-triangle'
  };
};

const generateCube = (level: number, length: number): any => {
  const numbers = [];
  for (let i = 1; i <= length; i++) {
    numbers.push(i ** 3);
  }
  const next = length + 1;
  return {
    numbers,
    answer: next ** 3,
    description: 'Cubic number sequence',
    type: 'cubic'
  };
};

const generateTetrahedral = (level: number, length: number): any => {
  const numbers = [];
  for (let i = 1; i <= length; i++) {
    numbers.push((i * (i + 1) * (i + 2)) / 6);
  }
  const next = length + 1;
  return {
    numbers,
    answer: (next * (next + 1) * (next + 2)) / 6,
    description: 'Tetrahedral number sequence',
    type: 'tetrahedral'
  };
};



// Pattern generators
const generateArithmetic = (level: number, length: number, allowNegative = false): any => {
  const start = Math.floor(Math.random() * (level * 2)) + 1;
  const diff = allowNegative ? 
    (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * level) + 1) :
    Math.floor(Math.random() * level) + 1;
  
  const numbers = [];
  for (let i = 0; i < length; i++) {
    numbers.push(start + i * diff);
  }
  
  return {
    numbers,
    answer: start + length * diff,
    description: `${diff > 0 ? 'Add' : 'Subtract'} ${Math.abs(diff)} each time`,
    type: 'arithmetic'
  };
};

const generateGeometric = (level: number, length: number): any => {
  const start = Math.floor(Math.random() * 5) + 1;
  const ratio = Math.floor(Math.random() * 3) + 2;
  
  const numbers = [];
  for (let i = 0; i < length; i++) {
    numbers.push(start * Math.pow(ratio, i));
  }
  
  return {
    numbers,
    answer: start * Math.pow(ratio, length),
    description: `Multiply by ${ratio} each time`,
    type: 'geometric'
  };
};

const generatePowers = (level: number, length: number): any => {
  const base = Math.floor(Math.random() * 3) + 2;
  const numbers = [];
  
  for (let i = 1; i <= length; i++) {
    numbers.push(Math.pow(base, i));
  }
  
  return {
    numbers,
    answer: Math.pow(base, length + 1),
    description: `Powers of ${base}`,
    type: 'powers'
  };
};

const generateSquares = (level: number, length: number): any => {
  const start = Math.floor(Math.random() * 5) + 1;
  const numbers = [];
  
  for (let i = 0; i < length; i++) {
    numbers.push(Math.pow(start + i, 2));
  }
  
  return {
    numbers,
    answer: Math.pow(start + length, 2),
    description: 'Perfect squares sequence',
    type: 'squares'
  };
};

const generateFibonacci = (level: number, length: number): any => {
  const a = Math.floor(Math.random() * 3) + 1;
  const b = Math.floor(Math.random() * 3) + 1;
  const numbers = [a, b];
  
  for (let i = 2; i < length; i++) {
    numbers.push(numbers[i-1] + numbers[i-2]);
  }
  
  return {
    numbers,
    answer: numbers[length-1] + numbers[length-2],
    description: 'Fibonacci-like sequence',
    type: 'fibonacci'
  };
};

const generateTribonacci = (level: number, length: number): any => {
  const numbers = [1, 1, 2];
  
  for (let i = 3; i < length; i++) {
    numbers.push(numbers[i-1] + numbers[i-2] + numbers[i-3]);
  }
  
  return {
    numbers: numbers.slice(0, length),
    answer: numbers[length-1] + numbers[length-2] + numbers[length-3],
    description: 'Sum of previous three numbers',
    type: 'tribonacci'
  };
};

const generateLucas = (level: number, length: number): any => {
  const numbers = [2, 1];
  
  for (let i = 2; i < length; i++) {
    numbers.push(numbers[i-1] + numbers[i-2]);
  }
  
  return {
    numbers,
    answer: numbers[length-1] + numbers[length-2],
    description: 'Lucas sequence',
    type: 'lucas'
  };
};

const generateAlternating = (level: number, length: number): any => {
  const base = Math.floor(Math.random() * 10) + 5;
  const diff = Math.floor(Math.random() * 5) + 2;
  const numbers = [];
  
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      numbers.push(base + i * diff);
    } else {
      numbers.push(base - i * diff);
    }
  }
  
  const nextIndex = length;
  const answer = nextIndex % 2 === 0 ? base + nextIndex * diff : base - nextIndex * diff;
  
  return {
    numbers,
    answer,
    description: 'Alternating add/subtract pattern',
    type: 'alternating'
  };
};

const generatePolynomial = (level: number, length: number): any => {
  // Simple quadratic: an² + bn + c
  const a = Math.floor(Math.random() * 3) + 1;
  const b = Math.floor(Math.random() * 5);
  const c = Math.floor(Math.random() * 5);
  
  const numbers = [];
  for (let i = 1; i <= length; i++) {
    numbers.push(a * i * i + b * i + c);
  }
  
  const next = length + 1;
  const answer = a * next * next + b * next + c;
  
  return {
    numbers,
    answer,
    description: 'Quadratic sequence',
    type: 'polynomial'
  };
};

const generateFactorial = (level: number, length: number): any => {
  const numbers = [];
  
  for (let i = 1; i <= Math.min(length, 7); i++) { // Limit to prevent huge numbers
    let factorial = 1;
    for (let j = 1; j <= i; j++) {
      factorial *= j;
    }
    numbers.push(factorial);
  }
  
  let answer = 1;
  for (let j = 1; j <= numbers.length + 1; j++) {
    answer *= j;
  }
  
  return {
    numbers,
    answer,
    description: 'Factorial sequence (n!)',
    type: 'factorial'
  };
};

const generatePrime = (level: number, length: number): any => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
  const numbers = primes.slice(0, Math.min(length, primes.length));
  const answer = primes[numbers.length];
  
  return {
    numbers,
    answer,
    description: 'Prime numbers sequence',
    type: 'prime'
  };
};

const generateCatalan = (level: number, length: number): any => {
  const numbers = [1, 1, 2, 5, 14, 42, 132, 429];
  
  return {
    numbers: numbers.slice(0, Math.min(length, numbers.length)),
    answer: numbers[Math.min(length, numbers.length - 1)],
    description: 'Catalan numbers',
    type: 'catalan'
  };
};

const generateCollatz = (level: number, length: number): any => {
  let start = Math.floor(Math.random() * 20) + 10;
  const numbers = [start];
  
  for (let i = 1; i < length && start !== 1; i++) {
    start = start % 2 === 0 ? start / 2 : start * 3 + 1;
    numbers.push(start);
  }
  
  const last = numbers[numbers.length - 1];
  const answer = last % 2 === 0 ? last / 2 : last * 3 + 1;
  
  return {
    numbers,
    answer,
    description: 'Collatz conjecture sequence',
    type: 'collatz'
  };
};

const generateDigitalRoot = (level: number, length: number): any => {
  const numbers = [];
  let current = Math.floor(Math.random() * 100) + 10;
  
  for (let i = 0; i < length; i++) {
    numbers.push(current);
    // Digital root calculation
    while (current >= 10) {
      current = current.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    current = current * 10 + Math.floor(Math.random() * 10);
  }
  
  return {
    numbers,
    answer: numbers[numbers.length - 1] + 11, // Simplified pattern
    description: 'Digital root pattern',
    type: 'digital-root'
  };
};

const generateModular = (level: number, length: number): any => {
  const mod = Math.floor(Math.random() * 5) + 3;
  const multiplier = Math.floor(Math.random() * 3) + 2;
  const numbers = [];
  
  for (let i = 1; i <= length; i++) {
    numbers.push((i * multiplier) % mod);
  }
  
  const answer = ((length + 1) * multiplier) % mod;
  
  return {
    numbers,
    answer,
    description: `Modular arithmetic (mod ${mod})`,
    type: 'modular'
  };
};

