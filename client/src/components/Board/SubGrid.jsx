import React from 'react';
import Cell from './Cell';

const SubGrid = ({ 
  gridIndex, 
  cells, 
  isActive, 
  winner, 
  onCellClick 
}) => {
  const getGridStyle = () => {
    let baseStyle = 'relative grid grid-cols-3 gap-[2px] bg-quantum-primary bg-opacity-20 p-1 rounded-lg transition-all duration-300 ';
    
    if (isActive && !winner) {
      baseStyle += 'ring-4 ring-quantum-primary shadow-neon ';
    }
    
    if (winner) {
      baseStyle += 'opacity-50 ';
    }
    
    return baseStyle;
  };

  const handleCellClick = (row, col) => {
    if (onCellClick && isActive && !winner) {
      onCellClick(gridIndex, row, col);
    }
  };

  return (
    <div className={getGridStyle()}>
      {cells.map((row, rowIndex) => (
        row.map((cellValue, colIndex) => (
          <div 
            key={`${rowIndex}-${colIndex}`} 
            className="bg-quantum-ghost bg-opacity-10 rounded aspect-square border border-quantum-primary border-opacity-20"
          >
            <Cell
              value={cellValue}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              isActive={isActive && !winner}
            />
          </div>
        ))
      ))}
      
      {winner && winner !== 'TIE' && (
        <div className="absolute inset-0 flex items-center justify-center bg-quantum-dark bg-opacity-80 backdrop-blur-sm rounded-lg">
          <span className={`text-6xl sm:text-8xl font-black ${
            winner === 'X' ? 'text-quantum-purple' : 'text-quantum-secondary'
          }`}>
            {winner}
          </span>
        </div>
      )}
      
      {winner === 'TIE' && (
        <div className="absolute inset-0 flex items-center justify-center bg-quantum-dark bg-opacity-80 backdrop-blur-sm rounded-lg">
          <span className="text-3xl sm:text-5xl font-bold text-quantum-ghost">
            TIE
          </span>
        </div>
      )}
    </div>
  );
};

export default SubGrid;
