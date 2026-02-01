/**
 * Core game logic for Simple Tic-Tac-Toe
 * Server-authoritative implementation
 */

class GameLogic {
  /**
   * Initialize empty game state
   */
  static initializeGameState() {
    return {
      board: Array(9).fill(''), // Flat 1D array for 3x3 grid
      currentTurn: 'X',
      winner: '',
      gameOver: false
    };
  }

  /**
   * Validate if a move is legal
   */
  static validateMove(gameState, index, player) {
    // Check if game is over
    if (gameState.gameOver) {
      return { valid: false, reason: 'Game is already over' };
    }
    // Check if it's player's turn
    if (gameState.currentTurn !== player) {
      return { valid: false, reason: 'Not your turn' };
    }

    // Check if index is valid
    if (index < 0 || index > 8) {
      return { valid: false, reason: 'Invalid cell' };
    }

    // Check if cell is already occupied
    if (gameState.board[index] !== '') {
      return { valid: false, reason: 'Cell is already occupied' };
    }

    return { valid: true };
  }

  /**
   * Apply a move and return updated game state
   */
  static applyMove(gameState, index, player) {
    // Create deep copy to avoid mutation
    const newState = JSON.parse(JSON.stringify(gameState));

    // Place move on board
    newState.board[index] = player;

    // Check if player won
    const winner = this.checkWinner(newState.board);
    if (winner) {
      newState.winner = winner;
      newState.gameOver = true;
    } else if (newState.board.every(cell => cell !== '')) {
      // Check for tie
      newState.winner = 'TIE';
      newState.gameOver = true;
    } else {
      // Switch turn
      newState.currentTurn = player === 'X' ? 'O' : 'X';
    }

    return newState;
  }

  /**
   * Check for a winner in a 1D board array
   * Board indices:
   * 0 | 1 | 2
   * ---------
   * 3 | 4 | 5
   * ---------
   * 6 | 7 | 8
   */
  static checkWinner(board) {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let combo of winningCombos) {
      if (board[combo[0]] !== '' && 
          board[combo[0]] === board[combo[1]] && 
          board[combo[1]] === board[combo[2]]) {
        return board[combo[0]];
      }
    }

    return null;
  }

  /**
   * Calculate game statistics for scoring
   */
  static calculateGameStats(gameState, playerSymbol) {
    if (!gameState.gameOver) {
      return null;
    }

    let result, points;
    
    if (gameState.winner === playerSymbol) {
      result = 'win';
      points = 10;
    } else if (gameState.winner === 'TIE') {
      result = 'tie';
      points = 2;
    } else {
      result = 'loss';
      points = -5;
    }

    return { result, points };
  }
}

module.exports = GameLogic;
