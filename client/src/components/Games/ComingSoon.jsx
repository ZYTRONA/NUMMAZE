import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ gameName, icon }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <div className="text-8xl mb-6">{icon}</div>
        <h1 className="text-4xl font-black text-quantum-primary mb-2">{gameName}</h1>
        <p className="text-quantum-ghost text-lg mb-2">Coming Soon! 🚀</p>
        <p className="text-quantum-ghost text-sm mb-8">
          This game is under development. Check back later!
        </p>
        <Link to="/games" className="btn-primary">
          Back to Games
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
