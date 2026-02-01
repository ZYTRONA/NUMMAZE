const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  quantumId: {
    type: String,
    unique: true,
    default: function() {
      return `QP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  points: {
    type: Number,
    default: 0
  },
  gamePoints: {
    ticTacToe: { type: Number, default: 0 },
    quiz: { type: Number, default: 0 },
    snake: { type: Number, default: 0 },
    flappy: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    pong: { type: Number, default: 0 }
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    ties: { type: Number, default: 0 }
  },
  friends: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    addedAt: { type: Date, default: Date.now }
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate total points from all games
userSchema.methods.calculateTotalPoints = function() {
  const gamePoints = this.gamePoints || {};
  return (gamePoints.ticTacToe || 0) + 
         (gamePoints.quiz || 0) + 
         (gamePoints.snake || 0) + 
         (gamePoints.flappy || 0) + 
         (gamePoints.memory || 0) + 
         (gamePoints.pong || 0);
};

// Update points for a specific game
userSchema.methods.updateGamePoints = async function(gameType, points) {
  if (!this.gamePoints) this.gamePoints = {};
  this.gamePoints[gameType] = (this.gamePoints[gameType] || 0) + points;
  this.points = this.calculateTotalPoints();
  await this.save();
  return this.points;
};

module.exports = mongoose.model('User', userSchema);
