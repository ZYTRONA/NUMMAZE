/**
 * Ghost AI Logic using Minimax Algorithm
 * For interactive tutorial and practice matches
 */

const GameLogic = require('./gameLogic');

class GhostAI {
  /**
   * Get best move using Minimax algorithm
   */
  static getBestMove(gameState, symbol, depth = 3) {
    const opponent = symbol === 'X' ? 'O' : 'X';
    let bestScore = -Infinity;
    let bestMove = null;

    // Get all valid moves
    const validMoves = this.getAllValidMoves(gameState);

    for (const move of validMoves) {
      // Simulate move
      const newState = this.simulateMove(gameState, move, symbol);
      
      // Calculate score
      const score = this.minimax(newState, depth - 1, -Infinity, Infinity, false, symbol, opponent);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   */
  static minimax(gameState, depth, alpha, beta, isMaximizing, aiSymbol, opponentSymbol) {
    // Terminal conditions
    if (gameState.gameOver) {
      if (gameState.winner === aiSymbol) return 10 + depth;
      if (gameState.winner === opponentSymbol) return -10 - depth;
      return 0; // Tie
    }

    if (depth === 0) {
      return this.evaluatePosition(gameState, aiSymbol);
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      const validMoves = this.getAllValidMoves(gameState);

      for (const move of validMoves) {
        const newState = this.simulateMove(gameState, move, aiSymbol);
        const score = this.minimax(newState, depth - 1, alpha, beta, false, aiSymbol, opponentSymbol);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Prune
      }

      return maxScore;
    } else {
      let minScore = Infinity;
      const validMoves = this.getAllValidMoves(gameState);

      for (const move of validMoves) {
        const newState = this.simulateMove(gameState, move, opponentSymbol);
        const score = this.minimax(newState, depth - 1, alpha, beta, true, aiSymbol, opponentSymbol);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Prune
      }

      return minScore;
    }
  }

  /**
   * Evaluate board position heuristically
   */
  static evaluatePosition(gameState, aiSymbol) {
    let score = 0;

    // Evaluate master grid control
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (gameState.masterGrid[i][j] === aiSymbol) {
          score += 3;
        } else if (gameState.masterGrid[i][j] && gameState.masterGrid[i][j] !== 'LOCKED') {
          score -= 3;
        }
      }
    }

    // Evaluate center control (most strategic position)
    if (gameState.masterGrid[1][1] === aiSymbol) {
      score += 2;
    }

    // Evaluate corner control
    const corners = [[0,0], [0,2], [2,0], [2,2]];
    for (const [i, j] of corners) {
      if (gameState.masterGrid[i][j] === aiSymbol) {
        score += 1;
      }
    }

    return score;
  }

  /**
   * Get all valid moves for current state
   */
  static getAllValidMoves(gameState) {
    const moves = [];
    const targetGrids = gameState.activeSubGrid === -1 
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8] 
      : [gameState.activeSubGrid];

    for (const gridIdx of targetGrids) {
      const masterRow = Math.floor(gridIdx / 3);
      const masterCol = gridIdx % 3;

      // Skip if grid is already won or locked
      if (gameState.masterGrid[masterRow][masterCol]) {
        continue;
      }

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (!gameState.subGrids[gridIdx][row][col]) {
            moves.push({ subGrid: gridIdx, row, col });
          }
        }
      }
    }

    return moves;
  }

  /**
   * Simulate a move and return new state
   */
  static simulateMove(gameState, move, symbol) {
    // Deep clone the state
    const newState = JSON.parse(JSON.stringify(gameState));
    
    // Apply the move
    const { subGrid, row, col } = move;
    newState.subGrids[subGrid][row][col] = symbol;

    // Check if sub-grid is won
    const subGridWinner = GameLogic.checkWinner(newState.subGrids[subGrid]);
    if (subGridWinner) {
      const masterRow = Math.floor(subGrid / 3);
      const masterCol = subGrid % 3;
      newState.masterGrid[masterRow][masterCol] = subGridWinner;
    }

    // Check if game is won
    const gameWinner = GameLogic.checkWinner(newState.masterGrid);
    if (gameWinner && gameWinner !== 'TIE') {
      newState.gameOver = true;
      newState.winner = gameWinner;
    }

    // Update active sub-grid
    const nextGrid = row * 3 + col;
    const nextMasterRow = Math.floor(nextGrid / 3);
    const nextMasterCol = nextGrid % 3;
    
    if (newState.masterGrid[nextMasterRow][nextMasterCol]) {
      newState.activeSubGrid = -1;
    } else {
      newState.activeSubGrid = nextGrid;
    }

    // Switch turn
    newState.currentTurn = symbol === 'X' ? 'O' : 'X';

    return newState;
  }

  /**
   * Get tutorial hint for current position
   */
  static getTutorialHint(gameState, playerSymbol) {
    const bestMove = this.getBestMove(gameState, playerSymbol, 2);
    
    if (!bestMove) {
      return {
        move: null,
        reason: "No valid moves available"
      };
    }

    // Generate explanation
    const { subGrid, row, col } = bestMove;
    const reasons = [
      `Playing here controls sub-grid ${subGrid + 1}`,
      `This move sends opponent to a favorable position`,
      `Strategic center/corner control`,
      `Blocks opponent's winning threat`
    ];

    return {
      move: bestMove,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      gridHighlight: subGrid,
      cellHighlight: { row, col }
    };
  }

  /**
   * Easy difficulty - makes random moves with 70% optimal
   */
  static getEasyMove(gameState, symbol) {
    if (Math.random() < 0.7) {
      return this.getBestMove(gameState, symbol, 1);
    }
    const validMoves = this.getAllValidMoves(gameState);
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  /**
   * Medium difficulty - uses depth-limited minimax
   */
  static getMediumMove(gameState, symbol) {
    return this.getBestMove(gameState, symbol, 2);
  }

  /**
   * Hard difficulty - full depth minimax
   */
  static getHardMove(gameState, symbol) {
    return this.getBestMove(gameState, symbol, 4);
  }
}

module.exports = GhostAI;
