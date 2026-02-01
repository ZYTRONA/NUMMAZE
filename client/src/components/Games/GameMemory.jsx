import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Animated Character Symbols (SVG-based)
const CharacterSymbol = ({ type, color }) => {
  const hexColor = `#${color}`;
  
  const symbols = {
    'Luffy': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce-slow">
        <circle cx="50" cy="50" r="35" fill={hexColor} opacity="0.3"/>
        <path d="M 30 40 Q 50 20, 70 40" stroke={hexColor} strokeWidth="8" fill="none" strokeLinecap="round"/>
        <circle cx="35" cy="45" r="5" fill={hexColor}/>
        <circle cx="65" cy="45" r="5" fill={hexColor}/>
        <path d="M 35 60 Q 50 70, 65 60" stroke={hexColor} strokeWidth="6" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    'Goku': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
        <circle cx="50" cy="50" r="30" fill={hexColor} opacity="0.2"/>
        <circle cx="50" cy="50" r="20" fill={hexColor} opacity="0.4"/>
        <circle cx="50" cy="50" r="10" fill={hexColor}/>
        <path d="M 50 20 L 55 35 L 70 30 L 60 45 L 75 55 L 60 55 L 65 70 L 50 60 L 35 70 L 40 55 L 25 55 L 40 45 L 30 30 L 45 35 Z" 
              fill={hexColor} opacity="0.6"/>
      </svg>
    ),
    'Eren': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
        <rect x="45" y="10" width="10" height="80" fill={hexColor} rx="2"/>
        <polygon points="50,5 40,20 60,20" fill={hexColor}/>
        <rect x="35" y="85" width="30" height="8" fill={hexColor} rx="2"/>
      </svg>
    ),
    'Tanjiro': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-flicker">
        <path d="M 50 20 L 40 50 L 50 40 L 45 70 L 55 45 L 50 60 L 60 30 Z" fill={hexColor} opacity="0.8"/>
        <circle cx="50" cy="25" r="8" fill={hexColor}/>
        <circle cx="45" cy="35" r="6" fill={hexColor} opacity="0.6"/>
        <circle cx="55" cy="35" r="6" fill={hexColor} opacity="0.6"/>
      </svg>
    ),
    'Ichigo': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
        <polygon points="50,10 55,40 60,15 65,45 70,20 75,50 50,90 25,50 30,20 35,45 40,15 45,40" fill={hexColor}/>
        <circle cx="50" cy="30" r="5" fill="white"/>
      </svg>
    ),
    'Deku': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce-slow">
        <circle cx="50" cy="40" r="25" fill={hexColor} opacity="0.3"/>
        <rect x="40" y="35" width="8" height="25" fill={hexColor} rx="4"/>
        <rect x="52" y="35" width="8" height="25" fill={hexColor} rx="4"/>
        <circle cx="44" cy="32" r="6" fill={hexColor}/>
        <circle cx="56" cy="32" r="6" fill={hexColor}/>
        <rect x="35" y="55" width="30" height="15" fill={hexColor} rx="7"/>
      </svg>
    ),
    'Saitama': (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="45" r="30" fill={hexColor} opacity="0.3"/>
        <ellipse cx="50" cy="50" rx="25" ry="20" fill={hexColor}/>
        <circle cx="42" cy="45" r="3" fill="white"/>
        <circle cx="58" cy="45" r="3" fill="white"/>
        <path d="M 40 55 Q 50 58, 60 55" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    ),
    'Levi': (
      <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
        <rect x="48" y="15" width="4" height="70" fill={hexColor}/>
        <polygon points="50,10 35,25 50,20 65,25" fill={hexColor}/>
        <rect x="40" y="80" width="20" height="6" fill={hexColor} rx="2"/>
        <line x1="30" y1="30" x2="70" y2="30" stroke={hexColor} strokeWidth="2" opacity="0.5"/>
      </svg>
    )
  };
  
  return symbols[type] || symbols['Saitama'];
};

