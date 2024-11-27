export const getAIMove = (
  board: string[][],
  difficulty: "easy" | "medium" | "hard" | "impossible",
): { row: number; col: number } | null => {
  const boardSize = board.length;
  const emptyCells: { row: number; col: number }[] = [];

  // Find all empty cells
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === "") emptyCells.push({ row: i, col: j });
    }
  }

  if (emptyCells.length === 0) return null; // No moves available

  if (difficulty === "easy") {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  if (difficulty === "medium") {
    if (Math.random() < 0.5)
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return findBestMove(board, "O") || emptyCells[0];
  }

  if (difficulty === "hard") {
    return findBestMove(board, "O") || emptyCells[0];
  }

  // Impossible: Perfect AI
  return findBestMove(board, "O");
};

const findBestMove = (
  board: string[][],
  player: "X" | "O",
): { row: number; col: number } | null => {
  const opponent = player === "X" ? "O" : "X";
  const boardSize = board.length;

  // Check if we can win in one move
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === "") {
        board[i][j] = player;
        if (calculateWinner(board) === player) {
          board[i][j] = ""; // Undo move
          return { row: i, col: j };
        }
        board[i][j] = ""; // Undo move
      }
    }
  }

  // Check if we need to block the opponent from winning
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === "") {
        board[i][j] = opponent;
        if (calculateWinner(board) === opponent) {
          board[i][j] = ""; // Undo move
          return { row: i, col: j };
        }
        board[i][j] = ""; // Undo move
      }
    }
  }

  // If no immediate win or block, pick the first available cell
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === "") {
        return { row: i, col: j };
      }
    }
  }

  return null;
};

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
  if (board.every((row, idx) => row[idx] === board[0][0] && row[idx] !== "")) {
    return board[0][0];
  }

  // Check anti-diagonal for a winner
  if (
    board.every(
      (row, idx) =>
        row[boardSize - idx - 1] === board[0][boardSize - 1] &&
        row[boardSize - idx - 1] !== "",
    )
  ) {
    return board[0][boardSize - 1];
  }

  // No winner found
  return null;
};
