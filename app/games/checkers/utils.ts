import { Piece, Position } from "./types";

const PIECE_VALUES = {
  normal: 10,
  king: 20,
};

const POSITION_VALUES = [
  [0, 4, 0, 4, 0, 4, 0, 4],
  [4, 0, 3, 0, 3, 0, 3, 0],
  [0, 3, 0, 2, 0, 2, 0, 4],
  [4, 0, 2, 0, 1, 0, 3, 0],
  [0, 3, 0, 1, 0, 2, 0, 4],
  [4, 0, 2, 0, 2, 0, 3, 0],
  [0, 3, 0, 3, 0, 3, 0, 4],
  [4, 0, 4, 0, 4, 0, 4, 0],
];

export const evaluateBoard = (
  board: Piece[][],
  color: "black" | "white"
): number => {
  let score = 0;
  const multiplier = color === "black" ? 1 : -1;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = piece.isKing
          ? PIECE_VALUES.king
          : PIECE_VALUES.normal;
        const positionValue = POSITION_VALUES[row][col];
        const value =
          (pieceValue + positionValue) * (piece.color === color ? 1 : -1);
        score += value;
      }
    }
  }

  return score * multiplier;
};

export const minimax = (
  board: Piece[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  color: "black" | "white"
): number => {
  if (depth === 0) {
    return evaluateBoard(board, color);
  }

  const moves = getAllPossibleMoves(
    board,
    isMaximizing ? color : color === "black" ? "white" : "black"
  );

  if (moves.length === 0) {
    return isMaximizing ? -1000 : 1000;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeTestMove(board, move.from, move.to);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, color);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeTestMove(board, move.from, move.to);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, color);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getBestMove = (
  board: Piece[][],
  color: "black" | "white",
  difficulty: "easy" | "medium" | "hard"
): { from: Position; to: Position } | null => {
  const moves = getAllPossibleMoves(board, color);
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === "medium") {
    const jumpMoves = moves.filter(
      (move) => Math.abs(move.from.row - move.to.row) === 2
    );
    const kingMoves = moves.filter(
      (move) => board[move.from.row][move.from.col]?.isKing
    );

    if (jumpMoves.length > 0) {
      return jumpMoves[Math.floor(Math.random() * jumpMoves.length)];
    }
    if (kingMoves.length > 0) {
      return kingMoves[Math.floor(Math.random() * kingMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const newBoard = makeTestMove(board, move.from, move.to);
    const score = minimax(newBoard, 4, -Infinity, Infinity, false, color);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const makeTestMove = (
  board: Piece[][],
  from: Position,
  to: Position
): Piece[][] => {
  const newBoard = board.map((row) =>
    row.map((piece) => (piece ? { ...piece } : null))
  );

  const piece = newBoard[from.row][from.col];
  if (!piece) return newBoard;

  const newPiece = {
    color: piece.color,
    isKing:
      piece.isKing ||
      (piece.color === "white" && to.row === 0) ||
      (piece.color === "black" && to.row === 7),
  };

  newBoard[to.row][to.col] = newPiece;
  newBoard[from.row][from.col] = null;

  if (Math.abs(to.row - from.row) === 2) {
    const midRow = (from.row + to.row) / 2;
    const midCol = (from.col + to.col) / 2;
    newBoard[midRow][midCol] = null;
  }

  return newBoard;
};

const getAllPossibleMoves = (
  board: Piece[][],
  color: "black" | "white"
): { from: Position; to: Position }[] => {
  const moves: { from: Position; to: Position }[] = [];
  const mustJump = checkMustJump(board, color);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === color) {
        const pieceMoves = getValidMoves(piece, row, col, board);
        if (mustJump) {
          const jumpMoves = pieceMoves.filter(
            (m) => Math.abs(m.row - row) === 2
          );
          jumpMoves.forEach((move) => {
            moves.push({ from: { row, col }, to: move });
          });
        } else {
          pieceMoves.forEach((move) => {
            moves.push({ from: { row, col }, to: move });
          });
        }
      }
    }
  }

  return moves;
};

export const getValidMoves = (
  piece: Piece,
  row: number,
  col: number,
  board: Piece[][]
): Position[] => {
  if (!piece) return [];

  const moves: Position[] = [];
  const directions = piece.isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : piece.color === "black"
    ? [
        [1, -1],
        [1, 1],
      ]
    : [
        [-1, -1],
        [-1, 1],
      ];

  for (const [dx, dy] of directions) {
    const newRow = row + dx;
    const newCol = col + dy;

    if (
      newRow >= 0 &&
      newRow < 8 &&
      newCol >= 0 &&
      newCol < 8 &&
      !board[newRow][newCol]
    ) {
      moves.push({ row: newRow, col: newCol });
    }
  }

  for (const [dx, dy] of directions) {
    const jumpRow = row + dx * 2;
    const jumpCol = col + dy * 2;
    const midRow = row + dx;
    const midCol = col + dy;

    if (
      jumpRow >= 0 &&
      jumpRow < 8 &&
      jumpCol >= 0 &&
      jumpCol < 8 &&
      board[midRow][midCol] &&
      board[midRow][midCol]?.color !== piece.color &&
      !board[jumpRow][jumpCol]
    ) {
      moves.push({ row: jumpRow, col: jumpCol });
    }
  }

  return moves;
};

export const checkMustJump = (
  board: Piece[][],
  player: "black" | "white"
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === player && canJump(piece, row, col, board)) {
        return true;
      }
    }
  }
  return false;
};

export const canJump = (
  piece: Piece,
  row: number,
  col: number,
  board: Piece[][]
): boolean => {
  if (!piece) return false;

  const directions = piece.isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : piece.color === "black"
    ? [
        [1, -1],
        [1, 1],
      ]
    : [
        [-1, -1],
        [-1, 1],
      ];

  for (const [dx, dy] of directions) {
    const jumpRow = row + dx * 2;
    const jumpCol = col + dy * 2;
    const midRow = row + dx;
    const midCol = col + dy;

    if (
      jumpRow >= 0 &&
      jumpRow < 8 &&
      jumpCol >= 0 &&
      jumpCol < 8 &&
      board[midRow][midCol] &&
      board[midRow][midCol]?.color !== piece.color &&
      !board[jumpRow][jumpCol]
    ) {
      return true;
    }
  }

  return false;
};

export const hasValidMoves = (
  currentPlayer: "black" | "white",
  board: Piece[][]
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        const moves = getValidMoves(piece, row, col, board);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
};
