import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Lobby from './components/Game/Lobby';
import GameRoom from './components/Game/GameRoom';
import Profile from './components/Social/Profile';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Tutorial from './components/Tutorial/Tutorial';
import InteractiveTutorial from './components/Tutorial/InteractiveTutorial';
import GamesMenu from './components/Games/GamesMenu';
import GamePong from './components/Games/GamePong';
import GameSnake from './components/Games/GameSnake';
import GameMemory from './components/Games/GameMemory';
import GameFlappy from './components/Games/GameFlappy';
import GameWordle from './components/Games/GameWordle';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <div className="min-h-screen bg-gradient-to-br from-quantum-dark to-quantum-darker">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/tutorial/interactive" element={
                <PrivateRoute>
                  <InteractiveTutorial />
                </PrivateRoute>
              } />
              
              <Route path="/games" element={
                <PrivateRoute>
                  <GamesMenu />
                </PrivateRoute>
              } />
              
              <Route path="/game/pong" element={
                <PrivateRoute>
                  <GamePong />
                </PrivateRoute>
              } />
              
              <Route path="/game/snake" element={
                <PrivateRoute>
                  <GameSnake />
                </PrivateRoute>
              } />
              
              <Route path="/game/memory" element={
                <PrivateRoute>
                  <GameMemory />
                </PrivateRoute>
              } />
              
              <Route path="/game/flappy" element={
                <PrivateRoute>
                  <GameFlappy />
                </PrivateRoute>
              } />
              
              <Route path="/game/wordle" element={
                <PrivateRoute>
                  <GameWordle />
                </PrivateRoute>
              } />
              
              <Route path="/lobby" element={
                <PrivateRoute>
                  <Lobby />
                </PrivateRoute>
              } />
              
              <Route path="/game/:roomId" element={
                <PrivateRoute>
                  <GameRoom />
                </PrivateRoute>
              } />
              
              <Route path="/profile/:userId?" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/leaderboard" element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              } />
              
              <Route path="/" element={<Navigate to="/lobby" replace />} />
            </Routes>
          </div>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
