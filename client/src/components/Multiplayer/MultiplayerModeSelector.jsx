import React, { useState } from 'react';

const MultiplayerModeSelector = ({ 
  onSelectMode, 
  gameType, 
  gameName,
  singlePlayerIcon = '▣',
  multiplayerIcon = '▣▣'
}) => {
  const [showModal, setShowModal] = useState(true);

  const handleSelectMode = (mode) => {
    setShowModal(false);
    onSelectMode(mode);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full bg-gray-900 border-2 border-quantum-primary">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-quantum-primary mb-2">{gameName}</h2>
          <p className="text-quantum-ghost">Choose your game mode</p>
        </div>

        <div className="space-y-4">
          {/* Single Player Mode */}
          <button
            onClick={() => handleSelectMode('single')}
            className="w-full p-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-4xl mb-2">{singlePlayerIcon}</div>
                <div className="text-xl font-bold text-white">Single Player</div>
                <div className="text-sm text-gray-200">Play solo and beat your best score</div>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </button>

          {/* Multiplayer Mode */}
          <button
            onClick={() => handleSelectMode('multiplayer')}
            className="w-full p-6 rounded-lg bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-4xl mb-2">{multiplayerIcon}</div>
                <div className="text-xl font-bold text-white">Multiplayer</div>
                <div className="text-sm text-gray-200">Compete with another player online</div>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-quantum-primary bg-opacity-10 rounded-lg">
          <div className="text-sm text-quantum-ghost">
            <strong className="text-quantum-accent">TIP:</strong> Multiplayer mode earns more points when you win!
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerModeSelector;
