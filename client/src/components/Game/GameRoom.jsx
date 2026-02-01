import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import MasterGrid from '../Board/MasterGrid';
import TurnIndicator from './TurnIndicator';

const GameRoom = () => {
  const [showHelp, setShowHelp] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    gameState,
    players,
    mySymbol,
    isMyTurn,
    gameStatus,
    error,
    joinGame,
    makeMove,
    resetBoard,
    leaveGame
  } = useGame();

  useEffect(() => {
    if (roomId) {
      joinGame(roomId);
    }
  }, [roomId, joinGame]);

  const handleMove = (index) => {
    makeMove(index);
  };

  const handleReset = () => {
    if (window.confirm('Reset the board and start a new game?')) {
      resetBoard();
    }
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this game?')) {
      leaveGame();
      navigate('/lobby');
    }
  };

  if (gameStatus === 'idle' || gameStatus === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <div className="text-3xl font-bold mb-4 text-quantum-primary">Waiting for Opponent...</div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-quantum-primary mx-auto"></div>
          <div className="mt-4 text-quantum-ghost">Room: {roomId}</div>
          <button onClick={handleLeave} className="btn-secondary mt-6">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-quantum-primary">
            TIC-TAC-TOE
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="btn-secondary text-sm py-2 px-3"
              title="How to play"
            >
              ?
            </button>
            <div className="text-sm text-quantum-ghost">
              Room: {roomId}
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="max-w-4xl mx-auto mb-6 card bg-quantum-primary bg-opacity-10 border border-quantum-primary">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-quantum-primary">How to Play</h3>
            <button 
              onClick={() => setShowHelp(false)}
              className="text-quantum-ghost hover:text-quantum-primary text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-3 text-sm text-quantum-ghost mb-4">
            <p><strong>🎯 Goal:</strong> Get 3 in a row (horizontal, vertical, or diagonal)</p>
            <p><strong>📍 Your Move:</strong> Click on any empty cell to place your mark</p>
            <p><strong>✨ Takes Turns:</strong> X goes first, then O, alternating until someone wins</p>
            <p><strong>🏆 Win:</strong> First to get 3 marks in a row wins!</p>
          </div>
          <Link to="/tutorial" className="btn-primary text-sm inline-block">
            View Full Tutorial
          </Link>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 text-center animate-pulse">
            <span className="text-red-400 font-semibold">⚠️ {error}</span>
          </div>
        </div>
      )}

      {gameStatus === 'waiting' || gameStatus === 'idle' ? (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-quantum-primary bg-opacity-10 border border-quantum-primary rounded-lg p-4 text-center">
            <span className="text-quantum-primary font-semibold">⏳ Waiting for opponent to join...</span>
            <p className="text-sm text-quantum-ghost mt-2">Share this room code with your friend: <strong>{roomId}</strong></p>
          </div>
        </div>
      ) : null}

      {gameState && !gameState.gameOver && (
        <div className="max-w-4xl mx-auto">
          <TurnIndicator
            currentTurn={gameState.currentTurn}
            mySymbol={mySymbol}
            isMyTurn={isMyTurn}
            players={players}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-6">
        <MasterGrid
          gameState={gameState}
          onMove={handleMove}
        />
      </div>

      {gameState && gameState.gameOver && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="card text-center">
            <div className="text-4xl font-black mb-4">
              {gameState.winner === 'TIE' ? (
                <span className="text-quantum-ghost">It's a Tie!</span>
              ) : gameState.winner === mySymbol ? (
                <span className="text-green-400">You Won!</span>
              ) : (
                <span className="text-red-400">You Lost</span>
              )}
            </div>
            
            <div className="text-xl mb-6">
              {gameState.winner !== 'TIE' && (
                <span className={gameState.winner === 'X' ? 'text-quantum-purple' : 'text-quantum-secondary'}>
                  {gameState.winner} wins!
                </span>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button onClick={handleReset} className="btn-primary">
                Play Again
              </button>
              <button onClick={handleLeave} className="btn-secondary">
                Leave Game
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState && !gameState.gameOver && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-4">
            <button onClick={handleLeave} className="btn-secondary">
              Leave Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
