"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Crown, Bot, Users } from "lucide-react";
import { Piece, Color, GameMode, Position } from "./types";
import { getValidMoves, canJump, hasValidMoves, getBestMove } from "./utils";

const initialBoard: Piece[][] = Array(8)
  .fill(null)
  .map((_, row) => {
    return Array(8)
      .fill(null)
      .map((_, col) => {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            return { color: "black", isKing: false };
          } else if (row > 4) {
            return { color: "white", isKing: false };
          }
        }
        return null;
      });
  });

const CheckersGame = () => {
  const [board, setBoard] = useState<Piece[][]>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Color>("white");
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing");
  const [winner, setWinner] = useState<Color | null>(null);

  const [capturedPieces, setCapturedPieces] = useState<{
    white: number;
    black: number;
  }>({ white: 0, black: 0 });

  const checkForWinner = useCallback(
    (board: Piece[][]) => {
      let whitePieces = 0;
      let blackPieces = 0;

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (board[row][col]?.color === "white") whitePieces++;
          if (board[row][col]?.color === "black") blackPieces++;
        }
      }

      if (whitePieces === 0) {
        setGameStatus("won");
        setWinner("black");
      } else if (blackPieces === 0) {
        setGameStatus("won");
        setWinner("white");
      } else if (!hasValidMoves(currentPlayer, board)) {
        setGameStatus("won");
        setWinner(currentPlayer === "white" ? "black" : "white");
      }
    },
    [currentPlayer]
  );

  const checkMustJump = useCallback((board: Piece[][], player: Color) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === player) {
          if (canJump(piece, row, col, board)) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const makeMove = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      const newBoard = board.map((row) =>
        row.map((piece) => (piece ? { ...piece } : null))
      );

      const piece = newBoard[fromRow][fromCol];
      if (!piece) return;

      const newPiece = {
        color: piece.color,
        isKing:
          piece.isKing ||
          (piece.color === "white" && toRow === 0) ||
          (piece.color === "black" && toRow === 7),
      };

      newBoard[toRow][toCol] = newPiece;
      newBoard[fromRow][fromCol] = null;

      if (Math.abs(toRow - fromRow) === 2) {
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        const capturedPiece = newBoard[midRow][midCol];
        if (capturedPiece) {
          setCapturedPieces((prev) => ({
            ...prev,
            [capturedPiece.color]: prev[capturedPiece.color] + 1,
          }));
          newBoard[midRow][midCol] = null;
        }
      }

      setBoard(newBoard);

      if (Math.abs(toRow - fromRow) === 2) {
        const jumpMoves = getValidMoves(
          newPiece,
          toRow,
          toCol,
          newBoard
        ).filter((move) => Math.abs(move.row - toRow) === 2);

        if (jumpMoves.length > 0) {
          setSelectedSquare({ row: toRow, col: toCol });
          setValidMoves(jumpMoves);
          return;
        }
      }

      setSelectedSquare(null);
      setValidMoves([]);
      const nextPlayer = currentPlayer === "white" ? "black" : "white";
      setCurrentPlayer(nextPlayer);

      setTimeout(() => {
        checkForWinner(newBoard);
      }, 0);
    },
    [board, currentPlayer, checkForWinner]
  );

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus === "won" || !gameMode) return;
    if (gameMode.startsWith("ai") && currentPlayer === "black") return;

    const piece = board[row][col];
    const hasAnyJumpMoves = checkMustJump(board, currentPlayer);

    if (selectedSquare) {
      if (validMoves.some((move) => move.row === row && move.col === col)) {
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
        return;
      }

      if (piece?.color === currentPlayer) {
        const moves = getValidMoves(piece, row, col, board);
        const hasJumpMoves = canJump(piece, row, col, board);

        if (!hasAnyJumpMoves || hasJumpMoves) {
          setSelectedSquare({ row, col });
          setValidMoves(
            hasAnyJumpMoves
              ? moves.filter((m) => Math.abs(m.row - row) === 2)
              : moves
          );
          return;
        }
      }

      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    if (piece?.color === currentPlayer) {
      const moves = getValidMoves(piece, row, col, board);
      const hasJumpMoves = canJump(piece, row, col, board);

      if (!hasAnyJumpMoves || hasJumpMoves) {
        setSelectedSquare({ row, col });
        setValidMoves(
          hasAnyJumpMoves
            ? moves.filter((m) => Math.abs(m.row - row) === 2)
            : moves
        );
      }
    }
  };

  const makeAIMove = useCallback(() => {
    if (currentPlayer !== "black" || !gameMode?.startsWith("ai")) return;

    const difficulty = gameMode.split("-")[1] as "easy" | "medium" | "hard";
    const bestMove = getBestMove(board, "black", difficulty);

    if (bestMove) {
      setTimeout(() => {
        makeMove(
          bestMove.from.row,
          bestMove.from.col,
          bestMove.to.row,
          bestMove.to.col
        );
      }, 500);
    }
  }, [board, currentPlayer, gameMode, makeMove]);

  useEffect(() => {
    if (currentPlayer === "black" && gameMode?.startsWith("ai")) {
      makeAIMove();
    }
  }, [currentPlayer, gameMode, makeAIMove]);

  const resetGame = () => {
    const freshBoard = Array(8)
      .fill(null)
      .map((_, row) => {
        return Array(8)
          .fill(null)
          .map((_, col) => {
            if ((row + col) % 2 === 1) {
              if (row < 3) {
                return { color: "black" as Color, isKing: false };
              } else if (row > 4) {
                return { color: "white" as Color, isKing: false };
              }
            }
            return null;
          });
      });
    setBoard(freshBoard);
    setCurrentPlayer("white");
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus("playing");
    setWinner(null);
    setCapturedPieces({ white: 0, black: 0 });
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <header className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors mb-20"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Guild
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-4">
              Checkers
            </h1>
            <p className="text-amber-300/80 text-lg">
              Choose your game mode to begin your checkers battle.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setGameMode("pvp")}
              className="cursor-pointer bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-8 transition-all duration-300 hover:scale-105 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-900/25 backdrop-blur-sm"
            >
              <div className="text-6xl mb-4">
                <Users className="w-16 h-16 mx-auto text-amber-300" />
              </div>
              <h3 className="text-2xl font-bold text-amber-100 mb-2">
                Player vs Player
              </h3>
              <p className="text-amber-300/70">
                Challenge a friend to a classic checkers match
              </p>
            </button>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-100 text-center mb-4">
                Play vs AI
              </h3>

              <button
                onClick={() => setGameMode("ai-easy")}
                className="cursor-pointer w-full bg-gradient-to-br from-green-900/20 to-green-950/40 border-2 border-green-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-green-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Bot className="w-8 h-8 text-green-300" />
                  <span className="text-xl font-bold text-green-100">
                    Easy AI
                  </span>
                </div>
                <p className="text-green-300/70 text-sm">
                  Perfect for beginners
                </p>
              </button>

              <button
                onClick={() => setGameMode("ai-medium")}
                className="cursor-pointer w-full bg-gradient-to-br from-yellow-900/20 to-yellow-950/40 border-2 border-yellow-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-yellow-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Bot className="w-8 h-8 text-yellow-300" />
                  <span className="text-xl font-bold text-yellow-100">
                    Medium AI
                  </span>
                </div>
                <p className="text-yellow-300/70 text-sm">A worthy opponent</p>
              </button>

              <button
                onClick={() => setGameMode("ai-hard")}
                className="cursor-pointer w-full bg-gradient-to-br from-red-900/20 to-red-950/40 border-2 border-red-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-red-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Bot className="w-8 h-8 text-red-300" />
                  <span className="text-xl font-bold text-red-100">
                    Hard AI
                  </span>
                </div>
                <p className="text-red-300/70 text-sm">For checkers masters</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Guild
              </Link>
              <button
                onClick={() => setGameMode(null)}
                className="cursor-pointer inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Change Mode
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-amber-300 text-sm">
                {gameMode === "pvp"
                  ? "Player vs Player"
                  : gameMode === "ai-easy"
                  ? "vs Easy AI"
                  : gameMode === "ai-medium"
                  ? "vs Medium AI"
                  : "vs Hard AI"}
              </div>
              <button
                onClick={resetGame}
                className="cursor-pointer px-4 py-2 bg-amber-700/50 border border-amber-600 rounded-lg text-amber-200 hover:bg-amber-600/50 transition-colors"
              >
                New Game
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:order-1 space-y-4">
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-4">
              <h3 className="text-amber-200 font-bold mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Game Info
              </h3>
              <div className="space-y-1 text-amber-300/80">
                <p>
                  Current Player:{" "}
                  <span className="text-amber-200 font-semibold">
                    {currentPlayer}
                  </span>
                </p>
                <p>
                  Captured White:{" "}
                  <span className="text-amber-200 font-semibold">
                    {capturedPieces.white}
                  </span>
                </p>
                <p>
                  Captured Black:{" "}
                  <span className="text-amber-200 font-semibold">
                    {capturedPieces.black}
                  </span>
                </p>
                {gameStatus === "won" && (
                  <p className="text-green-400 font-bold">Winner: {winner}!</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-gradient-to-br from-amber-950/40 to-amber-900/60 border-2 border-amber-700/50 rounded-lg flex flex-col items-center justify-center p-12">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown
                    className={`w-6 h-6 ${
                      currentPlayer === "white"
                        ? "text-amber-300"
                        : "text-slate-300"
                    }`}
                  />
                  <span className="text-xl font-bold text-amber-200">
                    {gameStatus === "won"
                      ? `${winner} Wins!`
                      : `${
                          currentPlayer === "white" ? "White" : "Black"
                        } to Move`}
                  </span>
                </div>
                {gameStatus === "won" && (
                  <button
                    onClick={resetGame}
                    className="cursor-pointer px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors"
                  >
                    Play Again
                  </button>
                )}
              </div>

              <div className="inline-block border-4 border-amber-800 rounded-lg overflow-hidden bg-amber-900">
                <div className="grid grid-cols-8 gap-0">
                  {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                      const isSelected =
                        selectedSquare?.row === rowIndex &&
                        selectedSquare?.col === colIndex;
                      const isValidMove = validMoves.some(
                        (move) => move.row === rowIndex && move.col === colIndex
                      );
                      const isDarkSquare = (rowIndex + colIndex) % 2 === 1;

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          className={`w-12 h-12 sm:w-16 sm:h-16 relative cursor-pointer transition-all duration-200 hover:scale-105
                            ${isDarkSquare ? "bg-amber-800" : "bg-amber-100"}
                            ${
                              isSelected
                                ? "ring-4 ring-amber-300 ring-inset"
                                : ""
                            }
                            ${
                              isValidMove
                                ? "ring-4 ring-green-400 ring-opacity-60 ring-inset"
                                : ""
                            }
                          `}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          disabled={gameStatus === "won"}
                        >
                          {piece && (
                            <div
                              className={`absolute inset-2 rounded-full
                                ${
                                  piece.color === "white"
                                    ? "bg-amber-50"
                                    : "bg-slate-900"
                                }
                                ${
                                  piece.color === "white"
                                    ? "border-amber-200"
                                    : "border-slate-600"
                                }
                                border-2 shadow-lg
                              `}
                            >
                              {piece.isKing && (
                                <Crown
                                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                                    ${
                                      piece.color === "white"
                                        ? "text-amber-600"
                                        : "text-slate-400"
                                    }
                                  `}
                                  size={16}
                                />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:order-3">
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-4">
              <h3 className="text-amber-200 font-bold mb-2">Game Status</h3>
              <div className="space-y-2 text-amber-300/70 text-sm">
                <p>
                  Mode:{" "}
                  {gameMode === "pvp"
                    ? "Player vs Player"
                    : `AI ${gameMode?.split("-")[1]}`}
                </p>
                <p>
                  Status: {gameStatus === "won" ? "Game Over" : "In Progress"}
                </p>
                {gameStatus === "won" && winner && (
                  <p className="text-green-400 font-semibold">
                    🎉 {winner} is victorious!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckersGame;
