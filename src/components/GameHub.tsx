// Enhanced Game Hub with improved leaderboards and statistics
import React from "react";
import {
  Play,
  Target,
  Eye,
  Brain,
  Zap,
  Trophy,
  Crown,
  Star,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  GameType,
  UserProgress,
  LeaderboardEntry,
  GlobalLeaderboardEntry,
} from "../types/game";

interface GameHubProps {
  onSelectGame: (game: GameType) => void;
  userProgress: UserProgress;
  leaderboards: { [key: string]: LeaderboardEntry[] };
  globalLeaderboard: GlobalLeaderboardEntry[];
}

const GameHub: React.FC<GameHubProps> = ({
  onSelectGame,
  userProgress,
  leaderboards,
  globalLeaderboard,
}) => {
  const games = [
    {
      id: "higher-lower" as GameType,
      title: "Higher or Lower",
      description:
        "Guess the mystery number with progressive difficulty and proximity hints",
      icon: Target,
      color: "from-red-500 to-orange-500",
      hoverColor: "hover:from-red-600 hover:to-orange-600",
      progress: userProgress.games["higher-lower"],
      metric: "Best Attempts",
      metricValue: userProgress.games["higher-lower"].bestAttempts || "N/A",
    },
    {
      id: "quick-count" as GameType,
      title: "Quick Count",
      description:
        "Count shapes in a flash with increasing complexity and visual noise",
      icon: Eye,
      color: "from-green-500 to-teal-500",
      hoverColor: "hover:from-green-600 hover:to-teal-600",
      progress: userProgress.games["quick-count"],
      metric: "Best Time",
      metricValue: userProgress.games["quick-count"].bestTime
        ? `${Math.floor(userProgress.games["quick-count"].bestTime! / 1000)}s`
        : "N/A",
    },
    {
      id: "sequence-sprint" as GameType,
      title: "Sequence Sprint",
      description:
        "Solve 100 unique mathematical patterns of growing complexity",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      hoverColor: "hover:from-purple-600 hover:to-pink-600",
      progress: userProgress.games["sequence-sprint"],
      metric: "Best Accuracy",
      metricValue: userProgress.games["sequence-sprint"].bestAccuracy
        ? `${Math.round(userProgress.games["sequence-sprint"].bestAccuracy!)}%`
        : "N/A",
    },
    {
      id: "memory-match" as GameType,
      title: "Memory Match Mania",
      description:
        "Match pairs with expanding grids and decreasing preview time",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      hoverColor: "hover:from-blue-600 hover:to-cyan-600",
      progress: userProgress.games["memory-match"],
      metric: "Best Moves",
      metricValue: userProgress.games["memory-match"].bestAttempts || "N/A",
    },
  ];

  const totalLevels = Object.values(userProgress.games).reduce(
    (sum, game) => sum + game.currentLevel,
    0
  );
  const totalScore = Object.values(userProgress.games).reduce(
    (sum, game) => sum + game.totalScore,
    0
  );
  const averageLevel = Math.round(totalLevels / 4);
  const completedGames = Object.values(userProgress.games).filter(
    (game) => game.bestLevel >= 100
  ).length;

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/icon.svg" alt="" className="w-20 h-20" />

            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-500 to-blue-600 mb-2 ">
              Mini-Games
            </h1>
          </div>

          {/* Enhanced Player Info */}
          <div className="mb-6">
            <h2 className="text-2xl text-purple-200 mb-4">
              Welcome back,{" "}
              <span className="text-white font-semibold">
                {userProgress.playerName}
              </span>
              !
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-semibold">
                    {totalLevels}
                  </span>
                </div>
                <p className="text-purple-200 text-xs">Total Levels</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-semibold">{totalScore}</span>
                </div>
                <p className="text-purple-200 text-xs">Total Score</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-white font-semibold">
                    {averageLevel}
                  </span>
                </div>
                <p className="text-purple-200 text-xs">Avg Level</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-semibold">
                    {completedGames}/4
                  </span>
                </div>
                <p className="text-purple-200 text-xs">Completed</p>
              </div>
            </div>
          </div>

          {/* User ID Display */}
          <div className="mb-6">
            <p className="text-purple-300 text-sm">
              Player ID:{" "}
              <span className="font-mono bg-white/10 px-2 py-1 rounded">
                {userProgress.userId}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Games Grid */}
          <div className="xl:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6" />
              Choose Your Challenge
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game) => {
                const IconComponent = game.icon;
                const progress = game.progress;
                const progressPercentage = (progress.bestLevel / 100) * 100;

                return (
                  <div
                    key={game.id}
                    onClick={() => onSelectGame(game.id)}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all duration-300`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>

                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {game.title}
                      </h4>

                      <p className="text-purple-200 text-sm mb-4 leading-relaxed">
                        {game.description}
                      </p>

                      {/* Enhanced Progress Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">
                            Current Level:
                          </span>
                          <span className="text-white font-semibold">
                            {progress.currentLevel}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Best Level:</span>
                          <span className="text-green-400 font-semibold">
                            {progress.bestLevel}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">
                            {game.metric}:
                          </span>
                          <span className="text-blue-400 font-semibold">
                            {game.metricValue}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 bg-gradient-to-r ${game.color} rounded-full transition-all duration-300`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>

                        {/* Completion Badge */}
                        {progress.bestLevel >= 100 && (
                          <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <Crown className="w-4 h-4" />
                            <span className="font-semibold">COMPLETED!</span>
                          </div>
                        )}
                      </div>

                      <div
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${game.color} ${game.hoverColor} text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 group-hover:shadow-lg`}
                      >
                        <Play className="w-4 h-4" />
                        {progress.bestLevel >= 100
                          ? "Play Again"
                          : `Play Level ${progress.currentLevel}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Leaderboards */}
          <div className="space-y-6">
            {/* Global Leaderboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Global Champions
              </h3>

              <div className="space-y-3">
                {globalLeaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-white/20 text-purple-200"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {entry.playerName}
                        {entry.userId === userProgress.userId && (
                          <span className="text-green-400 ml-1">(You)</span>
                        )}
                      </p>
                      <div className="flex gap-4 text-purple-300 text-xs">
                        <span>Score: {entry.totalScore}</span>
                        <span>Avg: {entry.averageLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {globalLeaderboard.length === 0 && (
                  <p className="text-purple-300 text-center py-4">
                    No players yet. Be the first!
                  </p>
                )}
              </div>
            </div>

            {/* Individual Game Leaderboards */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Game Leaders
              </h3>

              <div className="space-y-4">
                {games.map((game) => {
                  const gameLeaderboard = leaderboards[game.id] || [];
                  const topPlayer = gameLeaderboard[0];
                  const userRank =
                    gameLeaderboard.findIndex(
                      (p) => p.userId === userProgress.userId
                    ) + 1;

                  return (
                    <div key={game.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <game.icon className="w-4 h-4 text-purple-300" />
                        <span className="text-white font-semibold text-sm">
                          {game.title}
                        </span>
                      </div>

                      {topPlayer ? (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-200 text-sm truncate">
                              👑 {topPlayer.playerName}
                              {topPlayer.userId === userProgress.userId && (
                                <span className="text-green-400 ml-1">
                                  (You)
                                </span>
                              )}
                            </span>
                            <span className="text-yellow-400 text-sm font-semibold">
                              Lv.{topPlayer.bestLevel}
                            </span>
                          </div>

                          {userRank > 1 && userRank <= 10 && (
                            <div className="text-xs text-purple-300">
                              Your rank: #{userRank}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-purple-300 text-sm">
                          No players yet
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Your Progress
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-200">Games Started:</span>
                  <span className="text-white font-semibold">4/4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Games Completed:</span>
                  <span className="text-green-400 font-semibold">
                    {completedGames}/4
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Total Progress:</span>
                  <span className="text-blue-400 font-semibold">
                    {Math.round((totalLevels / 400) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(totalLevels / 400) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
