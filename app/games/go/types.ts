export type GoStone = "black" | "white" | null;
export type GoPlayer = "black" | "white";

export interface GoPosition {
  row: number;
  col: number;
}

export interface GoCapture {
  stones: GoPosition[];
  capturedBy: GoPlayer;
}

export interface GoMove {
  position: GoPosition;
  player: GoPlayer;
  capturedStones: GoPosition[];
}

export interface GoGameState {
  board: GoStone[][];
  currentPlayer: GoPlayer;
  capturedStones: {
    black: number;
    white: number;
  };
  moveHistory: GoMove[];
  gameStatus: "playing" | "finished" | "counting";
  lastMove: GoPosition | null;
  koPosition: GoPosition | null;
  passCount: number;
  territory: {
    black: number;
    white: number;
    neutral: number;
  };
  finalScore: {
    black: number;
    white: number;
  } | null;
  boardSize: 9 | 13 | 19;
}

export interface GoGroup {
  positions: GoPosition[];
  liberties: GoPosition[];
  color: GoPlayer;
}
