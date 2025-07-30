export type Player = "white" | "black";

export type GamePhase = "placing" | "moving" | "flying";

export type GameMode = "pvp" | "ai-easy" | "ai-medium" | "ai-hard";

export interface Position {
  x: number;
  y: number;
  connections: number[];
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  phase: GamePhase;
  whitePieces: number;
  blackPieces: number;
  whiteOnBoard: number;
  blackOnBoard: number;
  selectedPosition: number | null;
  gameOver: boolean;
  winner: Player | null;
  lastMove: {
    from?: number;
    to?: number;
    removed?: number;
  } | null;
}
