const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    symbol: String,
    result: { type: String, enum: ['win', 'loss', 'tie'] },
    pointsEarned: Number
  }],
  finalState: {
    masterGrid: [[String]],
    subGrids: [[[String]]],
    winner: String
  },
  moves: [{
    player: String,
    subGrid: Number,
    row: Number,
    col: Number,
    timestamp: Date
  }],
  duration: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient leaderboard queries
gameHistorySchema.index({ 'players.user': 1, completedAt: -1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
