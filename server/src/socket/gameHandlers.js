const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');
const GameLogic = require('../services/gameLogic');
const HazardLogic = require('../services/hazardLogic');
const GhostAI = require('../services/ghostAI');

// Active games map
const activeGames = new Map();
const moveQueues = new Map();
const moveCounts = new Map(); // Track move counts for hazards

// Periodic state sync intervals
const syncIntervals = new Map();

module.exports = (io, socket) => {
  
  /**
   * Player joins a game room
   */
  socket.on('game:join', async ({ roomId }) => {
    try {
      console.log(`🎮 ${socket.username} joining room: ${roomId}`);
      
      let game = await Game.findOne({ roomId, status: { $ne: 'completed' } });
      
      if (!game) {
        // Create new game
        game = await Game.create({
          roomId,
          players: [{
            user: socket.userId,
            symbol: 'X',
            socketId: socket.id
          }],
          gameState: GameLogic.initializeGameState(),
          status: 'waiting'
        });
        
        socket.join(roomId);
        socket.emit('game:waiting', { message: 'Waiting for opponent' });
        
      } else if (game.players.length === 1) {
        // Second player joins
        game.players.push({
          user: socket.userId,
          symbol: 'O',
          socketId: socket.id
        });
        game.status = 'active';
        game.startedAt = new Date();
        await game.save();
        
        socket.join(roomId);
        activeGames.set(roomId, game);
        
        io.to(roomId).emit('game:start', {
          gameState: game.gameState,
          players: game.players.map(p => ({
            userId: p.user,
            symbol: p.symbol
          }))
        });
        
        startPeriodicSync(io, roomId);
        
      } else {
        socket.emit('game:error', { message: 'Game is full' });
      }
      
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('game:error', { message: 'Failed to join game' });
    }
  });

  /**
   * Player makes a move
   */
  socket.on('game:move', async ({ roomId, index }) => {
    try {
      if (!moveQueues.has(roomId)) {
        moveQueues.set(roomId, []);
      }
      
      const queue = moveQueues.get(roomId);
      queue.push({ socketId: socket.id, index, timestamp: Date.now() });
      
      if (queue.length > 1) {
        socket.emit('game:move-rejected', { reason: 'Another move is being processed' });
        queue.pop();
        return;
      }
      
      const game = await Game.findOne({ roomId, status: 'active' });
      
      if (!game) {
        queue.shift();
        return socket.emit('game:error', { message: 'Game not found' });
      }
      
      const player = game.players.find(p => p.socketId === socket.id);
      if (!player) {
        queue.shift();
        return socket.emit('game:error', { message: 'You are not in this game' });
      }
      
      const validation = GameLogic.validateMove(
        game.gameState, 
        index, 
        player.symbol
      );
      
      if (!validation.valid) {
        queue.shift();
        return socket.emit('game:invalid-move', { reason: validation.reason });
      }
      
      const newGameState = GameLogic.applyMove(
        game.gameState, 
        index, 
        player.symbol
      );
      
      game.gameState = newGameState;
      game.lastMoveAt = new Date();
      await game.save();
      
      // Track move count for hazards
      const currentCount = moveCounts.get(roomId) || 0;
      const newCount = currentCount + 1;
      moveCounts.set(roomId, newCount);
      
      // Check if hazard should trigger
      let hazardEvent = null;
      if (HazardLogic.shouldTriggerHazard(newCount)) {
        hazardEvent = HazardLogic.applyRandomHazard(game.gameState);
        if (hazardEvent) {
          await game.save();
          io.to(roomId).emit('game:hazard', hazardEvent);
          
          // Give players 2 seconds to see the hazard message
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      activeGames.set(roomId, game);
      
      io.to(roomId).emit('game:state-update', {
        gameState: newGameState,
        lastMove: {
          player: player.symbol,
          subGrid,
          row,
          col,
          timestamp: Date.now()
        },
        hazard: hazardEvent
      });
      
      if (newGameState.gameOver) {
        await handleGameCompletion(io, game, roomId);
      }
      
      queue.shift();
      
    } catch (error) {
      console.error('Error processing move:', error);
      const queue = moveQueues.get(roomId);
      if (queue) queue.shift();
      socket.emit('game:error', { message: 'Failed to process move' });
    }
  });

  /**
   * Player resets the board
   */
  socket.on('game:reset', async ({ roomId }) => {
    try {
      const game = await Game.findOne({ roomId });
      
      if (!game) {
        return socket.emit('game:error', { message: 'Game not found' });
      }
      
      if (!game.gameState.gameOver) {
        return socket.emit('game:error', { message: 'Cannot reset game in progress' });
      }
      
      game.gameState = GameLogic.initializeGameState();
      game.status = 'active';
      game.startedAt = new Date();
      await game.save();
      
      io.to(roomId).emit('game:reset-complete', {
        gameState: game.gameState
      });
      
    } catch (error) {
      console.error('Error resetting game:', error);
      socket.emit('game:error', { message: 'Failed to reset game' });
    }
  });

  /**
   * Player reconnects
   */
  socket.on('game:reconnect', async ({ roomId }) => {
    try {
      const game = await Game.findOne({ roomId, status: 'active' });
      
      if (!game) {
        return socket.emit('game:error', { message: 'Game not found or completed' });
      }
      
      const player = game.players.find(p => p.user.toString() === socket.userId);
      
      if (!player) {
        return socket.emit('game:error', { message: 'You are not in this game' });
      }
      
      player.socketId = socket.id;
      await game.save();
      
      socket.join(roomId);
      
      socket.emit('game:reconnected', {
        gameState: game.gameState,
        yourSymbol: player.symbol,
        players: game.players.map(p => ({
          userId: p.user,
          symbol: p.symbol
        }))
      });
      
      socket.to(roomId).emit('game:opponent-reconnected', {
        message: 'Your opponent has reconnected'
      });
      
      console.log(`🔄 ${socket.username} reconnected to room: ${roomId}`);
      
    } catch (error) {
      console.error('Error reconnecting:', error);
      socket.emit('game:error', { message: 'Failed to reconnect' });
    }
  });

  /**
   * Player leaves game
   */
  socket.on('game:leave', async ({ roomId }) => {
    try {
      const game = await Game.findOne({ roomId, status: { $in: ['waiting', 'active'] } });
      
      if (game) {
        game.players = game.players.filter(p => p.socketId !== socket.id);
        
        if (game.players.length === 0) {
          await Game.deleteOne({ _id: game._id });
          activeGames.delete(roomId);
          stopPeriodicSync(roomId);
        } else {
          game.status = 'completed';
          await game.save();
          
          io.to(roomId).emit('game:opponent-left', {
            message: 'Opponent has left the game'
          });
        }
      }
      
      socket.leave(roomId);
      
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  });
};

/**
 * Handle game completion
 */
async function handleGameCompletion(io, game, roomId) {
  try {
    const player1 = game.players[0];
    const player2 = game.players[1];
    
    const p1Stats = GameLogic.calculateGameStats(game.gameState, player1.symbol);
    const p2Stats = GameLogic.calculateGameStats(game.gameState, player2.symbol);
    
    await User.findByIdAndUpdate(player1.user, {
      $inc: {
        points: p1Stats.points,
        'stats.gamesPlayed': 1,
        [`stats.${p1Stats.result}s`]: 1
      }
    });
    
    await User.findByIdAndUpdate(player2.user, {
      $inc: {
        points: p2Stats.points,
        'stats.gamesPlayed': 1,
        [`stats.${p2Stats.result}s`]: 1
      }
    });
    
    const duration = Math.floor((Date.now() - game.startedAt.getTime()) / 1000);
    
    await GameHistory.create({
      game: game._id,
      players: [
        {
          user: player1.user,
          symbol: player1.symbol,
          result: p1Stats.result,
          pointsEarned: p1Stats.points
        },
        {
          user: player2.user,
          symbol: player2.symbol,
          result: p2Stats.result,
          pointsEarned: p2Stats.points
        }
      ],
      finalState: game.gameState,
      duration,
      completedAt: new Date()
    });
    
    game.status = 'completed';
    await game.save();
    
    io.to(roomId).emit('game:over', {
      winner: game.gameState.winner,
      results: {
        [player1.symbol]: { result: p1Stats.result, points: p1Stats.points },
        [player2.symbol]: { result: p2Stats.result, points: p2Stats.points }
      }
    });
    
    activeGames.delete(roomId);
    stopPeriodicSync(roomId);
    
  } catch (error) {
    console.error('Error handling game completion:', error);
  }
}

/**
 * Start periodic state synchronization
 */
function startPeriodicSync(io, roomId) {
  const interval = setInterval(async () => {
    try {
      const game = await Game.findOne({ roomId, status: 'active' });
      
      if (!game) {
        clearInterval(interval);
        syncIntervals.delete(roomId);
        return;
      }
      
      io.to(roomId).emit('game:sync', {
        gameState: game.gameState,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error in periodic sync:', error);
    }
  }, 500);
  
  syncIntervals.set(roomId, interval);
}

/**
 * Stop periodic sync
 */
function stopPeriodicSync(roomId) {
  const interval = syncIntervals.get(roomId);
  if (interval) {
    clearInterval(interval);
    syncIntervals.delete(roomId);
  }
}

module.exports = (io, socket) => {
  
  /**
   * Player joins a game room
   */
  socket.on('game:join', async ({ roomId }) => {
    // ... existing code ...
  });

  // ... existing handlers ...

  /**
   * Tutorial mode with Ghost AI
   */
  socket.on('tutorial:start', async ({ difficulty = 'medium' }) => {
    try {
      const tutorialRoomId = `tutorial-${socket.id}`;
      const gameState = GameLogic.initializeGameState();
      
      socket.join(tutorialRoomId);
      
      socket.emit('tutorial:started', {
        roomId: tutorialRoomId,
        gameState,
        playerSymbol: 'X',
        aiSymbol: 'O',
        difficulty
      });
      
      activeGames.set(tutorialRoomId, {
        gameState,
        isTutorial: true,
        difficulty,
        playerSymbol: 'X',
        aiSymbol: 'O'
      });
      
    } catch (error) {
      console.error('Error starting tutorial:', error);
      socket.emit('tutorial:error', { message: 'Failed to start tutorial' });
    }
  });

  /**
   * Tutorial move with AI response
   */
  socket.on('tutorial:move', async ({ roomId, subGrid, row, col }) => {
    try {
      const tutorialGame = activeGames.get(roomId);
      
      if (!tutorialGame || !tutorialGame.isTutorial) {
        return socket.emit('tutorial:error', { message: 'Tutorial game not found' });
      }
      
      const validation = GameLogic.validateMove(
        tutorialGame.gameState, subGrid, row, col, tutorialGame.playerSymbol
      );
      
      if (!validation.valid) {
        return socket.emit('game:invalid-move', { reason: validation.reason });
      }
      
      tutorialGame.gameState = GameLogic.applyMove(
        tutorialGame.gameState, subGrid, row, col, tutorialGame.playerSymbol
      );
      
      socket.emit('game:state-update', {
        gameState: tutorialGame.gameState,
        lastMove: { player: tutorialGame.playerSymbol, subGrid, row, col }
      });
      
      if (tutorialGame.gameState.gameOver) {
        return socket.emit('tutorial:complete', {
          winner: tutorialGame.gameState.winner,
          message: tutorialGame.gameState.winner === tutorialGame.playerSymbol 
            ? '🎉 You won!' : '👻 Ghost AI wins!'
        });
      }
      
      setTimeout(() => {
        let aiMove = GhostAI.getMediumMove(tutorialGame.gameState, tutorialGame.aiSymbol);
        
        if (aiMove) {
          tutorialGame.gameState = GameLogic.applyMove(
            tutorialGame.gameState, aiMove.subGrid, aiMove.row, aiMove.col, tutorialGame.aiSymbol
          );
          
          socket.emit('game:state-update', {
            gameState: tutorialGame.gameState,
            lastMove: { player: tutorialGame.aiSymbol, ...aiMove }
          });
          
          if (tutorialGame.gameState.gameOver) {
            socket.emit('tutorial:complete', {
              winner: tutorialGame.gameState.winner,
              message: tutorialGame.gameState.winner === tutorialGame.playerSymbol 
                ? '🎉 You won!' : '👻 Ghost AI wins!'
            });
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in tutorial move:', error);
    }
  });

  socket.on('tutorial:hint', async ({ roomId }) => {
    try {
      const tutorialGame = activeGames.get(roomId);
      if (tutorialGame && tutorialGame.isTutorial) {
        const hint = GhostAI.getTutorialHint(tutorialGame.gameState, tutorialGame.playerSymbol);
        socket.emit('tutorial:hint-received', hint);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
    }
  });
};
