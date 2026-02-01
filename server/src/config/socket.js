const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Active connections map
const activeConnections = new Map(); // userId -> socketId
const activeSockets = new Map(); // socketId -> userId

module.exports = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`👤 User connected: ${socket.username} (${socket.id})`);
    
    // Store connection
    activeConnections.set(socket.userId, socket.id);
    activeSockets.set(socket.id, socket.userId);
    
    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    
    // Broadcast online status to friends
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Import and register handlers
    require('../socket/gameHandlers')(io, socket);
    require('../socket/chatHandlers')(io, socket);
    require('../socket/lobbyHandlers')(io, socket);
    require('../socket/multiplayerHandlers')(io, socket);

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`👤 User disconnected: ${socket.username} (${socket.id})`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      activeSockets.delete(socket.id);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      });
      
      // Broadcast offline status
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });

  return io;
};

// Export connection maps for use in handlers
module.exports.activeConnections = activeConnections;
module.exports.activeSockets = activeSockets;
