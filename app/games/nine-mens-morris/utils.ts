import { Player, GameState, Position, GamePhase } from "./types";

export const POSITIONS: Position[] = [
  { x: 0, y: 0, connections: [1, 9] },
  { x: 3, y: 0, connections: [0, 2, 4] },
  { x: 6, y: 0, connections: [1, 14] },
  { x: 1, y: 1, connections: [4, 10] },
  { x: 3, y: 1, connections: [1, 3, 5, 7] },
  { x: 5, y: 1, connections: [4, 13] },
  { x: 2, y: 2, connections: [7, 11] },
  { x: 3, y: 2, connections: [4, 6, 8] },
  { x: 4, y: 2, connections: [7, 12] },
  { x: 0, y: 3, connections: [0, 10, 21] },
  { x: 1, y: 3, connections: [3, 9, 11, 18] },
  { x: 2, y: 3, connections: [6, 10, 12, 15] },
  { x: 4, y: 3, connections: [8, 11, 13, 17] },
  { x: 5, y: 3, connections: [5, 12, 14, 20] },
  { x: 6, y: 3, connections: [2, 13, 23] },
  { x: 2, y: 4, connections: [11, 16] },
  { x: 3, y: 4, connections: [15, 17, 19] },
  { x: 4, y: 4, connections: [12, 16, 20] },
  { x: 1, y: 5, connections: [10, 19] },
  { x: 3, y: 5, connections: [16, 18, 20, 22] },
  { x: 5, y: 5, connections: [13, 17, 19] },
  { x: 0, y: 6, connections: [9, 22] },
  { x: 3, y: 6, connections: [19, 21, 23] },
  { x: 6, y: 6, connections: [14, 22] },
];

export const MILLS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
  [12, 13, 14],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],
  [0, 9, 21],
  [3, 10, 18],
  [6, 11, 15],
  [1, 4, 7],
  [16, 19, 22],
  [8, 12, 17],
  [5, 13, 20],
  [2, 14, 23],
];

export const createInitialGameState = (): GameState => ({
  board: new Array(24).fill(null),
  currentPlayer: "white",
  phase: "placing",
  whitePieces: 9,
  blackPieces: 9,
  whiteOnBoard: 0,
  blackOnBoard: 0,
  selectedPosition: null,
  gameOver: false,
  winner: null,
  lastMove: null,
});

export const checkMill = (
  board: (Player | null)[],
  position: number,
  player: Player
): boolean => {
  return MILLS.some(
    (mill) =>
      mill.includes(position) && mill.every((pos) => board[pos] === player)
  );
};

export const getRemovablePieces = (
  board: (Player | null)[],
  opponent: Player
): number[] => {
  const isRemovable = (idx: number) => {
    if (board[idx] !== opponent) return false;
    const inMill = checkMill(board, idx, opponent);
    if (!inMill) return true;
    return board.every(
      (piece, i) => piece !== opponent || checkMill(board, i, opponent)
    );
  };

  return board
    .map((piece, idx) => (isRemovable(idx) ? idx : -1))
    .filter((i) => i !== -1);
};

export const isValidMove = (
  gameState: GameState,
  from: number | undefined,
  to: number
): boolean => {
  const { board, phase } = gameState;
  if (board[to] !== null) return false;

  if (phase === "placing") return from === undefined;
  if (phase === "moving")
    return from !== undefined && POSITIONS[from].connections.includes(to);
  if (phase === "flying") return from !== undefined;

  return false;
};

export const getGamePhase = (gameState: GameState): GamePhase => {
  if (gameState.whitePieces > 0 || gameState.blackPieces > 0) return "placing";

  const currentOnBoard =
    gameState.currentPlayer === "white"
      ? gameState.whiteOnBoard
      : gameState.blackOnBoard;
  return currentOnBoard === 3 ? "flying" : "moving";
};

export const hasValidMoves = (
  gameState: GameState,
  player: Player
): boolean => {
  const { board } = gameState;
  const phase = getGamePhase(gameState);

  if (phase === "placing") return board.includes(null);

  const playerPositions = board
    .map((p, i) => (p === player ? i : -1))
    .filter((i) => i !== -1);

  if (phase === "flying") return board.some((p) => p === null);

  return playerPositions.some((pos) =>
    POSITIONS[pos].connections.some((conn) => board[conn] === null)
  );
};

