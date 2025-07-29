import {
  XiangqiPiece,
  XiangqiPieceColor,
  XiangqiBoard,
  XiangqiPosition,
  XiangqiMove,
  PIECE_NAMES,
} from "./types";

export function initializeXiangqiBoard(): XiangqiBoard {
  return [
    [
      { type: "chariot", color: "black" },
      { type: "horse", color: "black" },
      { type: "elephant", color: "black" },
      { type: "advisor", color: "black" },
      { type: "general", color: "black" },
      { type: "advisor", color: "black" },
      { type: "elephant", color: "black" },
      { type: "horse", color: "black" },
      { type: "chariot", color: "black" },
    ],
    [null, null, null, null, null, null, null, null, null],
    [
      null,
      { type: "cannon", color: "black" },
      null,
      null,
      null,
      null,
      null,
      { type: "cannon", color: "black" },
      null,
    ],
    [
      { type: "soldier", color: "black" },
      null,
      { type: "soldier", color: "black" },
      null,
      { type: "soldier", color: "black" },
      null,
      { type: "soldier", color: "black" },
      null,
      { type: "soldier", color: "black" },
    ],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [
      { type: "soldier", color: "red" },
      null,
      { type: "soldier", color: "red" },
      null,
      { type: "soldier", color: "red" },
      null,
      { type: "soldier", color: "red" },
      null,
      { type: "soldier", color: "red" },
    ],
    [
      null,
      { type: "cannon", color: "red" },
      null,
      null,
      null,
      null,
      null,
      { type: "cannon", color: "red" },
      null,
    ],
    [null, null, null, null, null, null, null, null, null],
    [
      { type: "chariot", color: "red" },
      { type: "horse", color: "red" },
      { type: "elephant", color: "red" },
      { type: "advisor", color: "red" },
      { type: "general", color: "red" },
      { type: "advisor", color: "red" },
      { type: "elephant", color: "red" },
      { type: "horse", color: "red" },
      { type: "chariot", color: "red" },
    ],
  ];
}

export function getPieceCharacter(piece: XiangqiPiece): string {
  return PIECE_NAMES[piece.color][piece.type];
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 10 && col >= 0 && col < 9;
}

export function isInPalace(
  row: number,
  col: number,
  color: XiangqiPieceColor
): boolean {
  const palaceRows = color === "red" ? [7, 8, 9] : [0, 1, 2];
  const palaceCols = [3, 4, 5];
  return palaceRows.includes(row) && palaceCols.includes(col);
}

export function isOnOwnSide(row: number, color: XiangqiPieceColor): boolean {
  return color === "red" ? row >= 5 : row <= 4;
}

export function hasCrossedRiver(
  row: number,
  color: XiangqiPieceColor
): boolean {
  return color === "red" ? row <= 4 : row >= 5;
}

