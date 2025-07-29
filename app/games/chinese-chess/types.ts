export type XiangqiPieceType =
  | "general"
  | "advisor"
  | "elephant"
  | "horse"
  | "chariot"
  | "cannon"
  | "soldier";

export type XiangqiPieceColor = "red" | "black";

export interface XiangqiPiece {
  type: XiangqiPieceType;
  color: XiangqiPieceColor;
}

export interface XiangqiPosition {
  row: number;
  col: number;
}

export interface XiangqiMove {
  from: XiangqiPosition;
  to: XiangqiPosition;
  piece: XiangqiPiece;
  captured?: XiangqiPiece;
}

export type XiangqiBoard = (XiangqiPiece | null)[][];

export interface XiangqiGameState {
  board: XiangqiBoard;
  currentPlayer: XiangqiPieceColor;
  selectedSquare: XiangqiPosition | null;
  gameStatus: "playing" | "check" | "checkmate" | "stalemate" | "draw";
  winner: XiangqiPieceColor | null;
  capturedPieces: {
    red: XiangqiPiece[];
    black: XiangqiPiece[];
  };
  moveHistory: XiangqiMove[];
  aiDifficulty: "easy" | "medium" | "hard";
  gameMode: "human-vs-human" | "human-vs-ai";
}

export const PIECE_NAMES = {
  red: {
    general: "帥",
    advisor: "仕",
    elephant: "相",
    horse: "馬",
    chariot: "車",
    cannon: "砲",
    soldier: "兵",
  },
  black: {
    general: "將",
    advisor: "士",
    elephant: "象",
    horse: "馬",
    chariot: "車",
    cannon: "炮",
    soldier: "卒",
  },
} as const;
