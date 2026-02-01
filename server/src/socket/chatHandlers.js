module.exports = (io, socket) => {
  
  /**
   * Send message in game room
   */
  socket.on('chat:message', ({ roomId, message }) => {
    io.to(roomId).emit('chat:message', {
      userId: socket.userId,
      username: socket.username,
      message,
      timestamp: new Date()
    });
  });

  /**
   * Join lobby chat
   */
  socket.on('lobby:join-chat', () => {
    socket.join('lobby');
    console.log(`${socket.username} joined lobby chat`);
  });

  /**
   * Send message in lobby
   */
  socket.on('lobby:message', ({ message }) => {
    io.to('lobby').emit('lobby:message', {
      userId: socket.userId,
      username: socket.username,
      message,
      timestamp: new Date()
    });
  });
};
