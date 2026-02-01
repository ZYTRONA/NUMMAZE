const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');

// @route   GET /api/games/:roomId
// @desc    Get game by room ID
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findOne({ roomId: req.params.roomId })
      .populate('players.user', 'username quantumId avatar');
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/games/history/user/:userId
// @desc    Get user's game history
exports.getUserGameHistory = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    
    const history = await GameHistory.find({
      'players.user': req.params.userId
    })
      .populate('players.user', 'username quantumId avatar')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
