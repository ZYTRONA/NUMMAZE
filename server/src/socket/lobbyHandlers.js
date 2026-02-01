// Matchmaking queue
const matchmakingQueue = [];

module.exports = (io, socket) => {
  
  /**
   * Player wants to find a match
   */
  socket.on('lobby:find-match', () => {
    // Check if already in queue
    if (matchmakingQueue.some(p => p.userId === socket.userId)) {
      return socket.emit('lobby:error', { message: 'Already in matchmaking queue' });
    }
    
    // Add to queue
    matchmakingQueue.push({
      userId: socket.userId,
      username: socket.username,
      socketId: socket.id
    });
    
    socket.emit('lobby:searching', { message: 'Searching for opponent...' });
    
    // Try to match players
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();
      
      const roomId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      io.to(player1.socketId).emit('lobby:match-found', { roomId });
      io.to(player2.socketId).emit('lobby:match-found', { roomId });
    }
  });

  /**
   * Player cancels matchmaking
   */
  socket.on('lobby:cancel-match', () => {
    const index = matchmakingQueue.findIndex(p => p.userId === socket.userId);
    if (index !== -1) {
      matchmakingQueue.splice(index, 1);
      socket.emit('lobby:match-cancelled', { message: 'Matchmaking cancelled' });
    }
  });
};
