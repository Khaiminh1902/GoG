import {
  GoStone,
  GoPosition,
  GoGroup,
  GoGameState,
  GoMove,
  GoPlayer,
} from "./types";

export function initializeGoBoard(size: number): GoStone[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export function isValidPosition(
  row: number,
  col: number,
  boardSize: number
): boolean {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

export function findGroups(board: GoStone[][], size: number): GoGroup[] {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  const groups: GoGroup[] = [];

  function dfs(row: number, col: number, color: GoStone): GoGroup {
    const stack = [{ row, col }];
    const positions: GoPosition[] = [];
    const liberties: GoPosition[] = [];

    while (stack.length) {
      const { row: r, col: c } = stack.pop()!;

      if (
        !isValidPosition(r, c, size) ||
        visited[r][c] ||
        board[r][c] !== color
      ) {
        continue;
      }

      visited[r][c] = true;
      positions.push({ row: r, col: c });

      for (const { row: dr, col: dc } of directions) {
        const newRow = r + dr;
        const newCol = c + dc;

        if (isValidPosition(newRow, newCol, size)) {
          if (board[newRow][newCol] === null) {
            liberties.push({ row: newRow, col: newCol });
          } else if (
            !visited[newRow][newCol] &&
            board[newRow][newCol] === color
          ) {
            stack.push({ row: newRow, col: newCol });
          }
        }
      }
    }

    return { positions, liberties, color: color as "black" | "white" };
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!visited[row][col] && board[row][col] !== null) {
        const color = board[row][col];
        const group = dfs(row, col, color);
        groups.push(group);
      }
    }
  }

  return groups;
}

export function isCapturedGroup(group: GoGroup): boolean {
  return group.liberties.length === 0;
}

export function isValidMove(gameState: GoGameState, move: GoMove): boolean {
  const { board, koPosition } = gameState;
  const { position } = move;

  if (board[position.row][position.col] !== null) {
    return false;
  }

  if (
    koPosition &&
    position.row === koPosition.row &&
    position.col === koPosition.col
  ) {
    return false;
  }

  return true;
}

export function getRandomValidMove(
  gameState: GoGameState,
  player: GoPlayer
): GoMove | null {
  const { board, boardSize } = gameState;
  const validMoves: GoMove[] = [];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === null) {
        const potentialMove: GoMove = {
          position: { row, col },
          player,
          capturedStones: [],
        };
        if (isValidMove(gameState, potentialMove)) {
          validMoves.push(potentialMove);
        }
      }
    }
  }

  if (validMoves.length === 0) return null;

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

export function playMove(gameState: GoGameState, move: GoMove): GoGameState {
  const { board, currentPlayer, boardSize } = gameState;
  const { position, player } = move;

  if (board[position.row][position.col] !== null) {
    throw new Error("Invalid move: Position already occupied");
  }

  board[position.row][position.col] = player;

  const groups = findGroups(board, boardSize);
  const capturedPositions: GoPosition[] = [];

  for (const group of groups) {
    if (group.color !== player && isCapturedGroup(group)) {
      for (const stone of group.positions) {
        board[stone.row][stone.col] = null;
        capturedPositions.push(stone);
      }
    }
  }

  const newCapturedStones = { ...gameState.capturedStones };
  if (capturedPositions.length > 0) {
    newCapturedStones[player] += capturedPositions.length;
  }

  const newGameState: GoGameState = {
    ...gameState,
    board,
    currentPlayer:
      currentPlayer === "black" ? ("white" as const) : ("black" as const),
    capturedStones: newCapturedStones,
    moveHistory: [
      ...gameState.moveHistory,
      { ...move, capturedStones: capturedPositions },
    ],
    lastMove: position,
    koPosition: capturedPositions.length === 1 ? capturedPositions[0] : null, // Simple KO rule
    passCount:
      move.position.row === -1 && move.position.col === -1
        ? gameState.passCount + 1
        : 0,
  };

  return newGameState;
}
