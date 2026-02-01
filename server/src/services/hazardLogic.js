/**
 * Hazard Zone Logic for Dynamic PVE Elements
 * Introduces random environmental changes every 5 turns
 */

class HazardLogic {
  /**
   * Check if hazard should trigger (every 5 turns)
   */
  static shouldTriggerHazard(moveCount) {
    return moveCount > 0 && moveCount % 5 === 0;
  }

  /**
   * Apply random hazard to game state
   */
  static applyRandomHazard(gameState) {
    const hazardTypes = ['lockSubGrid', 'swapCells', 'clearCell'];
    const randomType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    
    let hazard = null;
    
    switch (randomType) {
      case 'lockSubGrid':
        hazard = this.lockRandomSubGrid(gameState);
        break;
      case 'swapCells':
        hazard = this.swapAdjacentCells(gameState);
        break;
      case 'clearCell':
        hazard = this.clearRandomCell(gameState);
        break;
    }
    
    return hazard;
  }

  /**
   * Lock a random sub-grid that isn't already won
   */
  static lockRandomSubGrid(gameState) {
    const availableGrids = [];
    
    for (let i = 0; i < 9; i++) {
      const masterRow = Math.floor(i / 3);
      const masterCol = i % 3;
      
      // Only lock grids that aren't won yet
      if (!gameState.masterGrid[masterRow][masterCol]) {
        availableGrids.push(i);
      }
    }
    
    if (availableGrids.length === 0) {
      return null;
    }
    
    const gridToLock = availableGrids[Math.floor(Math.random() * availableGrids.length)];
    const masterRow = Math.floor(gridToLock / 3);
    const masterCol = gridToLock % 3;
    
    // Mark as locked with special symbol
    gameState.masterGrid[masterRow][masterCol] = 'LOCKED';
    
    // Store locked grids if not exists
    if (!gameState.lockedGrids) {
      gameState.lockedGrids = [];
    }
    gameState.lockedGrids.push(gridToLock);
    
    return {
      type: 'lockSubGrid',
      gridIndex: gridToLock,
      message: `⚠️ Hazard Zone! Sub-grid ${gridToLock + 1} has been LOCKED!`
    };
  }

  /**
   * Swap two adjacent cells that contain marks
   */
  static swapAdjacentCells(gameState) {
    const cellsWithMarks = [];
    
    // Find all cells with marks
    for (let gridIdx = 0; gridIdx < 9; gridIdx++) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (gameState.subGrids[gridIdx][row][col]) {
            cellsWithMarks.push({ gridIdx, row, col });
          }
        }
      }
    }
    
    if (cellsWithMarks.length < 2) {
      return null;
    }
    
    // Pick random cell
    const cell1 = cellsWithMarks[Math.floor(Math.random() * cellsWithMarks.length)];
    
    // Find adjacent cells in same grid
    const adjacentCells = this.getAdjacentCells(cell1.gridIdx, cell1.row, cell1.col, gameState);
    
    if (adjacentCells.length === 0) {
      return null;
    }
    
    const cell2 = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
    
    // Swap the values
    const temp = gameState.subGrids[cell1.gridIdx][cell1.row][cell1.col];
    gameState.subGrids[cell1.gridIdx][cell1.row][cell1.col] = 
      gameState.subGrids[cell2.gridIdx][cell2.row][cell2.col];
    gameState.subGrids[cell2.gridIdx][cell2.row][cell2.col] = temp;
    
    return {
      type: 'swapCells',
      cell1: { gridIdx: cell1.gridIdx, row: cell1.row, col: cell1.col },
      cell2: { gridIdx: cell2.gridIdx, row: cell2.row, col: cell2.col },
      message: `🔄 Hazard Zone! Two adjacent cells have been SWAPPED!`
    };
  }

  /**
   * Clear a random cell
   */
  static clearRandomCell(gameState) {
    const cellsWithMarks = [];
    
    // Find all cells with marks
    for (let gridIdx = 0; gridIdx < 9; gridIdx++) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (gameState.subGrids[gridIdx][row][col]) {
            cellsWithMarks.push({ gridIdx, row, col });
          }
        }
      }
    }
    
    if (cellsWithMarks.length === 0) {
      return null;
    }
    
    const cellToClear = cellsWithMarks[Math.floor(Math.random() * cellsWithMarks.length)];
    const clearedValue = gameState.subGrids[cellToClear.gridIdx][cellToClear.row][cellToClear.col];
    
    // Clear the cell
    gameState.subGrids[cellToClear.gridIdx][cellToClear.row][cellToClear.col] = '';
    
    return {
      type: 'clearCell',
      gridIdx: cellToClear.gridIdx,
      row: cellToClear.row,
      col: cellToClear.col,
      clearedValue,
      message: `💨 Hazard Zone! A ${clearedValue} mark has been CLEARED!`
    };
  }

  /**
   * Get adjacent cells in the same sub-grid
   */
  static getAdjacentCells(gridIdx, row, col, gameState) {
    const adjacent = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // orthogonal
      [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
    ];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        if (gameState.subGrids[gridIdx][newRow][newCol]) {
          adjacent.push({ gridIdx, row: newRow, col: newCol });
        }
      }
    }
    
    return adjacent;
  }

  /**
   * Check if a move is blocked by locked grid
   */
  static isGridLocked(gameState, gridIdx) {
    if (!gameState.lockedGrids) {
      return false;
    }
    return gameState.lockedGrids.includes(gridIdx);
  }
}

module.exports = HazardLogic;
