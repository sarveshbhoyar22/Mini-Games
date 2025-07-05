import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import GameHub from "./components/GameHub";
import HigherLower from "./components/HigherLower";
import QuickCount from "./components/QuickCount";
import SequenceSprint from "./components/SequenceSprint";
import MemoryMatch from "./components/MemoryMatch";
import { useFirebase } from "./hooks/useFirebase";
import { GameType } from "./types/game";

function AppContent() {
  const [initializingUser, setInitializingUser] = useState(false);
  const [initError, setInitError] = useState<string | null>(null); // ✅ local error
  const {
    user,
    userProgress,
    leaderboards,
    globalLeaderboard,
    loading,
    error, // from firebase SDK init only
    initializeUser,
    updateUserProgress,
  } = useFirebase();
  const navigate = useNavigate();

  const handlePlayerNameSubmit = async (
    playerName: string,
    password?: string
  ) => {
    if (!user) return;
    setInitializingUser(true);
    setInitError(null); // ✅ clear local error
    try {
      await initializeUser(playerName, password); // make sure this doesn’t mutate global error
      navigate("/hub");
    } catch (err: any) {
      console.error("Failed to initialize user:", err);
      setInitError("Failed to initialize user. Please try again."); // ✅ set local error
    } finally {
      setInitializingUser(false);
    }
  };

  // 1. App is loading Firebase SDK/auth/user
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Game Hub...</p>
        </div>
      </div>
    );
  }

  // 2. Global Firebase error (auth/init failure)
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-green-500/50 rounded-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Let's Play</h2>
          {/* <p className="text-red-200 mb-4">{error}</p> */}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  // 3. User exists but has not initialized their profile
  if (user && !userProgress) {
    return (
      <Routes>
        <Route
          path="/welcome"
          element={
            <WelcomeScreen
              onPlayerNameSubmit={handlePlayerNameSubmit}
              loading={initializingUser}
              error={initError} // ✅ pass init error
            />
          }
        />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  // 4. Unauthenticated
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // 5. Authenticated + initialized user
  return (
    <Routes>
      <Route
        path="/hub"
        element={
          <GameHub
            onSelectGame={(game: GameType) => navigate(`/${game}`)}
            userProgress={userProgress}
            leaderboards={leaderboards}
            globalLeaderboard={globalLeaderboard}
          />
        }
      />
      <Route
        path="/higher-lower"
        element={
          <HigherLower
            onBack={() => navigate("/hub")}
            userProgress={userProgress}
            onUpdateProgress={updateUserProgress}
          />
        }
      />
      <Route
        path="/quick-count"
        element={
          <QuickCount
            onBack={() => navigate("/hub")}
            userProgress={userProgress}
            onUpdateProgress={updateUserProgress}
          />
        }
      />
      <Route
        path="/sequence-sprint"
        element={
          <SequenceSprint
            onBack={() => navigate("/hub")}
            userProgress={userProgress}
            onUpdateProgress={updateUserProgress}
          />
        }
      />
      <Route
        path="/memory-match"
        element={
          <MemoryMatch
            onBack={() => navigate("/hub")}
            userProgress={userProgress}
            onUpdateProgress={updateUserProgress}
          />
        }
      />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/hub" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
