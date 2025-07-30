export type Color = "white" | "black";

export type Piece = {
  color: Color;
  isKing: boolean;
} | null;

export type Position = {
  row: number;
  col: number;
};

export type GameMode = "pvp" | "ai-easy" | "ai-medium" | "ai-hard";