const ANIME_IMAGES = [
  { id: 1, name: 'Luffy', color: 'DC2626' },
  { id: 2, name: 'Goku', color: 'F59E0B' },
  { id: 3, name: 'Eren', color: '10B981' },
  { id: 4, name: 'Tanjiro', color: 'EF4444' },
  { id: 5, name: 'Ichigo', color: 'F97316' },
  { id: 6, name: 'Deku', color: '22C55E' },
  { id: 7, name: 'Saitama', color: 'FCD34D' },
  { id: 8, name: 'Levi', color: '3B82F6' },
];

const GameMemory = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const initGame = useCallback(() => {
    const shuffled = [...ANIME_IMAGES, ...ANIME_IMAGES]
      .sort(() => Math.random() - 0.5)
      .map((image, index) => ({ id: index, imageId: image.id, name: image.name, color: image.color, matched: false }));
    
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
    const saved = localStorage.getItem('bestMemory');
    if (saved) setBestMoves(parseInt(saved));
  }, [initGame]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      
      if (cards[first].imageId === cards[second].imageId) {
        setMatched(prev => [...prev, first, second]);
        setFlipped([]);
        
        // Check if game is won
        if (matched.length + 2 === cards.length) {
          setGameWon(true);
          if (bestMoves === 0 || moves + 1 < bestMoves) {
            setBestMoves(moves + 1);
            localStorage.setItem('bestMemory', (moves + 1).toString());
          }
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flipped, cards, matched, moves, bestMoves]);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }
    setFlipped(prev => [...prev, index]);
  };

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-quantum-primary">MEMORY MATCH</h1>
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
              <p><strong>GOAL:</strong> Match all pairs of anime cards!</p>
              <p><strong>CLICK:</strong> Flip cards to reveal their symbols</p>
              <p><strong>MATCH:</strong> Find matching pairs to keep them flipped</p>
              <p><strong>✨ Win:</strong> Match all pairs in fewest moves possible!</p>
            </div>
          </div>
        )}

        {/* Score */}
        <div className="flex gap-4 mb-6">
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-ghost mb-1">Moves</div>
            <div className="text-3xl font-black text-quantum-primary">{moves}</div>
          </div>
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-ghost mb-1">Best</div>
            <div className="text-3xl font-black text-quantum-secondary">{bestMoves || '---'}</div>
          </div>
          <div className="card flex-1 text-center">
            <div className="text-sm text-quantum-ghost mb-1">Matched</div>
            <div className="text-3xl font-black text-quantum-accent">{matched.length / 2} / 8</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="card bg-gray-900 p-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(index);
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-lg overflow-hidden relative transition-all duration-300 transform ${
                    isFlipped
                      ? 'scale-105 ring-2 ring-quantum-accent'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
                  } ${matched.includes(index) ? 'opacity-50' : ''}`}
                  disabled={flipped.length === 2 || matched.includes(index)}
                >
                  {isFlipped ? (
                    <div className="w-full h-full flex flex-col bg-gray-900 p-2">
                      <div className="flex-1 flex items-center justify-center">
                        <CharacterSymbol type={card.name} color={card.color} />
                      </div>
                      <div className="text-xs font-bold text-white text-center mt-1">
                        {card.name}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl font-black text-gray-400">?</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Won */}
        {gameWon && (
          <div className="card text-center bg-quantum-primary bg-opacity-20 mb-6">
            <h2 className="text-3xl font-black mb-4">YOU WON!</h2>
            <p className="text-quantum-ghost mb-2">Completed in {moves} moves</p>
            {bestMoves === moves && (
              <p className="text-quantum-accent mb-4">★ New Best Score! ★</p>
            )}
            <button onClick={initGame} className="btn-primary">
              Play Again
            </button>
          </div>
        )}

        {/* New Game Button */}
        {!gameWon && (
          <div className="text-center">
            <button onClick={initGame} className="btn-secondary">
              Restart
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-flicker {
          animation: flicker 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GameMemory;
