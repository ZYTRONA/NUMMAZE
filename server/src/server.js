const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = require('./config/database');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));

// Socket.io configuration
require('./config/socket')(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

let retryCount = 0;
const maxRetries = 3;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    retryCount++;
    if (retryCount > maxRetries) {
      console.error(`❌ Port ${PORT} is busy. Please run: pkill -9 node`);
      process.exit(1);
    }
    console.log(`⚠️  Port ${PORT} is busy, retrying... (${retryCount}/${maxRetries})`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 1000);
  } else {
    throw error;
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  retryCount = 0;
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
