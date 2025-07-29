import { Piece, Color, Position } from "./types";

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

export const getPossibleMoves = (
  piece: Piece,
  fromRow: number,
  fromCol: number,
  board: Piece[][]
): Position[] => {
  if (!piece) return [];

  const moves: Position[] = [];
  const { type, color } = piece;

  switch (type) {
    case "pawn":
      const direction = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;

      if (
        isValidPosition(fromRow + direction, fromCol) &&
        !board[fromRow + direction][fromCol]
      ) {
        moves.push({ row: fromRow + direction, col: fromCol });

        if (fromRow === startRow && !board[fromRow + 2 * direction][fromCol]) {
          moves.push({ row: fromRow + 2 * direction, col: fromCol });
        }
      }

      for (const colOffset of [-1, 1]) {
        const newRow = fromRow + direction;
        const newCol = fromCol + colOffset;
        if (isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol];
          if (targetPiece && targetPiece.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;

    case "rook":
      const rookDirections = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dRow, dCol] of rookDirections) {
        for (let i = 1; i < 8; i++) {
          const newRow = fromRow + i * dRow;
          const newCol = fromCol + i * dCol;
          if (!isValidPosition(newRow, newCol)) break;

          const targetPiece = board[newRow][newCol];
          if (!targetPiece) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (targetPiece.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
        }
      }
      break;

    case "bishop":
      const bishopDirections = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dRow, dCol] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
          const newRow = fromRow + i * dRow;
          const newCol = fromCol + i * dCol;
          if (!isValidPosition(newRow, newCol)) break;

          const targetPiece = board[newRow][newCol];
          if (!targetPiece) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (targetPiece.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
        }
      }
      break;

    case "knight":
      const knightMoves = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      for (const [dRow, dCol] of knightMoves) {
        const newRow = fromRow + dRow;
        const newCol = fromCol + dCol;
        if (isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol];
          if (!targetPiece || targetPiece.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;

    case "queen":
      const queenDirections = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dRow, dCol] of queenDirections) {
        for (let i = 1; i < 8; i++) {
          const newRow = fromRow + i * dRow;
          const newCol = fromCol + i * dCol;
          if (!isValidPosition(newRow, newCol)) break;

          const targetPiece = board[newRow][newCol];
          if (!targetPiece) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (targetPiece.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
        }
      }
      break;

    case "king":
      const kingMoves = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      for (const [dRow, dCol] of kingMoves) {
        const newRow = fromRow + dRow;
        const newCol = fromCol + dCol;
        if (isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol];
          if (!targetPiece || targetPiece.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;
  }

  return moves;
};

export const isInCheck = (board: Piece[][], kingColor: Color): boolean => {
  let kingPos: Position | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.color === kingColor) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== kingColor) {
        const moves = getPossibleMoves(piece, row, col, board);
        if (
          moves.some(
            (move) => move.row === kingPos!.row && move.col === kingPos!.col
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

export const getValidMoves = (
  piece: Piece,
  fromRow: number,
  fromCol: number,
  board: Piece[][]
): Position[] => {
  if (!piece) return [];

  const possibleMoves = getPossibleMoves(piece, fromRow, fromCol, board);
  const validMoves: Position[] = [];

  if (piece.type === "king") {
    const color = piece.color;
    if (!isInCheck(board, color) && fromRow === (color === "white" ? 7 : 0)) {
      if (
        board[fromRow][fromCol + 3] &&
        board[fromRow][fromCol + 3]!.type === "rook" &&
        board[fromRow][fromCol + 3]!.color === color &&
        !board[fromRow][fromCol + 1] &&
        !board[fromRow][fromCol + 2]
      ) {
        const testBoard1 = board.map((row) => [...row]);
        testBoard1[fromRow][fromCol + 1] = testBoard1[fromRow][fromCol];
        testBoard1[fromRow][fromCol] = null;

        const testBoard2 = board.map((row) => [...row]);
        testBoard2[fromRow][fromCol + 2] = testBoard2[fromRow][fromCol];
        testBoard2[fromRow][fromCol] = null;

        if (!isInCheck(testBoard1, color) && !isInCheck(testBoard2, color)) {
          possibleMoves.push({ row: fromRow, col: fromCol + 2 });
        }
      }

      if (
        board[fromRow][fromCol - 4] &&
        board[fromRow][fromCol - 4]!.type === "rook" &&
        board[fromRow][fromCol - 4]!.color === color &&
        !board[fromRow][fromCol - 1] &&
        !board[fromRow][fromCol - 2] &&
        !board[fromRow][fromCol - 3]
      ) {
        const testBoard1 = board.map((row) => [...row]);
        testBoard1[fromRow][fromCol - 1] = testBoard1[fromRow][fromCol];
        testBoard1[fromRow][fromCol] = null;

        const testBoard2 = board.map((row) => [...row]);
        testBoard2[fromRow][fromCol - 2] = testBoard2[fromRow][fromCol];
        testBoard2[fromRow][fromCol] = null;

        if (!isInCheck(testBoard1, color) && !isInCheck(testBoard2, color)) {
          possibleMoves.push({ row: fromRow, col: fromCol - 2 });
        }
      }
    }
  }

  for (const move of possibleMoves) {
    const testBoard = board.map((row) => [...row]);
    testBoard[move.row][move.col] = testBoard[fromRow][fromCol];
    testBoard[fromRow][fromCol] = null;

    if (!isInCheck(testBoard, piece.color)) {
      validMoves.push(move);
    }
  }

  return validMoves;
};

export const findKing = (board: Piece[][], color: Color): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};
