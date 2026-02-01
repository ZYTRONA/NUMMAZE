import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Game2048 = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Initialize board
  const initBoard = useCallback(() => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initBoard();
    const saved = localStorage.getItem('best2048');
    if (saved) setBestScore(parseInt(saved));
  }, [initBoard]);

  const addRandomTile = (board) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = useCallback((direction) => {
    if (gameOver) return;

    const newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const moveLeft = () => {
      for (let i = 0; i < 4; i++) {
        const row = newBoard[i].filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            newScore += row[j];
            row.splice(j + 1, 1);
            if (row[j] === 2048 && !won) setWon(true);
          }
        }
        while (row.length < 4) row.push(0);
        if (JSON.stringify(newBoard[i]) !== JSON.stringify(row)) moved = true;
        newBoard[i] = row;
      }
    };

    const rotate = () => {
      const rotated = Array(4).fill(null).map(() => Array(4).fill(0));
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          rotated[j][3 - i] = newBoard[i][j];
        }
      }
      return rotated;
    };

    if (direction === 'left') {
      moveLeft();
    } else if (direction === 'right') {
      newBoard.splice(0, 4, ...rotate());
      newBoard.splice(0, 4, ...rotate());
      moveLeft();
      newBoard.splice(0, 4, ...rotate());
      newBoard.splice(0, 4, ...rotate());
    } else if (direction === 'up') {
      newBoard.splice(0, 4, ...rotate());
      newBoard.splice(0, 4, ...rotate());
      newBoard.splice(0, 4, ...rotate());
      moveLeft();
      newBoard.splice(0, 4, ...rotate());
    } else if (direction === 'down') {
      newBoard.splice(0, 4, ...rotate());
      moveLeft();
      newBoard.splice(0, 4, ...rotate());
      newBoard.splice(0, 4, ...rotate());
      newBoard.splice(0, 4, ...rotate());
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('best2048', newScore.toString());
      }
      
      // Check game over
      if (!canMove(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, score, gameOver, won, bestScore]);

  const canMove = (board) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true;
        if (j < 3 && board[i][j] === board[i][j + 1]) return true;
        if (i < 3 && board[i][j] === board[i + 1][j]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  const getTileColor = (value) => {
    const colors = {
      0: 'bg-gray-700',
      2: 'bg-pink-400',
      4: 'bg-pink-500',
      8: 'bg-purple-400',
      16: 'bg-purple-500',
      32: 'bg-blue-400',
      64: 'bg-blue-500',
      128: 'bg-cyan-400',
      256: 'bg-cyan-500',
      512: 'bg-green-400',
      1024: 'bg-yellow-400',
      2048: 'bg-red-500'
    };
    return colors[value] || 'bg-quantum-accent';
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-quantum-primary">🎮 2048</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowTutorial(!showTutorial)} className="btn-secondary text-sm py-2 px-3">
              ?
            </button>
            <Link to="/games" className="btn-secondary text-sm py-2 px-4">
              ← Games
            </Link>
          </div>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="card mb-6 bg-quantum-primary bg-opacity-10 border border-quantum-primary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-quantum-primary">How to Play</h3>
              <button onClick={() => setShowTutorial(false)} className="text-quantum-ghost hover:text-quantum-primary text-2xl">×</button>
            </div>
            <div className="space-y-2 text-sm text-quantum-ghost">
              <p><strong>🎯 Goal:</strong> Combine tiles to reach 2048!</p>
              <p><strong>⌨️ Controls:</strong> Use Arrow Keys or swipe to move tiles</p>
              <p><strong>🔢 Merge:</strong> When two tiles with the same number touch, they merge into one</p>
              <p><strong>✨ Strategy:</strong> Keep high numbers in corners and plan ahead!</p>
            </div>
          </div>
        )}

        {/* Score */}
        <div className="flex gap-4 mb-6">
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-ghost mb-1">Score</div>
            <div className="text-3xl font-black text-quantum-primary">{score}</div>
          </div>
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-ghost mb-1">Best</div>
            <div className="text-3xl font-black text-quantum-secondary">{bestScore}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="card bg-gray-800 p-4 mb-6">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, i) => 
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-black transition-all duration-200 ${getTileColor(cell)}`}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto md:hidden">
          <div></div>
          <button onClick={() => move('up')} className="btn-primary py-4">↑</button>
          <div></div>
          <button onClick={() => move('left')} className="btn-primary py-4">←</button>
          <button onClick={() => move('down')} className="btn-primary py-4">↓</button>
          <button onClick={() => move('right')} className="btn-primary py-4">→</button>
        </div>

        {/* Game Over / Won */}
        {(gameOver || won) && (
          <div className="card text-center bg-quantum-primary bg-opacity-20">
            <h2 className="text-3xl font-black mb-4">
              {won ? '🎉 You Won!' : '💀 Game Over!'}
            </h2>
            <p className="text-quantum-ghost mb-4">Score: {score}</p>
            <button onClick={initBoard} className="btn-primary">
              Play Again
            </button>
          </div>
        )}

        {/* New Game Button */}
        {!gameOver && !won && (
          <div className="text-center">
            <button onClick={initBoard} className="btn-secondary">
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;