export const checkGameOver = (
  gameState: GameState
): { gameOver: boolean; winner: Player | null } => {
  if (gameState.phase !== "placing") {
    if (gameState.whiteOnBoard < 3) return { gameOver: true, winner: "black" };
    if (gameState.blackOnBoard < 3) return { gameOver: true, winner: "white" };
  }

  if (!hasValidMoves(gameState, gameState.currentPlayer)) {
    const winner = gameState.currentPlayer === "white" ? "black" : "white";
    return { gameOver: true, winner };
  }

  return { gameOver: false, winner: null };
};

export const makeMove = (
  gameState: GameState,
  from: number | undefined,
  to: number
): GameState => {
  if (!isValidMove(gameState, from, to)) return gameState;

  const newBoard = [...gameState.board];
  const { currentPlayer, phase } = gameState;

  if (phase === "placing") {
    newBoard[to] = currentPlayer;
  } else if (from !== undefined) {
    newBoard[from] = null;
    newBoard[to] = currentPlayer;
  }

  const whitePieces =
    currentPlayer === "white" && phase === "placing"
      ? gameState.whitePieces - 1
      : gameState.whitePieces;
  const blackPieces =
    currentPlayer === "black" && phase === "placing"
      ? gameState.blackPieces - 1
      : gameState.blackPieces;
  const whiteOnBoard =
    currentPlayer === "white"
      ? gameState.whiteOnBoard + (phase === "placing" ? 1 : 0)
      : gameState.whiteOnBoard;
  const blackOnBoard =
    currentPlayer === "black"
      ? gameState.blackOnBoard + (phase === "placing" ? 1 : 0)
      : gameState.blackOnBoard;

  const newState: GameState = {
    ...gameState,
    board: newBoard,
    whitePieces,
    blackPieces,
    whiteOnBoard,
    blackOnBoard,
    selectedPosition: null,
    lastMove: { from, to },
  };

  newState.phase = getGamePhase(newState);

  if (!checkMill(newBoard, to, currentPlayer)) {
    newState.currentPlayer = currentPlayer === "white" ? "black" : "white";
  }

  const result = checkGameOver(newState);
  newState.gameOver = result.gameOver;
  newState.winner = result.winner;

  return newState;
};

export const removePiece = (
  gameState: GameState,
  position: number
): GameState => {
  const newBoard = [...gameState.board];
  const removed = newBoard[position];
  if (!removed) return gameState;

  newBoard[position] = null;

  const newState: GameState = {
    ...gameState,
    board: newBoard,
    whiteOnBoard:
      removed === "white" ? gameState.whiteOnBoard - 1 : gameState.whiteOnBoard,
    blackOnBoard:
      removed === "black" ? gameState.blackOnBoard - 1 : gameState.blackOnBoard,
    currentPlayer: gameState.currentPlayer === "white" ? "black" : "white",
    lastMove: gameState.lastMove
      ? { ...gameState.lastMove, removed: position }
      : null,
  };

  newState.phase = getGamePhase(newState);

  const result = checkGameOver(newState);
  newState.gameOver = result.gameOver;
  newState.winner = result.winner;

  return newState;
};

export const makeAIMove = (
  gameState: GameState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  difficulty: "easy" | "medium" | "hard"
): GameState => {
  const { board, phase, currentPlayer } = gameState;

  if (gameState.gameOver) return gameState;

  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : -1))
    .filter((idx) => idx !== -1);
  const playerPositions = board
    .map((p, i) => (p === currentPlayer ? i : -1))
    .filter((i) => i !== -1);

  if (phase === "placing") {
    if (emptyIndices.length === 0) return gameState;
    const to = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    return makeMove(gameState, undefined, to);
  }

  if (phase === "flying") {
    if (playerPositions.length === 0 || emptyIndices.length === 0)
      return gameState;

    for (const from of playerPositions) {
      for (const to of emptyIndices) {
        const result = makeMove(gameState, from, to);
        if (result !== gameState) return result;
      }
    }
  }

  if (phase === "moving") {
    for (const from of playerPositions) {
      const connections = POSITIONS[from].connections;
      const validMoves = connections.filter((conn) => board[conn] === null);

      for (const to of validMoves) {
        const result = makeMove(gameState, from, to);
        if (result !== gameState) return result;
      }
    }
  }

  return gameState;
};
