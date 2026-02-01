import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';

const MultiplayerLobby = ({ 
  gameType, 
  gameName,
  onGameStart,
  onCancel 
}) => {
  const { user, token } = useAuth();
  const [roomId, setRoomId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, browsing, waiting, ready, starting
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [manualRoomId, setManualRoomId] = useState('');
  const [error, setError] = useState(null);
  const [isAutoMatching, setIsAutoMatching] = useState(false);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
    }

    return () => {
      // Don't disconnect global socket
    };
  }, [token]);

  const fetchAvailableRooms = () => {
    if (!socketService.socket?.connected) {
      setError('Not connected to server');
      return;
    }
    socketService.emit('multiplayer:get-rooms', { gameType });
  };

  const startAutoMatch = () => {
    setIsAutoMatching(true);
    setStatus('searching');
    setError(null);
    
    socketService.socket?.emit('multiplayer:join', { 
      gameType, 
      roomId: null, 
      userId: user._id,
      username: user.username
    });
  };

  const joinRoomById = (targetRoomId) => {
    if (!targetRoomId || targetRoomId.trim() === '') {
      setError('Please enter a room ID');
      return;
    }

    setError(null);
    setStatus('joining');
    
    socketService.socket?.emit('multiplayer:join', { 
      gameType, 
      roomId: targetRoomId, 
      userId: user._id,
      username: user.username
    });
  };

  useEffect(() => {
    if (!socketService.socket?.connected) return;

    socketService.on('multiplayer:rooms-list', ({ rooms }) => {
      console.log('Available rooms:', rooms);
      setAvailableRooms(rooms);
      setStatus('browsing');
    });

    socketService.on('multiplayer:room-created', ({ roomId: newRoomId }) => {
      console.log('Room created:', newRoomId);
      setRoomId(newRoomId);
      setPlayers([{ userId: user._id, username: user.username, ready: false }]);
      setStatus('waiting');
      setIsAutoMatching(false);
    });

    socketService.on('multiplayer:player-joined', ({ roomId: joinedRoomId, players: updatedPlayers }) => {
      console.log('Player joined room:', joinedRoomId, updatedPlayers);
      setRoomId(joinedRoomId);
      setPlayers(updatedPlayers);
      setStatus('waiting');
      setIsAutoMatching(false);
      setError(null);
    });

    socketService.on('multiplayer:ready-status', ({ players: updatedPlayers, allReady }) => {
      console.log('Ready status updated:', updatedPlayers, allReady);
      setPlayers(updatedPlayers);
      if (allReady) {
        setStatus('starting');
      }
    });

    socketService.on('multiplayer:game-start', ({ startTime }) => {
      console.log('Game starting...');
      onGameStart(socketService.socket, roomId);
    });

    socketService.on('multiplayer:player-left', ({ players: updatedPlayers }) => {
      console.log('Player left:', updatedPlayers);
      setPlayers(updatedPlayers);
      setIsReady(false);
      setStatus('waiting');
    });

    socketService.on('multiplayer:error', ({ message }) => {
      console.error('Multiplayer error:', message);
      setError(message);
      setStatus('error');
    });

    socketService.on('multiplayer:connecting', () => {
      setStatus('connecting');
    });

    return () => {
      socketService.off('multiplayer:rooms-list');
      socketService.off('multiplayer:room-created');
      socketService.off('multiplayer:player-joined');
      socketService.off('multiplayer:ready-status');
      socketService.off('multiplayer:game-start');
      socketService.off('multiplayer:player-left');
      socketService.off('multiplayer:error');
      socketService.off('multiplayer:connecting');
    };
  }, [user, roomId, onGameStart]);

  const toggleReady = () => {
    if (roomId) {
      const newReady = !isReady;
      setIsReady(newReady);
      socketService.emit('multiplayer:ready', { roomId, ready: newReady });
    }
  };

  const handleCancel = () => {
    if (roomId) {
      socketService.emit('multiplayer:leave', { roomId });
    }
    onCancel();
  };

  // Browsing/Finding match screen
  if (!roomId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="card max-w-md w-full bg-gray-900 border-2 border-quantum-accent">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-quantum-accent mb-2">Find Opponent</h2>
            <p className="text-quantum-ghost">{gameName}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Quick Match Button */}
          <button
            onClick={startAutoMatch}
            disabled={isAutoMatching}
            className={`w-full p-4 rounded-lg mb-4 font-bold transition-all ${
              isAutoMatching 
                ? 'bg-quantum-primary bg-opacity-50 cursor-not-allowed'
                : 'bg-quantum-primary hover:bg-quantum-accent text-black'
            }`}
          >
            {isAutoMatching ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Searching...
              </div>
            ) : (
              '🔍 Auto-Match'
            )}
          </button>

          {/* OR Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">or</span>
            </div>
          </div>

          {/* Manual Room ID Input */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter room ID"
              value={manualRoomId}
              onChange={(e) => setManualRoomId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-quantum-primary"
            />
            <button
              onClick={() => joinRoomById(manualRoomId)}
              className="w-full p-3 rounded-lg bg-quantum-ghost text-black hover:bg-quantum-accent font-bold transition-all"
            >
              Join Room
            </button>
          </div>

          {/* Available Rooms List */}
          <div className="mt-6">
            <button
              onClick={fetchAvailableRooms}
              className="w-full p-2 text-sm text-quantum-ghost hover:text-quantum-accent border border-gray-700 rounded-lg transition-all mb-3"
            >
              Show Available Rooms
            </button>

            {availableRooms.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableRooms.map((room) => (
                  <button
                    key={room.roomId}
                    onClick={() => joinRoomById(room.roomId)}
                    className="w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-quantum-primary transition-all text-left"
                  >
                    <div className="font-bold text-quantum-primary text-sm">
                      Room: {room.roomId.substring(0, 12)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      👥 {room.playerCount}/2 players
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="btn-secondary w-full mt-4"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full bg-gray-900 border-2 border-quantum-accent">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-quantum-accent mb-2">Multiplayer Lobby</h2>
          <p className="text-quantum-ghost">{gameName}</p>
        </div>

        {/* Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="text-center">
            {status === 'connecting' && (
              <div className="text-quantum-ghost">
                <div className="animate-spin text-4xl mb-2">◉</div>
                <div>Connecting...</div>
              </div>
            )}
            {status === 'waiting' && players.length < 2 && (
              <div className="text-yellow-400">
                <div className="text-4xl mb-2">⏳</div>
                <div>Waiting for opponent...</div>
                <div className="text-sm text-gray-400 mt-2">
                  <div>Share this room ID:</div>
                  <div className="font-bold text-quantum-accent mt-1 font-mono text-lg break-all">{roomId}</div>
                </div>
              </div>
            )}
            {status === 'waiting' && players.length === 2 && (
              <div className="text-green-400">
                <div className="text-4xl mb-2">👥</div>
                <div>Opponent found!</div>
              </div>
            )}
            {status === 'starting' && (
              <div className="text-quantum-primary">
                <div className="text-4xl mb-2 animate-pulse">▶</div>
                <div>Starting game...</div>
              </div>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="space-y-3 mb-6">
          {players.map((player, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                player.ready 
                  ? 'bg-green-600 bg-opacity-20 border border-green-600' 
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">
                    Player {index + 1}
                    {player.userId === user._id && ' (You)'}
                  </div>
                  <div className="text-sm text-gray-400">{player.username || 'Anonymous'}</div>
                </div>
                {player.ready && (
                  <div className="text-2xl">✅</div>
                )}
              </div>
            </div>
          ))}
          {players.length < 2 && (
            <div className="p-4 rounded-lg bg-gray-800 border border-dashed border-gray-600">
              <div className="text-gray-500 text-center">Waiting for player...</div>
            </div>
          )}
        </div>

        {/* Ready Button */}
        {players.length === 2 && status !== 'starting' && (
          <button
            onClick={toggleReady}
            className={`btn w-full mb-3 ${
              isReady 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'btn-primary'
            }`}
          >
            {isReady ? 'Not Ready' : 'Ready'}
          </button>
        )}

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="btn-secondary w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MultiplayerLobby;
