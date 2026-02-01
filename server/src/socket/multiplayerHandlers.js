const User = require('../models/User');

// Store active multiplayer game rooms
const multiplayerRooms = new Map();

const setupMultiplayerHandlers = (io, socket) => {
  
  // Create or join a multiplayer game room
  socket.on('multiplayer:join', async ({ gameType, roomId, userId }) => {
    try {
      console.log(`🎮 ${socket.id} joining ${gameType} room:`, roomId);
      
      if (!roomId) {
        // Create new room
        roomId = `${gameType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        multiplayerRooms.set(roomId, {
          gameType,
          players: [{ socketId: socket.id, userId, ready: false, score: 0, gameState: null }],
          status: 'waiting',
          createdAt: Date.now()
        });
        
        socket.join(roomId);
        socket.emit('multiplayer:room-created', { roomId, gameType });
        console.log(`✅ Created room: ${roomId}`);
      } else {
        // Join existing room
        const room = multiplayerRooms.get(roomId);
        
        if (!room) {
          socket.emit('multiplayer:error', { message: 'Room not found' });
          return;
        }
        
        if (room.players.length >= 2) {
          socket.emit('multiplayer:error', { message: 'Room is full' });
          return;
        }
        
        room.players.push({ socketId: socket.id, userId, ready: false, score: 0, gameState: null });
        socket.join(roomId);
        
        // Notify both players
        io.to(roomId).emit('multiplayer:player-joined', { 
          roomId, 
          players: room.players.map(p => ({ userId: p.userId, ready: p.ready }))
        });
        
        console.log(`✅ Player joined room: ${roomId}`);
      }
    } catch (error) {
      console.error('Error joining multiplayer room:', error);
      socket.emit('multiplayer:error', { message: 'Failed to join room' });
    }
  });
  
  // Player ready status
  socket.on('multiplayer:ready', ({ roomId, ready }) => {
    const room = multiplayerRooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (player) {
      player.ready = ready;
      
      // Check if both players are ready
      const allReady = room.players.length === 2 && room.players.every(p => p.ready);
      
      io.to(roomId).emit('multiplayer:ready-status', { 
        players: room.players.map(p => ({ userId: p.userId, ready: p.ready })),
        allReady 
      });
      
      if (allReady && room.status === 'waiting') {
        room.status = 'playing';
        room.startTime = Date.now();
        io.to(roomId).emit('multiplayer:game-start', { startTime: room.startTime });
        console.log(`🎮 Game starting in room: ${roomId}`);
      }
    }
  });
  
  // Update game state (for real-time game sync)
  socket.on('multiplayer:update-state', ({ roomId, gameState }) => {
    const room = multiplayerRooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (player) {
      player.gameState = gameState;
      
      // Broadcast to other player
      socket.to(roomId).emit('multiplayer:opponent-state', { 
        opponentState: gameState,
        playerId: player.userId 
      });
    }
  });
  
  // Submit score
  socket.on('multiplayer:submit-score', async ({ roomId, score, gameData }) => {
    const room = multiplayerRooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;
    
    player.score = score;
    player.finished = true;
    player.finishedAt = Date.now();
    
    console.log(`📊 Score submitted: ${score} in room ${roomId}`);
    
    // Check if both players finished
    const bothFinished = room.players.every(p => p.finished);
    
    if (bothFinished) {
      // Determine winner
      const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
      const winner = sortedPlayers[0];
      const loser = sortedPlayers[1];
      
      const isDraw = winner.score === loser.score;
      
      // Update user points
      try {
        const gameTypeMap = {
          'snake': 'snake',
          'flappy': 'flappy',
          'memory': 'memory',
          '2048': 'game2048',
          'quiz': 'quiz'
        };
        
        const gameType = gameTypeMap[room.gameType] || room.gameType;
        
        if (winner.userId) {
          const winnerUser = await User.findById(winner.userId);
          if (winnerUser) {
            const points = isDraw ? 5 : 10;
            await winnerUser.updateGamePoints(gameType, points);
            winnerUser.stats.gamesPlayed++;
            if (!isDraw) winnerUser.stats.wins++;
            else winnerUser.stats.ties++;
            await winnerUser.save();
          }
        }
        
        if (loser.userId) {
          const loserUser = await User.findById(loser.userId);
          if (loserUser) {
            const points = isDraw ? 5 : 2;
            await loserUser.updateGamePoints(gameType, points);
            loserUser.stats.gamesPlayed++;
            if (!isDraw) loserUser.stats.losses++;
            else loserUser.stats.ties++;
            await loserUser.save();
          }
        }
      } catch (error) {
        console.error('Error updating points:', error);
      }
      
      // Send results
      io.to(roomId).emit('multiplayer:game-end', {
        winner: isDraw ? null : { userId: winner.userId, score: winner.score },
        loser: isDraw ? null : { userId: loser.userId, score: loser.score },
        isDraw,
        results: room.players.map(p => ({ 
          userId: p.userId, 
          score: p.score,
          finishedAt: p.finishedAt 
        }))
      });
      
      // Clean up room after 30 seconds
      setTimeout(() => {
        multiplayerRooms.delete(roomId);
        console.log(`🧹 Cleaned up room: ${roomId}`);
      }, 30000);
    }
  });
  
  // Leave room
  socket.on('multiplayer:leave', ({ roomId }) => {
    handlePlayerLeave(io, socket, roomId);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    // Find and clean up any rooms this player was in
    for (const [roomId, room] of multiplayerRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        handlePlayerLeave(io, socket, roomId);
      }
    }
  });
  
  // Get available rooms
  socket.on('multiplayer:get-rooms', ({ gameType }) => {
    const availableRooms = [];
    for (const [roomId, room] of multiplayerRooms.entries()) {
      if (room.gameType === gameType && room.status === 'waiting' && room.players.length < 2) {
        availableRooms.push({
          roomId,
          gameType: room.gameType,
          playerCount: room.players.length,
          createdAt: room.createdAt
        });
      }
    }
    socket.emit('multiplayer:rooms-list', { rooms: availableRooms });
  });
};

function handlePlayerLeave(io, socket, roomId) {
  const room = multiplayerRooms.get(roomId);
  if (!room) return;
  
  const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
  if (playerIndex !== -1) {
    room.players.splice(playerIndex, 1);
    socket.leave(roomId);
    
    if (room.players.length === 0) {
      multiplayerRooms.delete(roomId);
      console.log(`🧹 Room deleted: ${roomId}`);
    } else {
      io.to(roomId).emit('multiplayer:player-left', { 
        players: room.players.map(p => ({ userId: p.userId, ready: p.ready }))
      });
      room.status = 'waiting';
    }
  }
}

module.exports = setupMultiplayerHandlers;
