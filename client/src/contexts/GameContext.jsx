import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [mySymbol, setMySymbol] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [gameStatus, setGameStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    socketService.on('game:waiting', (data) => {
      setGameStatus('waiting');
      console.log('Waiting for opponent...');
    });

    socketService.on('game:start', (data) => {
      setGameState(data.gameState);
      setPlayers(data.players);
      setGameStatus('active');
      
      const myPlayer = data.players.find(p => p.userId === user.id);
      if (myPlayer) {
        setMySymbol(myPlayer.symbol);
        setIsMyTurn(data.gameState.currentTurn === myPlayer.symbol);
      }
      
      console.log('Game started!');
    });

    socketService.on('game:state-update', (data) => {
      setGameState(data.gameState);
      setLastMove(data.lastMove);
      setIsMyTurn(data.gameState.currentTurn === mySymbol);
      setError(null);
    });

    socketService.on('game:sync', (data) => {
      if (!gameState || data.timestamp > (lastMove?.timestamp || 0)) {
        setGameState(data.gameState);
      }
    });

    socketService.on('game:over', (data) => {
      setGameStatus('completed');
      setGameState(prev => ({ ...prev, winner: data.winner }));
      console.log('Game over!', data);
    });

    socketService.on('game:reset-complete', (data) => {
      setGameState(data.gameState);
      setGameStatus('active');
      setIsMyTurn(data.gameState.currentTurn === mySymbol);
      console.log('Board reset');
    });

    socketService.on('game:invalid-move', (data) => {
      setError(data.reason);
      setTimeout(() => setError(null), 3000);
    });

    socketService.on('game:move-rejected', (data) => {
      setError(data.reason);
      setTimeout(() => setError(null), 2000);
    });

    socketService.on('game:reconnected', (data) => {
      setGameState(data.gameState);
      setPlayers(data.players);
      setMySymbol(data.yourSymbol);
      setIsMyTurn(data.gameState.currentTurn === data.yourSymbol);
      setGameStatus('active');
      console.log('Reconnected successfully');
    });

    socketService.on('game:opponent-reconnected', (data) => {
      console.log(data.message);
    });

    socketService.on('game:opponent-left', (data) => {
      setError(data.message);
      setGameStatus('completed');
    });

    socketService.on('game:error', (data) => {
      setError(data.message);
      console.error('Game error:', data.message);
    });

    return () => {
      socketService.off('game:waiting');
      socketService.off('game:start');
      socketService.off('game:state-update');
      socketService.off('game:sync');
      socketService.off('game:over');
      socketService.off('game:reset-complete');
      socketService.off('game:invalid-move');
      socketService.off('game:move-rejected');
      socketService.off('game:reconnected');
      socketService.off('game:opponent-reconnected');
      socketService.off('game:opponent-left');
      socketService.off('game:error');
    };
  }, [token, mySymbol, user, gameState, lastMove]);

  const joinGame = useCallback((newRoomId) => {
    setRoomId(newRoomId);
    socketService.joinGame(newRoomId);
  }, []);

  const makeMove = useCallback((index) => {
    if (!isMyTurn) {
      setError('Not your turn!');
      return;
    }
    
    socketService.makeMove({ roomId, index });
  }, [roomId, isMyTurn]);

  const resetBoard = useCallback(() => {
    if (gameState && gameState.gameOver) {
      socketService.resetBoard(roomId);
    }
  }, [roomId, gameState]);

  const leaveGame = useCallback(() => {
    if (roomId) {
      socketService.leaveGame(roomId);
      setGameState(null);
      setRoomId(null);
      setPlayers([]);
      setMySymbol(null);
      setGameStatus('idle');
    }
  }, [roomId]);

  const reconnectToGame = useCallback((reconnectRoomId) => {
    setRoomId(reconnectRoomId);
    socketService.emit('game:reconnect', { roomId: reconnectRoomId });
  }, []);

  return (
    <GameContext.Provider value={{
      gameState,
      roomId,
      players,
      mySymbol,
      isMyTurn,
      lastMove,
      gameStatus,
      error,
      joinGame,
      makeMove,
      resetBoard,
      leaveGame,
      reconnectToGame
    }}>
      {children}
    </GameContext.Provider>
  );
};
