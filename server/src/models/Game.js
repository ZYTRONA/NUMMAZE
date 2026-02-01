const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    symbol: { type: String, enum: ['X', 'O'] },
    socketId: String
  }],
  gameState: {
    // Master grid: 3x3 array tracking sub-grid winners
    masterGrid: {
      type: [[String]],
      default: () => Array(3).fill(null).map(() => Array(3).fill(''))
    },
    // Sub-grids: Nine 3x3 arrays for individual cells
    subGrids: {
      type: [[[String]]],
      default: () => Array(9).fill(null).map(() => 
        Array(3).fill(null).map(() => Array(3).fill(''))
      )
    },
    // Active sub-grid index (0-8) or -1 if any grid available
    activeSubGrid: {
      type: Number,
      default: -1
    },
    currentTurn: {
      type: String,
      enum: ['X', 'O'],
      default: 'X'
    },
    winner: {
      type: String,
      enum: ['', 'X', 'O', 'TIE'],
      default: ''
    },
    gameOver: {
      type: Boolean,
      default: false
    }
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastMoveAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);
