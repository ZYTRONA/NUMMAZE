const express = require('express');
const { getGame, getUserGameHistory } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:roomId', protect, getGame);
router.get('/history/user/:userId', protect, getUserGameHistory);

module.exports = router;
