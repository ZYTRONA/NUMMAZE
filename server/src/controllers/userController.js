const User = require('../models/User');

// @route   GET /api/users/leaderboard
// @desc    Get top 100 players by points
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;
    
    const leaderboard = await User.find()
      .select('username quantumId avatar points stats')
      .sort({ points: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/users/:id
// @desc    Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends.user', 'username quantumId avatar isOnline');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/users/friends/request
// @desc    Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    
    if (userId === friendId) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }
    
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already friends
    const alreadyFriends = user.friends.some(f => f.user.toString() === friendId);
    if (alreadyFriends) {
      return res.status(400).json({ message: 'Friend request already sent or accepted' });
    }
    
    // Add friend request
    user.friends.push({ user: friendId, status: 'pending' });
    friend.friends.push({ user: userId, status: 'pending' });
    
    await user.save();
    await friend.save();
    
    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/users/friends/accept/:friendId
// @desc    Accept friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update status to accepted for both users
    const userFriend = user.friends.find(f => f.user.toString() === friendId);
    const friendUser = friend.friends.find(f => f.user.toString() === userId);
    
    if (userFriend) userFriend.status = 'accepted';
    if (friendUser) friendUser.status = 'accepted';
    
    await user.save();
    await friend.save();
    
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/users/update-game-points
// @desc    Update user's game points in real-time
exports.updateGamePoints = async (req, res) => {
  try {
    const { gameType, points } = req.body;
    const userId = req.user.id;

    if (!gameType || points === undefined) {
      return res.status(400).json({ message: 'gameType and points are required' });
    }

    const validGameTypes = ['ticTacToe', 'quiz', 'snake', 'flappy', 'memory', 'pong'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ message: 'Invalid game type' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add points to specific game
    const totalPoints = await user.updateGamePoints(gameType, points);

    res.json({ 
      success: true, 
      message: 'Points updated successfully',
      gamePoints: user.gamePoints,
      totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
