import React from 'react';
import Cell from './Cell';

const MasterGrid = ({ gameState, onMove }) => {
  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-quantum-primary text-xl font-semibold">Loading game...</div>
      </div>
    );
  }

  const { board } = gameState;

  const handleCellClick = (index) => {
    if (onMove) {
      onMove(index);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-quantum-dark bg-opacity-50 rounded-xl max-w-md mx-auto">
      {board.map((cell, index) => (
        <div 
          key={index}
          className="bg-quantum-ghost bg-opacity-10 rounded aspect-square border border-quantum-primary border-opacity-30"
        >
          <Cell
            value={cell}
            onClick={() => handleCellClick(index)}
            isActive={!gameState.gameOver && cell === ''}
          />
        </div>
      ))}
    </div>
  );
};

export default MasterGrid;
