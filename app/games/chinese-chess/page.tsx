"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, RotateCcw, Users } from "lucide-react";
import {
  XiangqiGameState,
  XiangqiPiece,
  XiangqiPieceColor,
  XiangqiPosition,
  XiangqiMove,
} from "./types";
import {
  initializeXiangqiBoard,
  getValidMoves,
  isInCheck,
  isCheckmate,
  isStalemate,
  selectAIMove,
  getPieceCharacter,
} from "./utils";

type GameMode = "pvp" | "ai-easy" | "ai-medium" | "ai-hard";

interface ChinesePieceProps {
  piece: XiangqiPiece;
  size?: number;
}

const ChinesePiece: React.FC<ChinesePieceProps> = ({ piece, size = 32 }) => {
  const character = getPieceCharacter(piece);
  const isRed = piece.color === "red";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="drop-shadow-sm"
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill={isRed ? "#dc2626" : "#1f2937"}
        stroke="#d1d5db"
        strokeWidth="1"
      />
      <circle
        cx="20"
        cy="20"
        r="15"
        fill={isRed ? "#fca5a5" : "#374151"}
        stroke={isRed ? "#b91c1c" : "#6b7280"}
        strokeWidth="1"
      />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        className="font-bold select-none"
        fontSize="14"
        fill={isRed ? "#7f1d1d" : "#f9fafb"}
        style={{
          fontFamily: "var(--font-noto-sans-sc), 'Noto Sans SC', sans-serif",
          userSelect: "none",
        }}
      >
        {character}
      </text>
    </svg>
  );
};

