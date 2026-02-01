import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useScoreSaver from '../../hooks/useScoreSaver';

// SVG Bird Component
const Bird = ({ rotation }) => (
  <svg viewBox="0 0 50 50" className="w-full h-full">
    <defs>
      <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Bird body */}
    <ellipse cx="25" cy="25" rx="18" ry="15" fill="url(#birdGradient)" stroke="#d97706" strokeWidth="1.5"/>
    {/* Wing */}
    <path 
      d="M 15 20 Q 5 15, 10 10 Q 15 12, 15 20 Z" 
      fill="#f59e0b" 
      stroke="#d97706" 
      strokeWidth="1"
      className="animate-wing"
    />
    {/* Eye */}
    <circle cx="32" cy="20" r="4" fill="white"/>
    <circle cx="33" cy="20" r="2" fill="black"/>
    {/* Beak */}
    <polygon points="40,24 48,25 40,26" fill="#f97316"/>
    {/* Tail */}
    <path d="M 8 28 L 2 30 L 8 32 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
  </svg>
);

const GameFlappy = () => {
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameStateRef = useRef({
    birdY: 250,
    birdVelocity: 0,
    pipes: [],
    score: 0
  });
  
  const BIRD_SIZE = 40;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 150;
  const GRAVITY = 0.5;
  const isMobile = window.innerWidth < 768;
  const GAME_HEIGHT = isMobile ? 400 : 500;
  const GAME_WIDTH = isMobile ? Math.min(window.innerWidth - 40, 350) : 400;

  useScoreSaver('flappy', score, gameStarted && !gameOver);

  useEffect(() => {
    const saved = localStorage.getItem('bestFlappy');
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      birdY: 250,
      birdVelocity: 0,
      pipes: [],
      score: 0
    };
    lastTimeRef.current = 0;
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
  }, []);

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    gameStateRef.current.birdVelocity = -8;
  }, [gameOver, gameStarted, resetGame]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  const gameLoop = useCallback((timestamp) => {
    if (!gameStarted || gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    if (deltaTime < 16) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = timestamp;

    const current = gameStateRef.current;
    current.birdVelocity += GRAVITY;
    current.birdY += current.birdVelocity;

    // Collision with bounds
    if (current.birdY > GAME_HEIGHT - BIRD_SIZE || current.birdY < 0) {
      const newBest = Math.max(current.score, bestScore);
      if (newBest > bestScore) {
        localStorage.setItem('bestFlappy', newBest.toString());
        setBestScore(newBest);
      }
      setBirdY(current.birdY);
      setGameOver(true);
      return;
    }

    // Update pipes
    let newPipes = current.pipes
      .map(pipe => ({ ...pipe, x: pipe.x - 3 }))
      .filter(pipe => pipe.x > -PIPE_WIDTH);

    if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
      newPipes.push({
        x: GAME_WIDTH,
        height: Math.random() * 200 + 100,
        scored: false
      });
    }

    // Collision & scoring
    let gameEnded = false;
    newPipes.forEach(pipe => {
      const birdLeft = 80;
      const birdRight = 80 + BIRD_SIZE;
      const birdTop = current.birdY;
      const birdBottom = current.birdY + BIRD_SIZE;

      if (
        pipe.x < birdRight &&
        pipe.x + PIPE_WIDTH > birdLeft &&
        (birdTop < pipe.height || birdBottom > pipe.height + PIPE_GAP)
      ) {
        gameEnded = true;
      }

      if (!pipe.scored && pipe.x + PIPE_WIDTH < 80) {
        pipe.scored = true;
        current.score += 1;
      }
    });

    if (gameEnded) {
      const newBest = Math.max(current.score, bestScore);
      if (newBest > bestScore) {
        localStorage.setItem('bestFlappy', newBest.toString());
        setBestScore(newBest);
      }
      setBirdY(current.birdY);
      setScore(current.score);
      setGameOver(true);
      return;
    }

    current.pipes = newPipes;
    
    // Update display state
    setBirdY(current.birdY);
    setBirdVelocity(current.birdVelocity);
    setPipes(newPipes);
    setScore(current.score);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, bestScore, BIRD_SIZE, GAME_HEIGHT, GAME_WIDTH, PIPE_GAP, PIPE_WIDTH, GRAVITY]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-quantum-primary">FLAPPY BIRD</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowTutorial(!showTutorial)} className="btn-secondary text-sm py-2 px-3">
              ?
            </button>
            <Link to="/games" className="btn-secondary text-sm py-2 px-4">
              Back to Games
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
              <p><strong>GOAL:</strong> Fly through gaps in pipes without hitting them!</p>
              <p><strong>CONTROLS:</strong> Space or Click to flap wings and fly up</p>
              <p><strong>AVOID:</strong> Don't hit pipes or ground/ceiling</p>
              <p><strong>TIP:</strong> Tap gently for precise control!</p>
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
        <div className="card bg-gradient-to-b from-cyan-400 to-cyan-600 p-4 mb-6">
          <div
            className="relative mx-auto bg-gradient-to-b from-sky-300 to-sky-400 rounded-lg overflow-hidden cursor-pointer"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            onClick={jump}
          >
            {/* Bird */}
            <div
              className="absolute"
              style={{
                left: 80,
                top: birdY,
                width: BIRD_SIZE,
                height: BIRD_SIZE,
                transform: `rotate(${Math.min(birdVelocity * 5, 45)}deg)`,
                transformOrigin: 'center center',
                willChange: 'transform'
              }}
            >
              <Bird rotation={birdVelocity * 5} />
            </div>

            {/* Pipes */}
            {pipes.map((pipe, index) => (
              <div key={index}>
                {/* Top pipe */}
                <div
                  className="absolute bg-green-600 border-4 border-green-700"
                  style={{
                    left: pipe.x,
                    top: 0,
                    width: PIPE_WIDTH,
                    height: pipe.height
                  }}
                />
                {/* Bottom pipe */}
                <div
                  className="absolute bg-green-600 border-4 border-green-700"
                  style={{
                    left: pipe.x,
                    top: pipe.height + PIPE_GAP,
                    width: PIPE_WIDTH,
                    height: GAME_HEIGHT - pipe.height - PIPE_GAP
                  }}
                />
              </div>
            ))}

            {/* Start Message */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-4">Click to Start!</div>
                  <div className="text-xl text-white">Press Space or Click</div>
                </div>
              </div>
            )}

            {/* Game Over */}
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black text-red-500 mb-4">GAME OVER</div>
                  <div className="text-2xl text-white mb-2">Score: {score}</div>
                  {score === bestScore && score > 0 && (
                    <div className="text-xl text-yellow-400 mb-4">★ New Best! ★</div>
                  )}
                  <div className="text-lg text-white">Click to Restart</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="text-center mb-6 md:hidden">
          <button 
            onClick={jump}
            className="btn-primary text-3xl py-8 px-16"
          >
            TAP TO FLAP
          </button>
        </div>

        {/* Controls */}
        <div className="text-center">
          <button onClick={resetGame} className="btn-secondary">
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameFlappy;

// Add CSS animation for wing flapping
const style = document.createElement('style');
style.textContent = `
  @keyframes wing-flap {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  .animate-wing {
    animation: wing-flap 0.3s infinite ease-in-out;
  }
`;
document.head.appendChild(style);
