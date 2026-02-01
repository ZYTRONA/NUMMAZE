import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import MasterGrid from '../Board/MasterGrid';
import TurnIndicator from '../Game/TurnIndicator';

const InteractiveTutorial = () => {
  const navigate = useNavigate();
  const [tutorialState, setTutorialState] = useState('intro'); // intro, playing, completed
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [hint, setHint] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [showHazardAlert, setShowHazardAlert] = useState(false);
  const [hazardMessage, setHazardMessage] = useState('');

  const handleTutorialStarted = useCallback((data) => {
    setRoomId(data.roomId);
    setGameState(data.gameState);
    setPlayerSymbol(data.playerSymbol);
    setTutorialState('playing');
  }, []);

  const handleStateUpdate = useCallback((data) => {
    setGameState(data.gameState);
  }, []);

  const handleTutorialComplete = useCallback((data) => {
    setTutorialState('completed');
    setTimeout(() => {
      if (data.winner === playerSymbol) {
        alert('Congratulations! You mastered NUMMAZE!');
      } else {
        alert('Ghost AI wins! Want to try again?');
      }
    }, 500);
  }, [playerSymbol]);

  const handleHintReceived = useCallback((hintData) => {
    setHint(hintData);
    setTimeout(() => setHint(null), 5000); // Hide hint after 5 seconds
  }, []);

  const handleHazard = useCallback((hazardData) => {
    setHazardMessage(hazardData.message);
    setShowHazardAlert(true);
    setTimeout(() => setShowHazardAlert(false), 3000);
  }, []);

  const handleInvalidMove = useCallback((data) => {
    alert(`Invalid move: ${data.reason}`);
  }, []);

  useEffect(() => {
    // Listen for tutorial events
    socketService.on('tutorial:started', handleTutorialStarted);
    socketService.on('game:state-update', handleStateUpdate);
    socketService.on('tutorial:complete', handleTutorialComplete);
    socketService.on('tutorial:hint-received', handleHintReceived);
    socketService.on('game:hazard', handleHazard);
    socketService.on('game:invalid-move', handleInvalidMove);

    return () => {
      socketService.off('tutorial:started');
      socketService.off('game:state-update');
      socketService.off('tutorial:complete');
      socketService.off('tutorial:hint-received');
      socketService.off('game:hazard');
      socketService.off('game:invalid-move');
    };
  }, [handleTutorialComplete, handleTutorialStarted, handleStateUpdate, handleHintReceived, handleHazard, handleInvalidMove]);

  const startTutorial = () => {
    socketService.emit('tutorial:start', { difficulty });
  };

  const makeMove = (subGrid, row, col) => {
    if (roomId && gameState && gameState.currentTurn === playerSymbol) {
      socketService.emit('tutorial:move', { roomId, subGrid, row, col });
    }
  };

  const requestHint = () => {
    if (roomId) {
      socketService.emit('tutorial:hint', { roomId });
    }
  };

  const restartTutorial = () => {
    setTutorialState('intro');
    setGameState(null);
    setRoomId(null);
    setHint(null);
  };

  if (tutorialState === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full">
          <h1 className="text-4xl font-black text-center mb-6 text-quantum-primary">
            Interactive Tutorial
          </h1>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-4">
                Learn NUMMAZE by playing against our <strong>Ghost AI</strong>!
              </p>
              <p className="text-sm text-quantum-ghost opacity-75 mb-6">
                The AI will help you understand recursive tic-tac-toe mechanics and show you strategic moves.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-center">
                Select Difficulty
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`py-3 px-4 rounded-lg font-bold transition-all ${
                    difficulty === 'easy'
                      ? 'bg-quantum-primary text-quantum-dark'
                      : 'bg-transparent border-2 border-quantum-ghost border-opacity-30 text-quantum-ghost'
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty('medium')}
                  className={`py-3 px-4 rounded-lg font-bold transition-all ${
                    difficulty === 'medium'
                      ? 'bg-quantum-primary text-quantum-dark'
                      : 'bg-transparent border-2 border-quantum-ghost border-opacity-30 text-quantum-ghost'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`py-3 px-4 rounded-lg font-bold transition-all ${
                    difficulty === 'hard'
                      ? 'bg-quantum-primary text-quantum-dark'
                      : 'bg-transparent border-2 border-quantum-ghost border-opacity-30 text-quantum-ghost'
                  }`}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="bg-quantum-dark bg-opacity-50 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-quantum-accent mb-2">⚠️ Hazard Zones Enabled!</h3>
              <p className="text-sm">Every <strong>5 moves</strong>, a random hazard will occur:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>Lock a sub-grid</li>
                <li>Swap two adjacent cells</li>
                <li>Clear a random cell</li>
              </ul>
            </div>

            <button
              onClick={startTutorial}
              className="btn-primary w-full text-xl py-4"
            >
              ▶ Start Tutorial
            </button>

            <button
              onClick={() => navigate('/tutorial')}
              className="btn-secondary w-full"
            >
              Read Rules First
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tutorialState === 'playing' && gameState) {
    const isMyTurn = gameState.currentTurn === playerSymbol;
    
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-black text-quantum-primary">
              Tutorial Mode
            </h1>
            <button
              onClick={() => navigate('/lobby')}
              className="btn-secondary text-sm py-2 px-4"
            >
              Exit
            </button>
          </div>

          {showHazardAlert && (
            <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-xl animate-pulse">
              <p className="text-center text-xl font-bold">{hazardMessage}</p>
            </div>
          )}

          <TurnIndicator
            currentTurn={gameState.currentTurn}
            mySymbol={playerSymbol}
            isMyTurn={isMyTurn}
            players={[{ symbol: playerSymbol }, { symbol: 'O' }]}
          />

          {hint && (
            <div className="card mb-4 bg-quantum-accent bg-opacity-20 border-2 border-quantum-accent">
              <h3 className="font-bold mb-2">Hint from Ghost AI:</h3>
              <p>{hint.reason}</p>
              {hint.move && (
                <p className="text-sm mt-2 text-quantum-ghost">
                  Suggested: Grid {hint.move.subGrid + 1}, Cell ({hint.move.row + 1}, {hint.move.col + 1})
                </p>
              )}
            </div>
          )}

          <div className="card mb-4">
            <MasterGrid
              gameState={gameState}
              onCellClick={makeMove}
              activeSubGrid={gameState.activeSubGrid}
            />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={requestHint}
              disabled={!isMyTurn}
              className="btn-secondary"
            >
              Get Hint
            </button>
            <button
              onClick={restartTutorial}
              className="btn-secondary"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tutorialState === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-3xl font-black mb-6">
            {gameState?.winner === playerSymbol ? 'You Won!' : 'Ghost AI Wins!'}
          </h2>
          <p className="text-lg mb-6">
            {gameState?.winner === playerSymbol
              ? 'Congratulations! You\'ve mastered the basics of NUMMAZE!'
              : 'Don\'t worry! Practice makes perfect.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={restartTutorial}
              className="btn-primary w-full"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/lobby')}
              className="btn-secondary w-full"
            >
              ▶ Play vs Real Players
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InteractiveTutorial;
