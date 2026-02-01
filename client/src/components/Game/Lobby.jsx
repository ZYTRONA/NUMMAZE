import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import AnimeParticles from '../Effects/AnimeParticles';
import { getRandomQuote } from '../../utils/animeTheme';

const Lobby = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searching, setSearching] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [dailyQuote] = useState(getRandomQuote());

  useEffect(() => {
    socketService.on('lobby:searching', () => {
      setSearching(true);
    });

    socketService.on('lobby:match-found', ({ roomId }) => {
      setSearching(false);
      navigate(`/game/${roomId}`);
    });

    socketService.on('lobby:match-cancelled', () => {
      setSearching(false);
    });

    return () => {
      socketService.off('lobby:searching');
      socketService.off('lobby:match-found');
      socketService.off('lobby:match-cancelled');
    };
  }, [navigate]);

  const handleFindMatch = () => {
    socketService.findMatch();
  };

  const handleCancelMatch = () => {
    socketService.cancelFindMatch();
    setSearching(false);
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/game/${roomCode.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    navigate(`/game/${newRoomId}`);
  };

  return (
    <div className="min-h-screen p-4 relative">
      <AnimeParticles />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Anime Quote Banner */}
        <div className="card mb-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border-2 border-quantum-primary">
          <div className="text-center">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-lg font-semibold text-quantum-primary italic">"{dailyQuote}"</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-quantum-primary">
            TIC-TAC-TOE
          </h1>
          <div className="flex items-center space-x-4">
            <Link to="/tutorial" className="btn-secondary text-sm py-1 px-3 hover:bg-quantum-accent">
              ? Learn
            </Link>
            <Link to="/profile" className="text-quantum-primary font-semibold hover:underline">
              {user?.username} ({user?.points} pts)
            </Link>
            <button onClick={logout} className="btn-secondary text-sm py-1 px-4">
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Quick Start Guide */}
          <div className="card border-2 border-quantum-accent bg-quantum-accent bg-opacity-5">
            <h2 className="text-2xl font-bold mb-3 text-quantum-accent">QUICK START</h2>
            <ol className="space-y-2 text-sm text-quantum-ghost mb-4">
              <li><strong>1.</strong> Click "Quick Match" or create a room</li>
              <li><strong>2.</strong> Wait for opponent to join</li>
              <li><strong>3.</strong> Click on an empty cell (highlighted area)</li>
              <li><strong>4.</strong> Win 3 sub-grids in a row!</li>
            </ol>
            <Link to="/tutorial" className="btn-secondary text-sm">
              See Full Rules
            </Link>
          </div>

          {/* Stats */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">YOUR STATS</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{user?.stats?.wins || 0}</div>
                <div className="text-xs text-quantum-ghost mt-1">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-quantum-ghost">{user?.stats?.ties || 0}</div>
                <div className="text-xs text-quantum-ghost mt-1">Ties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{user?.stats?.losses || 0}</div>
                <div className="text-xs text-quantum-ghost mt-1">Losses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Match */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">Quick Match</h2>
            <p className="text-quantum-ghost mb-6">
              Find a random opponent and start playing
            </p>
            
            {!searching ? (
              <button onClick={handleFindMatch} className="btn-primary w-full">
                Find Match
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-primary"></div>
                </div>
                <p className="text-center text-quantum-primary mb-4 font-semibold">
                  Searching for opponent...
                </p>
                <button onClick={handleCancelMatch} className="btn-secondary w-full">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Create/Join Room */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Create or Join Room</h2>
            
            <div className="mb-6">
              <button onClick={handleCreateRoom} className="btn-primary w-full mb-4">
                Create Private Room
              </button>
              <p className="text-sm text-quantum-ghost text-center">
                Share the room code with a friend
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <label className="block text-sm font-semibold mb-2">Join with Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter room code"
                />
                <button onClick={handleJoinRoom} className="btn-secondary">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <Link to="/games" className="card text-center hover:shadow-neon transition-all">
            <h3 className="text-xl font-bold text-quantum-accent">ALL GAMES</h3>
            <p className="text-sm text-quantum-ghost mt-2">Try other games</p>
          </Link>
          
          <Link to="/leaderboard" className="card text-center hover:shadow-neon transition-all">
            <h3 className="text-xl font-bold text-quantum-primary">Leaderboard</h3>
            <p className="text-sm text-quantum-ghost mt-2">See top players</p>
          </Link>
          
          <Link to="/profile" className="card text-center hover:shadow-neon transition-all">
            <h3 className="text-xl font-bold text-quantum-secondary">Profile</h3>
            <p className="text-sm text-quantum-ghost mt-2">View your stats</p>
          </Link>
          
          <Link to="/tutorial" className="card text-center hover:shadow-neon transition-all">
            <h3 className="text-xl font-bold text-quantum-accent">Tutorial</h3>
            <p className="text-sm text-quantum-ghost mt-2">Learn how to play</p>
          </Link>
        </div>

        {/* User Info */}
        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Welcome, {user?.username}!</h3>
              <p className="text-quantum-ghost">Quantum ID: {user?.quantumId}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-quantum-primary">{user?.points}</div>
              <div className="text-sm text-quantum-ghost">Total Points</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{user?.stats?.wins || 0}</div>
              <div className="text-xs text-quantum-ghost">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quantum-ghost">{user?.stats?.ties || 0}</div>
              <div className="text-xs text-quantum-ghost">Ties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{user?.stats?.losses || 0}</div>
              <div className="text-xs text-quantum-ghost">Losses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
