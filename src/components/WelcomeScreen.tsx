import React, { useState } from "react";
import { Play, User } from "lucide-react";
// import { signInWithGoogle } from "./config"; // Adjust the import path as needed
import { signInWithGoogle } from "../firebase/config";
interface WelcomeScreenProps {
  onPlayerNameSubmit: (name: string) => void;
  loading?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPlayerNameSubmit,
  loading,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (playerName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (playerName.trim().length > 20) {
      setError("Name must be less than 20 characters");
      return;
    }

    setError("");
    onPlayerNameSubmit(playerName.trim());
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const user = await signInWithGoogle();
      onPlayerNameSubmit(user.displayName || user.email || "Player");
    } catch (err) {
      setError("Google sign-in failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-black flex items-center justify-center">
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md border border-white rounded-2xl w-full">
          <div className=" backdrop-blur-sm rounded-2xl p-8 border border-white sm:border-none text-center">
            {/* Logo */}

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-2 ">
              <img src="/icon.svg" alt="" className="w-20 h-20 mx-auto mb-4" />
              Mini-Games
            </h1>
            <p className="text-purple-200 text-lg mb-8 leading-relaxed">
              Challenge yourself with our collection of brain-teasing
              mini-games. Progress through 100 levels in each game and compete
              on the leaderboards!
            </p>
            {/* Name Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                {/* <label
                htmlFor="playerName"
                className="block text-white font-semibold text-left"
              >
                Enter Your Name
              </label> */}
                {/* <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your gaming name..."
                  maxLength={20}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div> */}
                {/* {error && (
                <p className="text-red-400 text-sm text-left">{error}</p>
              )} */}
              </div>
              {/* <button
              type="submit"
              disabled={loading || !playerName.trim()}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up your profile...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Gaming
                </>
              )}
            </button> */}
            </form>
            <div className="mt-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
                ) : (
                  <>
                    {/* Google icon SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <g>
                        <path
                          fill="#4285F4"
                          d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.6 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c10.5 0 19.5-8.5 19.5-19.5 0-1.3-.1-2.2-.3-3z"
                        />
                        <path
                          fill="#34A853"
                          d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13.5 24 13.5c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.6 4.5 24 4.5c-7.2 0-13.3 4.1-16.7 10.2z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M24 45.5c5.6 0 10.5-1.9 14.3-5.2l-6.6-5.4c-2.1 1.4-4.8 2.1-7.7 2.1-6.1 0-11.2-4.1-13-9.6l-7 5.4C6.7 41.1 14.7 45.5 24 45.5z"
                        />
                        <path
                          fill="#EA4335"
                          d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-6.1 0-11.2-4.1-13-9.6l-7 5.4C6.7 41.1 14.7 45.5 24 45.5c10.5 0 19.5-8.5 19.5-19.5 0-1.3-.1-2.2-.3-3z"
                        />
                      </g>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </div>

            {/* Features List */}
            <div className="mt-8 text-left space-y-2">
              <h3 className="text-white font-semibold mb-3">
                What awaits you:
              </h3>
              <div className="space-y-2 text-purple-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span>4 unique mini-games with 100 levels each</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>Progressive difficulty scaling</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Real-time leaderboards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span>Personal progress tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
