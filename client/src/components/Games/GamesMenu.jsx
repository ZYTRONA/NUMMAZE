import React from 'react';
import { Link } from 'react-router-dom';
import AnimeParticles from '../Effects/AnimeParticles';
import { getRandomQuote } from '../../utils/animeTheme';

const GamesMenu = () => {
  const games = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      description: 'Classic 3x3 grid game. Play against another player or AI.',
      icon: '⭕',
      path: '/lobby',
      color: 'quantum-primary'
    },
    {
      id: 'pong',
      name: 'Pong',
      description: 'Classic paddle battle! Score points against AI or friends.',
      icon: '▐ ▌',
      path: '/game/pong',
      color: 'quantum-secondary'
    },
    {
      id: 'snake',
      name: 'Snake',
      description: 'Grow your snake by eating food. Avoid hitting walls!',
      icon: '▬▬●',
      path: '/game/snake',
      color: 'quantum-accent'
    },
    {
      id: 'memory',
      name: 'Memory',
      description: 'Match pairs of cards. Test your memory!',
      icon: '🧠',
      path: '/game/memory',
      color: 'quantum-ghost'
    },
    {
      id: 'flappy',
      name: 'Flappy Bird',
      description: 'Tap to fly! Avoid the pipes and survive as long as you can.',
      icon: '🐦',
      path: '/game/flappy',
      color: 'quantum-primary'
    },
    {
      id: 'wordle',
      name: 'Anime Quiz',
      description: 'Test your anime knowledge! One Piece, Bleach, Dragon Ball & more!',
      icon: '🎴',
      path: '/game/wordle',
      color: 'quantum-secondary'
    }
  ];

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-quantum-dark to-quantum-darker relative">
      <AnimeParticles />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Anime Quote */}
        <div className="card mb-8 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border-2 border-quantum-primary text-center">
          <span className="text-3xl mb-2 block">🎴</span>
          <p className="text-lg font-semibold text-quantum-primary italic">"{getRandomQuote()}"</p>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-quantum-primary mb-2">
            ⚡ QUANTUM GAMES
          </h1>
          <p className="text-quantum-ghost text-lg">Choose your game and challenge your friends!</p>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link 
              key={game.id}
              to={game.path}
              className="card block hover:shadow-neon transition-all transform hover:scale-105"
            >
              <div className="text-6xl mb-4 text-center">{game.icon}</div>
              <h3 className={`text-2xl font-bold mb-2 text-${game.color}`}>
                {game.name}
              </h3>
              <p className="text-quantum-ghost text-sm">
                {game.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link to="/lobby" className="btn-secondary">
            Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamesMenu;
