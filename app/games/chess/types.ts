export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type Color = "white" | "black";
export type Piece = {
  type: PieceType;
  color: Color;
} | null;

export type GameMode = "pvp" | "ai-easy" | "ai-medium" | "ai-hard";

export type Position = { row: number; col: number };

export type Move = {
  from: Position;
  to: Position;
  piece: Piece;
  score?: number;
};
