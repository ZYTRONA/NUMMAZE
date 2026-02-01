import React from 'react';
import { Link } from 'react-router-dom';

const Tutorial = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-quantum-primary">How to Play</h1>
          <div className="flex gap-2">
            <Link to="/tutorial/interactive" className="btn-primary text-sm py-2 px-4">
              Play Tutorial
            </Link>
            <Link to="/lobby" className="btn-secondary text-sm py-2 px-4">
              Back to Lobby
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Rules */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">HOW TO PLAY</h2>
            <p className="text-gray-300 mb-4">
              Tic-Tac-Toe is a simple game played on a <strong>3×3 grid</strong>. 
              Two players take turns marking spaces. One player uses <strong className="text-quantum-purple">X</strong> and the other uses <strong className="text-quantum-secondary">O</strong>.
            </p>
            <div className="bg-quantum-darker bg-opacity-50 p-4 rounded-lg">
              <p className="text-quantum-secondary font-semibold">
                Goal: Get three of your marks in a row (horizontal, vertical, or diagonal) to win!
              </p>
            </div>
          </div>

          {/* How to Play */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">RULES</h2>
            <ol className="space-y-4">
              <li className="flex">
                <span className="text-quantum-primary font-bold mr-3">1.</span>
                <div>
                  <strong>Player X goes first</strong> and can click any empty cell on the grid.
                </div>
              </li>
              <li className="flex">
                <span className="text-quantum-primary font-bold mr-3">2.</span>
                <div>
                  <strong>Players alternate turns</strong>, clicking on empty cells to place their mark.
                </div>
              </li>
              <li className="flex">
                <span className="text-quantum-primary font-bold mr-3">3.</span>
                <div>
                  <strong>Win by getting 3 in a row</strong> - horizontally, vertically, or diagonally.
                </div>
              </li>
              <li className="flex">
                <span className="text-quantum-primary font-bold mr-3">4.</span>
                <div>
                  <strong>Game ends in a tie</strong> if all 9 cells are filled with no winner.
                </div>
              </li>
            </ol>
          </div>

          {/* Strategy Tips */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">STRATEGY TIPS</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-quantum-secondary mr-3">⚡</span>
                <div>
                  <strong>Control the center:</strong> The center cell is part of 4 winning lines!
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-quantum-secondary mr-3">🎯</span>
                <div>
                  <strong>Create double threats:</strong> Set up two ways to win on your next turn.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-quantum-secondary mr-3">🛡️</span>
                <div>
                  <strong>Block your opponent:</strong> Watch for their potential winning moves!
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-quantum-secondary mr-3">⚔️</span>
                <div>
                  <strong>Corners are strong:</strong> Each corner is part of 3 winning lines.
                </div>
              </li>
            </ul>
          </div>

          {/* Visual Guide */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">👀 Visual Guide</h2>
            <div className="bg-quantum-darker bg-opacity-50 p-6 rounded-lg">
              <h3 className="font-bold mb-3 text-center">3×3 Grid</h3>
              <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto">
                {[0,1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="aspect-square bg-quantum-primary bg-opacity-20 rounded flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                ))}
              </div>
              <p className="text-sm text-quantum-ghost text-center">
                Click any empty cell to place your mark. Get 3 in a row to win!
              </p>
            </div>
          </div>

          {/* Scoring */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-quantum-primary">🏆 Scoring System</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">+10</div>
                <div className="text-sm text-quantum-ghost">Win</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-quantum-ghost mb-2">+2</div>
                <div className="text-sm text-quantum-ghost">Tie</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-400 mb-2">-5</div>
                <div className="text-sm text-quantum-ghost">Loss</div>
              </div>
            </div>
          </div>

          {/* Ready to Play */}
          <div className="card text-center bg-gradient-to-r from-quantum-primary to-quantum-secondary bg-opacity-10">
            <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-gray-300 mb-6">
              Now that you know the rules, jump into a game and start climbing the leaderboard!
            </p>
            <Link to="/lobby" className="btn-primary inline-block">
              Go to Lobby
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