export function getPossibleMoves(
  board: XiangqiBoard,
  position: XiangqiPosition,
  piece: XiangqiPiece
): XiangqiPosition[] {
  const moves: XiangqiPosition[] = [];
  const { row, col } = position;

  switch (piece.type) {
    case "general":
      const generalMoves = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
      ];
      generalMoves.forEach((pos) => {
        if (
          isValidPosition(pos.row, pos.col) &&
          isInPalace(pos.row, pos.col, piece.color)
        ) {
          const target = board[pos.row][pos.col];
          if (!target || target.color !== piece.color) {
            moves.push(pos);
          }
        }
      });
      break;

    case "advisor":
      const advisorMoves = [
        { row: row - 1, col: col - 1 },
        { row: row - 1, col: col + 1 },
        { row: row + 1, col: col - 1 },
        { row: row + 1, col: col + 1 },
      ];
      advisorMoves.forEach((pos) => {
        if (
          isValidPosition(pos.row, pos.col) &&
          isInPalace(pos.row, pos.col, piece.color)
        ) {
          const target = board[pos.row][pos.col];
          if (!target || target.color !== piece.color) {
            moves.push(pos);
          }
        }
      });
      break;

    case "elephant":
      const elephantMoves = [
        {
          row: row - 2,
          col: col - 2,
          blocking: { row: row - 1, col: col - 1 },
        },
        {
          row: row - 2,
          col: col + 2,
          blocking: { row: row - 1, col: col + 1 },
        },
        {
          row: row + 2,
          col: col - 2,
          blocking: { row: row + 1, col: col - 1 },
        },
        {
          row: row + 2,
          col: col + 2,
          blocking: { row: row + 1, col: col + 1 },
        },
      ];
      elephantMoves.forEach((move) => {
        if (
          isValidPosition(move.row, move.col) &&
          isOnOwnSide(move.row, piece.color) &&
          !board[move.blocking.row][move.blocking.col]
        ) {
          const target = board[move.row][move.col];
          if (!target || target.color !== piece.color) {
            moves.push({ row: move.row, col: move.col });
          }
        }
      });
      break;

    case "horse":
      const horseMoves = [
        { row: row - 2, col: col - 1, blocking: { row: row - 1, col } },
        { row: row - 2, col: col + 1, blocking: { row: row - 1, col } },
        { row: row - 1, col: col - 2, blocking: { row, col: col - 1 } },
        { row: row - 1, col: col + 2, blocking: { row, col: col + 1 } },
        { row: row + 1, col: col - 2, blocking: { row, col: col - 1 } },
        { row: row + 1, col: col + 2, blocking: { row, col: col + 1 } },
        { row: row + 2, col: col - 1, blocking: { row: row + 1, col } },
        { row: row + 2, col: col + 1, blocking: { row: row + 1, col } },
      ];
      horseMoves.forEach((move) => {
        if (
          isValidPosition(move.row, move.col) &&
          !board[move.blocking.row][move.blocking.col]
        ) {
          const target = board[move.row][move.col];
          if (!target || target.color !== piece.color) {
            moves.push({ row: move.row, col: move.col });
          }
        }
      });
      break;

    case "chariot":
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      directions.forEach(([dr, dc]) => {
        for (let i = 1; i < 10; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;

          const target = board[newRow][newCol];
          if (target) {
            if (target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          moves.push({ row: newRow, col: newCol });
        }
      });
      break;

    case "cannon":
      const cannonDirections = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      cannonDirections.forEach(([dr, dc]) => {
        let foundScreen = false;
        for (let i = 1; i < 10; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;

          const target = board[newRow][newCol];
          if (!foundScreen) {
            if (target) {
              foundScreen = true;
            } else {
              moves.push({ row: newRow, col: newCol });
            }
          } else {
            if (target) {
              if (target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        }
      });
      break;

    case "soldier":
      const forward = piece.color === "red" ? -1 : 1;
      const forwardPos = { row: row + forward, col };

      if (isValidPosition(forwardPos.row, forwardPos.col)) {
        const target = board[forwardPos.row][forwardPos.col];
        if (!target || target.color !== piece.color) {
          moves.push(forwardPos);
        }
      }

      if (hasCrossedRiver(row, piece.color)) {
        const sideMoves = [
          { row, col: col - 1 },
          { row, col: col + 1 },
        ];
        sideMoves.forEach((pos) => {
          if (isValidPosition(pos.row, pos.col)) {
            const target = board[pos.row][pos.col];
            if (!target || target.color !== piece.color) {
              moves.push(pos);
            }
          }
        });
      }
      break;
  }

  return moves;
}

export function findGeneral(
  board: XiangqiBoard,
  color: XiangqiPieceColor
): XiangqiPosition | null {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "general" && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function areGeneralsFacing(board: XiangqiBoard): boolean {
  const redGeneral = findGeneral(board, "red");
  const blackGeneral = findGeneral(board, "black");

  if (!redGeneral || !blackGeneral) return false;

  if (redGeneral.col !== blackGeneral.col) return false;

  const minRow = Math.min(redGeneral.row, blackGeneral.row);
  const maxRow = Math.max(redGeneral.row, blackGeneral.row);

  for (let row = minRow + 1; row < maxRow; row++) {
    if (board[row][redGeneral.col] !== null) {
      return false;
    }
  }

  return true;
}

export function isInCheck(
  board: XiangqiBoard,
  color: XiangqiPieceColor
): boolean {
  const generalPos = findGeneral(board, color);
  if (!generalPos) return false;

  const opponentColor = color === "red" ? "black" : "red";

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const possibleMoves = getPossibleMoves(board, { row, col }, piece);
        if (
          possibleMoves.some(
            (move) => move.row === generalPos.row && move.col === generalPos.col
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function applyMove(
  board: XiangqiBoard,
  from: XiangqiPosition,
  to: XiangqiPosition
): XiangqiBoard {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[from.row][from.col];
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  return newBoard;
}

export function getValidMoves(
  board: XiangqiBoard,
  position: XiangqiPosition,
  piece: XiangqiPiece
): XiangqiPosition[] {
  const possibleMoves = getPossibleMoves(board, position, piece);
  const validMoves: XiangqiPosition[] = [];

  possibleMoves.forEach((move) => {
    const newBoard = applyMove(board, position, move);

    if (isInCheck(newBoard, piece.color)) {
      return;
    }

    if (areGeneralsFacing(newBoard)) {
      return;
    }

    validMoves.push(move);
  });

  return validMoves;
}

export function isCheckmate(
  board: XiangqiBoard,
  color: XiangqiPieceColor
): boolean {
  if (!isInCheck(board, color)) return false;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, { row, col }, piece);
        if (validMoves.length > 0) {
          return false;
        }
      }
    }
  }

  return true;
}

export function isStalemate(
  board: XiangqiBoard,
  color: XiangqiPieceColor
): boolean {
  if (isInCheck(board, color)) return false;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, { row, col }, piece);
        if (validMoves.length > 0) {
          return false;
        }
      }
    }
  }

  return true;
}

export function selectAIMove(
  board: XiangqiBoard,
  color: XiangqiPieceColor,
  difficulty: "easy" | "medium" | "hard"
): XiangqiMove | null {
  const allMoves: XiangqiMove[] = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, { row, col }, piece);
        validMoves.forEach((move) => {
          allMoves.push({
            from: { row, col },
            to: move,
            piece,
            captured: board[move.row][move.col] || undefined,
          });
        });
      }
    }
  }

  if (allMoves.length === 0) return null;

  if (difficulty === "easy") {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // For medium and hard, prefer capturing moves
  const capturingMoves = allMoves.filter((move) => move.captured);
  if (
    capturingMoves.length > 0 &&
    Math.random() < (difficulty === "hard" ? 0.8 : 0.6)
  ) {
    return capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
  }

  return allMoves[Math.floor(Math.random() * allMoves.length)];
}