const ChineseChess: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<XiangqiGameState>({
    board: initializeXiangqiBoard(),
    currentPlayer: "red",
    selectedSquare: null,
    gameStatus: "playing",
    winner: null,
    capturedPieces: { red: [], black: [] },
    moveHistory: [],
    aiDifficulty: "medium",
    gameMode: "human-vs-ai",
  });

  const handleSquareClick = (row: number, col: number) => {
    if (
      gameState.gameStatus === "checkmate" ||
      gameState.gameStatus === "stalemate"
    )
      return;
    if (gameMode !== "pvp" && gameState.currentPlayer === "black") return;

    const piece = gameState.board[row][col];
    const { selectedSquare } = gameState;

    if (!selectedSquare) {
      if (piece && piece.color === gameState.currentPlayer) {
        setGameState((prev) => ({
          ...prev,
          selectedSquare: { row, col },
        }));
      }
    } else {
      if (selectedSquare.row === row && selectedSquare.col === col) {
        setGameState((prev) => ({
          ...prev,
          selectedSquare: null,
        }));
      } else {
        const selectedPiece =
          gameState.board[selectedSquare.row][selectedSquare.col];
        if (selectedPiece) {
          const validMoves = getValidMoves(
            gameState.board,
            selectedSquare,
            selectedPiece
          );
          const isValidMove = validMoves.some(
            (move) => move.row === row && move.col === col
          );

          if (isValidMove) {
            makeMove(selectedSquare, { row, col });
          } else {
            if (piece && piece.color === gameState.currentPlayer) {
              setGameState((prev) => ({
                ...prev,
                selectedSquare: { row, col },
              }));
            } else {
              setGameState((prev) => ({
                ...prev,
                selectedSquare: null,
              }));
            }
          }
        }
      }
    }
  };

  const makeMove = (from: XiangqiPosition, to: XiangqiPosition) => {
    const newBoard = gameState.board.map((row) => [...row]);
    const piece = newBoard[from.row][from.col];
    const capturedPiece = newBoard[to.row][to.col];

    if (!piece) return;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    const newCapturedPieces = { ...gameState.capturedPieces };
    if (capturedPiece) {
      if (capturedPiece.color === "red") {
        newCapturedPieces.red.push(capturedPiece);
      } else {
        newCapturedPieces.black.push(capturedPiece);
      }
    }

    const nextPlayer = gameState.currentPlayer === "red" ? "black" : "red";

    let gameStatus: XiangqiGameState["gameStatus"] = "playing";
    let winner: XiangqiPieceColor | null = null;

    console.log(`After move, checking status for ${nextPlayer}...`);

    if (isInCheck(newBoard, nextPlayer)) {
      console.log(`${nextPlayer} is in check, checking for checkmate...`);
      if (isCheckmate(newBoard, nextPlayer)) {
        console.log(`CHECKMATE! ${gameState.currentPlayer} wins!`);
        gameStatus = "checkmate";
        winner = gameState.currentPlayer;
      } else {
        console.log(`Just check, game continues.`);
        gameStatus = "check";
      }
    } else if (isStalemate(newBoard, nextPlayer)) {
      console.log(`Stalemate!`);
      gameStatus = "stalemate";
    } else {
      console.log(`Game continues normally.`);
    }

    const move: XiangqiMove = {
      from,
      to,
      piece,
      captured: capturedPiece || undefined,
    };

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedSquare: null,
      gameStatus,
      winner,
      capturedPieces: newCapturedPieces,
      moveHistory: [...prev.moveHistory, move],
    }));
  };

  useEffect(() => {
    if (
      gameMode !== "pvp" &&
      gameMode !== null &&
      gameState.currentPlayer === "black" &&
      (gameState.gameStatus === "playing" || gameState.gameStatus === "check")
    ) {
      const timer = setTimeout(() => {
        const difficulty =
          gameMode === "ai-easy"
            ? "easy"
            : gameMode === "ai-medium"
            ? "medium"
            : "hard";
        const aiMove = selectAIMove(gameState.board, "black", difficulty);
        if (aiMove) {
          makeMove(aiMove.from, aiMove.to);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentPlayer, gameState.gameStatus, gameMode]);

  const getHighlightedSquares = (): XiangqiPosition[] => {
    if (!gameState.selectedSquare) return [];
    const piece =
      gameState.board[gameState.selectedSquare.row][
        gameState.selectedSquare.col
      ];
    if (!piece) return [];
    return getValidMoves(gameState.board, gameState.selectedSquare, piece);
  };

  const highlightedSquares = getHighlightedSquares();

  const resetGame = () => {
    setGameState({
      board: initializeXiangqiBoard(),
      currentPlayer: "red",
      selectedSquare: null,
      gameStatus: "playing",
      winner: null,
      capturedPieces: { red: [], black: [] },
      moveHistory: [],
      aiDifficulty: gameState.aiDifficulty,
      gameMode: gameState.gameMode,
    });
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
              中国象棋
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-300/80 mb-4">
              Chinese Chess (Xiangqi)
            </h2>
            <p className="text-amber-300/80 text-lg">
              Choose your game mode to begin your Xiangqi battle.
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
                Challenge a friend to a classic Xiangqi match
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
                <p className="text-red-300/70 text-sm">For Xiangqi masters</p>
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
                onClick={() => {
                  setGameMode(null);
                  resetGame();
                }}
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

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-2">
            中国象棋
          </h1>
          <h2 className="text-2xl font-semibold text-amber-300/80">
            Chinese Chess (Xiangqi)
          </h2>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-semibold">
            {gameState.gameStatus === "playing" && (
              <span
                className={
                  gameState.currentPlayer === "red"
                    ? "text-red-400"
                    : "text-amber-200"
                }
              >
                {gameState.currentPlayer === "red"
                  ? "红方 (Red)"
                  : "黑方 (Black)"}{" "}
                to move
              </span>
            )}
            {gameState.gameStatus === "check" && (
              <span className="text-yellow-400">Check!</span>
            )}
            {gameState.gameStatus === "checkmate" && (
              <span className="text-red-400">
                Checkmate!{" "}
                {gameState.winner === "red" ? "红方 (Red)" : "黑方 (Black)"}{" "}
                wins!
              </span>
            )}
            {gameState.gameStatus === "stalemate" && (
              <span className="text-blue-400">Stalemate! Draw!</span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          <div className=" space-y-4">
            <div className="bg-gradient-to-br from-slate-900/20 to-slate-950/40 border-2 border-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">
                Captured - 黑方 (Black)
              </h3>
              <div className="flex flex-wrap gap-1">
                {gameState.capturedPieces.black.map((piece, index) => (
                  <ChinesePiece key={index} piece={piece} size={24} />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-200 mb-3">
                Captured - 红方 (Red)
              </h3>
              <div className="flex flex-wrap gap-1">
                {gameState.capturedPieces.red.map((piece, index) => (
                  <ChinesePiece key={index} piece={piece} size={24} />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-200 p-6 rounded-lg shadow-xl">
            <div className="relative">
              <div className="absolute left-[-40px] top-[180px] transform -rotate-90 text-xs font-bold text-amber-800">
                楚河汉界
              </div>

              <div className="grid grid-rows-10 gap-0 bg-amber-100 p-4 border-4 border-amber-600 rounded-lg">
                {gameState.board.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-9 gap-0">
                    {row.map((piece, colIndex) => {
                      const isSelected =
                        gameState.selectedSquare?.row === rowIndex &&
                        gameState.selectedSquare?.col === colIndex;
                      const isHighlighted = highlightedSquares.some(
                        (pos) => pos.row === rowIndex && pos.col === colIndex
                      );
                      const isRiver = rowIndex === 4 || rowIndex === 5;

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          className={`
                  w-12 h-12 border border-amber-400 flex items-center justify-center relative cursor-pointer
                  transition-all duration-150 hover:bg-amber-300
                  ${
                    isSelected
                      ? "ring-2 ring-inset ring-blue-500 bg-blue-100"
                      : ""
                  }
                  ${
                    isHighlighted
                      ? "ring-2 ring-inset ring-green-500 bg-green-100"
                      : ""
                  }
                  ${isRiver ? "bg-blue-50" : "bg-amber-50"}
                `}
                        >
                          {piece && <ChinesePiece piece={piece} size={36} />}

                          {((rowIndex === 0 || rowIndex === 9) &&
                            (colIndex === 3 || colIndex === 5)) ||
                          (rowIndex === 2 &&
                            (colIndex === 1 || colIndex === 7)) ||
                          (rowIndex === 3 &&
                            (colIndex === 0 ||
                              colIndex === 2 ||
                              colIndex === 4 ||
                              colIndex === 6 ||
                              colIndex === 8)) ||
                          (rowIndex === 6 &&
                            (colIndex === 0 ||
                              colIndex === 2 ||
                              colIndex === 4 ||
                              colIndex === 6 ||
                              colIndex === 8)) ||
                          (rowIndex === 7 &&
                            (colIndex === 1 || colIndex === 7)) ? (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-1 h-1 bg-amber-700 rounded-full"></div>
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChineseChess;
