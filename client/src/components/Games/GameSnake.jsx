import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import MultiplayerModeSelector from '../Multiplayer/MultiplayerModeSelector';
import MultiplayerLobby from '../Multiplayer/MultiplayerLobby';

const GameSnake = () => {
  const [gameMode, setGameMode] = useState(null); // null, 'single', 'multiplayer'
  const [showLobby, setShowLobby] = useState(false);
  const [multiplayerSocket, setMultiplayerSocket] = useState(null);
  const [multiplayerRoomId, setMultiplayerRoomId] = useState(null);
  const [opponentScore, setOpponentScore] = useState(0);
  
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const directionRef = useRef(direction);

  const GRID_SIZE = 20;
  const CELL_SIZE = 20;

  useEffect(() => {
    const saved = localStorage.getItem('bestSnake');
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const generateFood = useCallback((snakeBody) => {
    const checkCollision = (food, body) => {
      return body.some(segment => segment[0] === food[0] && segment[1] === food[1]);
    };
    
    let newFood = [
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE)
    ];
    
    while (checkCollision(newFood, snakeBody)) {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    }
    
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [[10, 10]];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = [...newSnake[0]];

      switch (directionRef.current) {
        case 'UP': head[1] -= 1; break;
        case 'DOWN': head[1] += 1; break;
        case 'LEFT': head[0] -= 1; break;
        case 'RIGHT': head[0] += 1; break;
        default: break;
      }

      // Check collision with walls
      if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check if food is eaten
      if (head[0] === food[0] && head[1] === food[1]) {
        const newScore = score + 10;
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('bestSnake', newScore.toString());
        }
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, score, bestScore, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 100);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      const newDirection = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT'
      }[e.key];

      if (newDirection) {
        e.preventDefault();
        const opposite = {
          'UP': 'DOWN',
          'DOWN': 'UP',
          'LEFT': 'RIGHT',
          'RIGHT': 'LEFT'
        };

        if (opposite[directionRef.current] !== newDirection) {
          setDirection(newDirection);
          directionRef.current = newDirection;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleMobileControl = (newDirection) => {
    const opposite = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };

    if (opposite[directionRef.current] !== newDirection) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
  };

  // Multiplayer handlers
  const handleSelectMode = (mode) => {
    setGameMode(mode);
    if (mode === 'multiplayer') {
      setShowLobby(true);
    } else {
      resetGame();
    }
  };

  const handleGameStart = (socket, roomId) => {
    setMultiplayerSocket(socket);
    setMultiplayerRoomId(roomId);
    setShowLobby(false);
    resetGame();
    
    // Listen for opponent updates
    socket.on('multiplayer:opponent-state', ({ opponentState }) => {
      setOpponentScore(opponentState.score || 0);
    });
    
    socket.on('multiplayer:game-end', ({ winner, isDraw, results }) => {
      setGameOver(true);
      const myResult = results.find(r => r.userId === socket.userId);
      alert(isDraw ? `Draw! Your score: ${myResult.score}` : 
            winner.userId === socket.userId ? `You won! Score: ${myResult.score}` : 
            `You lost. Score: ${myResult.score}`);
    });
  };

  const handleCancelLobby = () => {
    setShowLobby(false);
    setGameMode(null);
  };

  // Send state to opponent in multiplayer
  useEffect(() => {
    if (multiplayerSocket && multiplayerRoomId && gameMode === 'multiplayer') {
      multiplayerSocket.emit('multiplayer:update-state', {
        roomId: multiplayerRoomId,
        gameState: { score, snakeLength: snake.length }
      });
    }
  }, [score, snake.length, multiplayerSocket, multiplayerRoomId, gameMode]);

  // Submit score when game ends in multiplayer
  useEffect(() => {
    if (gameOver && gameMode === 'multiplayer' && multiplayerSocket && multiplayerRoomId) {
      multiplayerSocket.emit('multiplayer:submit-score', {
        roomId: multiplayerRoomId,
        score,
        gameData: { snakeLength: snake.length }
      });
    }
  }, [gameOver, gameMode, score, snake.length, multiplayerSocket, multiplayerRoomId]);

  // Mode selector
  if (!gameMode) {
    return (
      <MultiplayerModeSelector
        onSelectMode={handleSelectMode}
        gameType="snake"
        gameName="Snake"
        singlePlayerIcon="▬▬●"
        multiplayerIcon="▬● ▬●"
      />
    );
  }

  // Lobby
  if (showLobby) {
    return (
      <MultiplayerLobby
        gameType="snake"
        gameName="Snake"
        onGameStart={handleGameStart}
        onCancel={handleCancelLobby}
      />
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-quantum-primary">SNAKE {gameMode === 'multiplayer' && '(Multiplayer)'}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowTutorial(!showTutorial)} className="btn-secondary text-sm py-2 px-3">
              ?
            </button>
            <Link to="/games" className="btn-secondary text-sm py-2 px-4">
              Back to Games
            </Link>
          </div>
        </div>

        {/* Multiplayer opponent score */}
        {gameMode === 'multiplayer' && (
          <div className="card mb-4 bg-purple-600 bg-opacity-20 border border-purple-600">
            <div className="flex justify-between items-center">
              <div className="text-sm text-purple-200">Opponent Score:</div>
              <div className="text-2xl font-black text-purple-400">{opponentScore}</div>
            </div>
          </div>
        )}

        {/* Tutorial */}
        {showTutorial && (
          <div className="card mb-6 bg-quantum-primary bg-opacity-10 border border-quantum-primary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-quantum-primary">How to Play</h3>
              <button onClick={() => setShowTutorial(false)} className="text-quantum-ghost hover:text-quantum-primary text-2xl">×</button>
            </div>
            <div className="space-y-2 text-sm text-quantum-ghost">
              <p><strong>GOAL:</strong> Eat food to grow and get points!</p>
              <p><strong>⌨️ Controls:</strong> Arrow Keys to move, Space to pause</p>
              <p><strong>⚠️ Avoid:</strong> Don't hit walls or your own body</p>
              <p><strong>✨ Tip:</strong> Plan your path and don't trap yourself!</p>
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
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-ghost mb-1">Length</div>
            <div className="text-3xl font-black text-quantum-accent">{snake.length}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="card bg-gray-900 p-4 mb-6">
          <div 
            className="relative mx-auto bg-gray-800 rounded-lg"
            style={{ 
              width: GRID_SIZE * CELL_SIZE, 
              height: GRID_SIZE * CELL_SIZE 
            }}
          >
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm ${index === 0 ? 'bg-green-400' : 'bg-green-500'}`}
                style={{
                  left: segment[0] * CELL_SIZE,
                  top: segment[1] * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-red-500 rounded-full animate-pulse"
              style={{
                left: food[0] * CELL_SIZE,
                top: food[1] * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2
              }}
            />

            {/* Pause Overlay */}
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
                <div className="text-4xl font-black text-white">PAUSED</div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-black text-red-500 mb-2">GAME OVER</div>
                  <div className="text-xl text-white">Score: {score}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto md:hidden">
          <div></div>
          <button onClick={() => handleMobileControl('UP')} className="btn-primary py-4">↑</button>
          <div></div>
          <button onClick={() => handleMobileControl('LEFT')} className="btn-primary py-4">←</button>
          <button onClick={() => setIsPaused(!isPaused)} className="btn-secondary py-4">
            {isPaused ? '▶' : '⏸'}
          </button>
          <button onClick={() => handleMobileControl('RIGHT')} className="btn-primary py-4">→</button>
          <div></div>
          <button onClick={() => handleMobileControl('DOWN')} className="btn-primary py-4">↓</button>
          <div></div>
        </div>

        {/* Controls */}
        <div className="text-center">
          {gameOver ? (
            <button onClick={resetGame} className="btn-primary">
              Play Again
            </button>
          ) : (
            <div className="flex gap-4 justify-center">
              <button onClick={() => setIsPaused(!isPaused)} className="btn-secondary">
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={resetGame} className="btn-secondary">
                Restart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSnake;
