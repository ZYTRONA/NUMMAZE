import React from 'react';

const TurnIndicator = ({ currentTurn, mySymbol, isMyTurn, players }) => {
  return (
    <div className="card mb-6 text-center">
      <div className="flex items-center justify-center space-x-4">
        <div className={`text-5xl font-black ${
          currentTurn === 'X' ? 'text-quantum-purple' : 'text-quantum-secondary'
        }`}>
          {currentTurn}
        </div>
        
        <div>
          <div className="text-2xl font-bold text-quantum-ghost">
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </div>
          <div className="text-sm text-quantum-ghost mt-1">
            {isMyTurn ? "Make your move!" : "Waiting for opponent..."}
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`text-3xl font-bold ${
            mySymbol === 'X' ? 'text-quantum-purple' : 'text-quantum-secondary'
          }`}>
            {mySymbol}
          </div>
          <div className="text-xs text-quantum-ghost">You</div>
        </div>
      </div>
      
      {isMyTurn && (
        <div className="mt-4">
          <div className="h-2 bg-quantum-primary rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default TurnIndicator;
