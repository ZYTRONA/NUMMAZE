import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import MultiplayerModeSelector from '../Multiplayer/MultiplayerModeSelector';
import MultiplayerLobby from '../Multiplayer/MultiplayerLobby';
import socketService from '../../services/socketService';
import useScoreSaver from '../../hooks/useScoreSaver';

const GamePong = () => {
  const [gameMode, setGameMode] = useState(null);
  const [gameState, setGameState] = useState({
    ballX: 300,
    ballY: 200,
    ballVelX: 4,
    ballVelY: 4,
    player1Y: 150,
    player2Y: 150,
    score1: 0,
    score2: 0,
    gameStarted: false,
    gameOver: false,
    winner: null
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [roomCode, setRoomCode] = useState(null);
  
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameStateRef = useRef(gameState);
  const keysRef = useRef({ w: false, s: false });
  
  const isMobile = window.innerWidth < 768;
  const CANVAS_WIDTH = isMobile ? Math.min(window.innerWidth - 40, 500) : 600;
  const CANVAS_HEIGHT = isMobile ? 300 : 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = isMobile ? 60 : 80;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = isMobile ? 8 : 6;
  const AI_SPEED = isMobile ? 5 : 4;
  const WINNING_SCORE = 5;

  useScoreSaver('pong', gameState.score1, gameState.gameStarted && !gameState.gameOver);

  useEffect(() => {
    const saved = localStorage.getItem('bestPong');
    if (saved) setBestScore(parseInt(saved));
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const resetBall = useCallback(() => {
    const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
    const direction = Math.random() < 0.5 ? 1 : -1;
    return {
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballVelX: Math.cos(angle) * 4 * direction,
      ballVelY: Math.sin(angle) * 4
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  const resetGame = useCallback(() => {
    setGameState({
      ...resetBall(),
      player1Y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
      player2Y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
      score1: 0,
      score2: 0,
      gameStarted: false,
      gameOver: false,
      winner: null
    });
  }, [resetBall, CANVAS_HEIGHT, PADDLE_HEIGHT]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w' || e.key === 'W') {
        keysRef.current.w = true;
        e.preventDefault();
      }
      if (e.key === 's' || e.key === 'S') {
        keysRef.current.s = true;
        e.preventDefault();
      }
      if (e.key === ' ' && !gameState.gameStarted && !gameState.gameOver) {
        e.preventDefault();
        startGame();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'W') {
        keysRef.current.w = false;
        e.preventDefault();
      }
      if (e.key === 's' || e.key === 'S') {
        keysRef.current.s = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameStarted, gameState.gameOver, startGame]);

  const gameLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    
    const deltaTime = timestamp - lastTimeRef.current;
    if (deltaTime < 16) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = timestamp;

    const current = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Center line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(0, current.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, current.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(current.ballX, current.ballY, BALL_SIZE, BALL_SIZE);

    if (!current.gameStarted || current.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    let updates = {};

    // Player 1 movement (W/S keys)
    if (keysRef.current.w && current.player1Y > 0) {
      updates.player1Y = Math.max(0, current.player1Y - PADDLE_SPEED);
    }
    if (keysRef.current.s && current.player1Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
      updates.player1Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, current.player1Y + PADDLE_SPEED);
    }

    // AI or Player 2
    if (gameMode === 'single') {
      const ballCenterY = current.ballY + BALL_SIZE / 2;
      const paddle2CenterY = current.player2Y + PADDLE_HEIGHT / 2;
      
      if (ballCenterY < paddle2CenterY - 10 && current.player2Y > 0) {
        updates.player2Y = Math.max(0, current.player2Y - AI_SPEED);
      } else if (ballCenterY > paddle2CenterY + 10 && current.player2Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
        updates.player2Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, current.player2Y + AI_SPEED);
      }
    }

    // Ball movement
    let newBallX = current.ballX + current.ballVelX;
    let newBallY = current.ballY + current.ballVelY;
    let newBallVelX = current.ballVelX;
    let newBallVelY = current.ballVelY;

    // Wall collision
    if (newBallY <= 0 || newBallY >= CANVAS_HEIGHT - BALL_SIZE) {
      newBallVelY = -newBallVelY;
      newBallY = Math.max(0, Math.min(newBallY, CANVAS_HEIGHT - BALL_SIZE));
    }

    // Paddle collision
    const player1Updated = updates.player1Y !== undefined ? updates.player1Y : current.player1Y;
    const player2Updated = updates.player2Y !== undefined ? updates.player2Y : current.player2Y;

    // Left paddle
    if (
      newBallX <= PADDLE_WIDTH &&
      newBallY + BALL_SIZE >= player1Updated &&
      newBallY <= player1Updated + PADDLE_HEIGHT
    ) {
      newBallVelX = Math.abs(newBallVelX) * 1.05;
      const relativeIntersectY = (player1Updated + PADDLE_HEIGHT / 2) - (newBallY + BALL_SIZE / 2);
      newBallVelY = -relativeIntersectY * 0.1;
      newBallX = PADDLE_WIDTH;
    }

    // Right paddle
    if (
      newBallX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH &&
      newBallY + BALL_SIZE >= player2Updated &&
      newBallY <= player2Updated + PADDLE_HEIGHT
    ) {
      newBallVelX = -Math.abs(newBallVelX) * 1.05;
      const relativeIntersectY = (player2Updated + PADDLE_HEIGHT / 2) - (newBallY + BALL_SIZE / 2);
      newBallVelY = -relativeIntersectY * 0.1;
      newBallX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
    }

    // Scoring
    let newScore1 = current.score1;
    let newScore2 = current.score2;
    let resetNeeded = false;

    if (newBallX < 0) {
      newScore2++;
      resetNeeded = true;
    } else if (newBallX > CANVAS_WIDTH) {
      newScore1++;
      resetNeeded = true;
    }

    if (resetNeeded) {
      const resetBallState = resetBall();
      newBallX = resetBallState.ballX;
      newBallY = resetBallState.ballY;
      newBallVelX = resetBallState.ballVelX;
      newBallVelY = resetBallState.ballVelY;
    }

    // Check for winner
    if (newScore1 >= WINNING_SCORE || newScore2 >= WINNING_SCORE) {
      const winner = newScore1 >= WINNING_SCORE ? 1 : 2;
      const finalScore = newScore1;
      
      if (gameMode === 'single' && finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem('bestPong', finalScore.toString());
      }

      if (gameMode === 'multiplayer' && roomCode) {
        socketService.emit('submitScore', {
          roomCode,
          score: winner === 1 ? newScore1 : newScore2,
          gameType: 'pong'
        });
      }

      gameStateRef.current = {
        ...current,
        ...updates,
        ballX: newBallX,
        ballY: newBallY,
        ballVelX: newBallVelX,
        ballVelY: newBallVelY,
        score1: newScore1,
        score2: newScore2,
        gameOver: true,
        winner
      };

      setGameState(gameStateRef.current);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    gameStateRef.current = {
      ...current,
      ...updates,
      ballX: newBallX,
      ballY: newBallY,
      ballVelX: newBallVelX,
      ballVelY: newBallVelY,
      score1: newScore1,
      score2: newScore2
    };

    setGameState(gameStateRef.current);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameMode, roomCode, bestScore, resetBall, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE, PADDLE_SPEED, AI_SPEED, WINNING_SCORE]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Remove separate canvas rendering - it's now in gameLoop

  // Multiplayer handlers
  const handleModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleGameStart = (code) => {
    setRoomCode(code);
    startGame();
  };

  const handleOpponentUpdate = useCallback((data) => {
    if (data.player2Y !== undefined) {
      setGameState(prev => ({ ...prev, player2Y: data.player2Y }));
    }
    if (data.score1 !== undefined || data.score2 !== undefined) {
      setGameState(prev => ({
        ...prev,
        score1: data.score1 !== undefined ? data.score1 : prev.score1,
        score2: data.score2 !== undefined ? data.score2 : prev.score2
      }));
    }
  }, []);

  useEffect(() => {
    if (gameMode === 'multiplayer' && roomCode) {
      socketService.on('opponentMove', handleOpponentUpdate);
      socketService.on('gameStateUpdate', handleOpponentUpdate);
      
      return () => {
        socketService.off('opponentMove', handleOpponentUpdate);
        socketService.off('gameStateUpdate', handleOpponentUpdate);
      };
    }
  }, [gameMode, roomCode, handleOpponentUpdate]);

  // Send player position in multiplayer
  useEffect(() => {
    if (gameMode === 'multiplayer' && roomCode && gameState.gameStarted) {
      socketService.emit('updateGameState', {
        roomCode,
        gameState: { player1Y: gameState.player1Y }
      });
    }
  }, [gameMode, roomCode, gameState.player1Y, gameState.gameStarted]);

  if (!gameMode) {
    return (
      <MultiplayerModeSelector
        onSelectMode={handleModeSelect}
        gameName="Pong"
        singlePlayerIcon="▐"
        multiplayerIcon="▐ ▌"
      />
    );
  }

  if (gameMode === 'multiplayer' && !roomCode) {
    return (
      <MultiplayerLobby
        gameType="pong"
        onGameStart={handleGameStart}
        onBack={() => setGameMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/lobby" className="btn-secondary">
            Back
          </Link>
          <button onClick={() => setShowTutorial(!showTutorial)} className="btn-secondary">
            {showTutorial ? 'Hide' : 'How to Play'}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-quantum-primary mb-6">
          PONG {gameMode === 'multiplayer' && '(Multiplayer)'}
        </h1>

        {showTutorial && (
          <div className="card mb-6 bg-quantum-primary bg-opacity-10 border border-quantum-primary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-quantum-primary">How to Play</h3>
              <button onClick={() => setShowTutorial(false)} className="text-quantum-ghost hover:text-quantum-primary text-2xl">×</button>
            </div>
            <div className="space-y-2 text-sm text-quantum-ghost">
              <p><strong>GOAL:</strong> Score {WINNING_SCORE} points to win!</p>
              <p><strong>CONTROLS:</strong> W/S keys to move paddle up/down</p>
              <p><strong>SCORING:</strong> Ball passes opponent's paddle = 1 point</p>
              <p><strong>TIP:</strong> Hit ball with paddle edges for angled shots!</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-primary mb-1">You</div>
            <div className="text-4xl font-black text-quantum-primary">{gameState.score1}</div>
          </div>
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-secondary mb-1">{gameMode === 'single' ? 'AI' : 'Opponent'}</div>
            <div className="text-4xl font-black text-quantum-secondary">{gameState.score2}</div>
          </div>
          {gameMode === 'single' && (
            <div className="card flex-1 text-center">
              <div className="text-sm text-quantum-accent mb-1">Best</div>
              <div className="text-3xl font-black text-quantum-accent">{bestScore}</div>
            </div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 p-4 mb-6">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="mx-auto rounded-lg border-2 border-quantum-primary"
          />

          {(!gameState.gameStarted || gameState.gameOver) && (
            <div className="text-center mt-4">
              {gameState.gameOver ? (
                <>
                  <div className="text-3xl font-black text-quantum-primary mb-2">
                    {gameState.winner === 1 ? '★ YOU WIN! ★' : 'GAME OVER'}
                  </div>
                  <div className="text-xl text-quantum-ghost mb-4">
                    Final Score: {gameState.score1} - {gameState.score2}
                  </div>
                  <button onClick={resetGame} className="btn-primary">
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white mb-4">Press SPACE to Start</div>
                  <div className="text-quantum-ghost">Use W/S to move paddle</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex justify-center gap-4 mb-4">
          <button
            onTouchStart={() => keysRef.current.w = true}
            onTouchEnd={() => keysRef.current.w = false}
            onMouseDown={() => keysRef.current.w = true}
            onMouseUp={() => keysRef.current.w = false}
            className="btn-primary px-8 py-4 text-xl"
          >
            UP (W)
          </button>
          <button
            onTouchStart={() => keysRef.current.s = true}
            onTouchEnd={() => keysRef.current.s = false}
            onMouseDown={() => keysRef.current.s = true}
            onMouseUp={() => keysRef.current.s = false}
            className="btn-primary px-8 py-4 text-xl"
          >
            DOWN (S)
          </button>
        </div>

        <div className="card bg-quantum-primary bg-opacity-10">
          <h3 className="text-lg font-bold text-quantum-primary mb-3">Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-bold text-quantum-accent">W Key / UP Button</div>
              <div className="text-quantum-ghost">Move paddle up</div>
            </div>
            <div>
              <div className="font-bold text-quantum-accent">S Key / DOWN Button</div>
              <div className="text-quantum-ghost">Move paddle down</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePong;
