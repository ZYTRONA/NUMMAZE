const express = require('express');
const { 
  getLeaderboard, 
  getUserProfile, 
  sendFriendRequest, 
  acceptFriendRequest,
  updateGamePoints
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:id', protect, getUserProfile);
router.post('/friends/request', protect, sendFriendRequest);
router.put('/friends/accept/:friendId', protect, acceptFriendRequest);
router.post('/update-game-points', protect, updateGamePoints);

module.exports = router;
