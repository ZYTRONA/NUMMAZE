import React from 'react';

const Cell = ({ value, onClick, isActive, isWinningCell }) => {
  const getCellStyle = () => {
    let baseStyle = 'w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-200 ';
    
    if (value === 'X') {
      baseStyle += 'text-quantum-purple font-extrabold ';
    } else if (value === 'O') {
      baseStyle += 'text-quantum-secondary font-extrabold ';
    }
    
    if (isActive && !value) {
      baseStyle += 'cursor-pointer hover:bg-quantum-primary hover:bg-opacity-30 hover:scale-110 ';
    }
    
    if (isWinningCell) {
      baseStyle += 'bg-quantum-accent bg-opacity-30 animate-pulse ';
    }
    
    if (!isActive || value) {
      baseStyle += 'cursor-not-allowed opacity-60 ';
    }
    
    return baseStyle;
  };

  const handleClick = () => {
    if (isActive && !value && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={getCellStyle()}
      onClick={handleClick}
      role="button"
      tabIndex={isActive && !value ? 0 : -1}
      onKeyPress={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isActive && !value && onClick) {
          onClick();
        }
      }}
    >
      {value}
    </div>
  );
};

export default Cell;
