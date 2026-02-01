import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';

const MultiplayerLobby = ({ 
  gameType, 
  gameName,
  onGameStart,
  onCancel 
}) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [status, setStatus] = useState('connecting'); // connecting, waiting, ready, starting
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [searchingForRoom, setSearchingForRoom] = useState(true);

  useEffect(() => {
    // Connect to socket
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to multiplayer server');
      setStatus('waiting');
      setSocket(newSocket);
      
      // Get available rooms
      newSocket.emit('multiplayer:get-rooms', { gameType });
    });

    newSocket.on('multiplayer:rooms-list', ({ rooms }) => {
      if (rooms.length > 0 && searchingForRoom) {
        // Auto-join first available room
        const room = rooms[0];
        newSocket.emit('multiplayer:join', { 
          gameType, 
          roomId: room.roomId, 
          userId: user._id 
        });
        setSearchingForRoom(false);
      } else if (rooms.length === 0 && searchingForRoom) {
        // Create new room
        newSocket.emit('multiplayer:join', { 
          gameType, 
          roomId: null, 
          userId: user._id 
        });
        setSearchingForRoom(false);
      }
    });

    newSocket.on('multiplayer:room-created', ({ roomId: newRoomId }) => {
      setRoomId(newRoomId);
      setPlayers([{ userId: user._id, username: user.username, ready: false }]);
      setStatus('waiting');
    });

    newSocket.on('multiplayer:player-joined', ({ roomId: joinedRoomId, players: updatedPlayers }) => {
      setRoomId(joinedRoomId);
      setPlayers(updatedPlayers);
      setStatus('waiting');
    });

    newSocket.on('multiplayer:ready-status', ({ players: updatedPlayers, allReady }) => {
      setPlayers(updatedPlayers);
      if (allReady) {
        setStatus('starting');
      }
    });

    newSocket.on('multiplayer:game-start', ({ startTime }) => {
      onGameStart(newSocket, roomId);
    });

    newSocket.on('multiplayer:player-left', ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
      setIsReady(false);
      setStatus('waiting');
    });

    newSocket.on('multiplayer:error', ({ message }) => {
      alert(`Error: ${message}`);
      onCancel();
    });

    return () => {
      if (newSocket && roomId) {
        newSocket.emit('multiplayer:leave', { roomId });
      }
      if (newSocket) {
        newSocket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, user, onGameStart, onCancel]);

  const toggleReady = () => {
    if (socket && roomId) {
      const newReady = !isReady;
      setIsReady(newReady);
      socket.emit('multiplayer:ready', { roomId, ready: newReady });
    }
  };

  const handleCancel = () => {
    if (socket && roomId) {
      socket.emit('multiplayer:leave', { roomId });
    }
    onCancel();
  };

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
                <div className="text-sm text-gray-400 mt-1">Room: {roomId?.split('-')[1]}</div>
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
