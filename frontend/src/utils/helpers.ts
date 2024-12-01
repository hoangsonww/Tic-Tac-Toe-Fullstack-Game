/**
 * Calculate the winner of the game
 * @param board - 2D array representing the game board
 */
export const calculateWinner = (board: string[][]): string | null => {
  const boardSize = board.length;

  // Check rows for a winner
  for (let row = 0; row < boardSize; row++) {
    if (board[row].every((cell) => cell === board[row][0] && cell !== "")) {
      return board[row][0];
    }
  }

  // Check columns for a winner
  for (let col = 0; col < boardSize; col++) {
    if (board.every((row) => row[col] === board[0][col] && row[col] !== "")) {
      return board[0][col];
    }
  }

  // Check main diagonal for a winner
  if (
    board.every((row, index) => row[index] === board[0][0] && row[index] !== "")
  ) {
    return board[0][0];
  }

  // Check anti-diagonal for a winner
  if (
    board.every(
      (row, index) =>
        row[boardSize - index - 1] === board[0][boardSize - 1] &&
        row[boardSize - index - 1] !== "",
    )
  ) {
    return board[0][boardSize - 1];
  }

  // No winner found
  return null;
};

/**
 * Check if the board is full
 * @param board - 2D array representing the game board
 */
export const isBoardFull = (board: string[][]): boolean => {
  return board.every((row) => row.every((cell) => cell !== ""));
};
