"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Users, Target, Bot } from "lucide-react";
import { GoGameState, GoMove } from "./types";
import {
  initializeGoBoard,
  playMove,
  isValidMove,
  getRandomValidMove,
} from "./utils";

type GameMode =
  | "pvp"
  | "pve-easy"
  | "pve-medium"
  | "pve-hard"
  | "capture-5"
  | "capture-10"
  | "capture-20";

const GoPage: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [captureTarget, setCaptureTarget] = useState(10);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [gameState, setGameState] = useState<GoGameState>({
    board: initializeGoBoard(19),
    currentPlayer: "black",
    capturedStones: { black: 0, white: 0 },
    moveHistory: [],
    gameStatus: "playing",
    lastMove: null,
    koPosition: null,
    passCount: 0,
    territory: { black: 0, white: 0, neutral: 0 },
    finalScore: null,
    boardSize: 19,
  });

  useEffect(() => {
    if (
      isAIMode &&
      gameState.gameStatus === "playing" &&
      gameState.currentPlayer === "white"
    ) {
      const makeAIMove = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const aiMove = getRandomValidMove(gameState, "white");
        if (aiMove) {
          try {
            const newGameState = playMove(gameState, aiMove);

            if (
              gameMode !== "pvp" &&
              gameMode !== "pve-easy" &&
              gameMode !== "pve-medium" &&
              gameMode !== "pve-hard"
            ) {
              if (newGameState.capturedStones.black >= captureTarget) {
                newGameState.gameStatus = "finished";
                newGameState.finalScore = {
                  black: newGameState.capturedStones.black,
                  white: newGameState.capturedStones.white,
                };
              } else if (newGameState.capturedStones.white >= captureTarget) {
                newGameState.gameStatus = "finished";
                newGameState.finalScore = {
                  black: newGameState.capturedStones.black,
                  white: newGameState.capturedStones.white,
                };
              }
            }

            setGameState(newGameState);
          } catch (error) {
            console.error("AI move error:", error);
          }
        }
      };

      makeAIMove();
    }
  }, [gameState, isAIMode, gameMode, captureTarget]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameStatus !== "playing") return;
    if (gameState.board[row][col] !== null) return;

    if (isAIMode && gameState.currentPlayer !== "black") return;

    try {
      const newMove: GoMove = {
        position: { row, col },
        player: gameState.currentPlayer,
        capturedStones: [],
      };

      if (!isValidMove(gameState, newMove)) {
        return;
      }

      const newGameState = playMove(gameState, newMove);

      if (
        gameMode !== "pvp" &&
        gameMode !== "pve-easy" &&
        gameMode !== "pve-medium" &&
        gameMode !== "pve-hard"
      ) {
        if (newGameState.capturedStones.black >= captureTarget) {
          newGameState.gameStatus = "finished";
          newGameState.finalScore = {
            black: newGameState.capturedStones.black,
            white: newGameState.capturedStones.white,
          };
        } else if (newGameState.capturedStones.white >= captureTarget) {
          newGameState.gameStatus = "finished";
          newGameState.finalScore = {
            black: newGameState.capturedStones.black,
            white: newGameState.capturedStones.white,
          };
        }
      }

      setGameState(newGameState);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  const resetGame = () => {
    setGameState({
      board: initializeGoBoard(gameState.boardSize),
      currentPlayer: "black",
      capturedStones: { black: 0, white: 0 },
      moveHistory: [],
      gameStatus: "playing",
      lastMove: null,
      koPosition: null,
      passCount: 0,
      territory: { black: 0, white: 0, neutral: 0 },
      finalScore: null,
      boardSize: gameState.boardSize,
    });
  };

  const startGame = (mode: GameMode) => {
    const isAI = mode.startsWith("pve-");
    const target = mode === "capture-5" ? 5 : mode === "capture-10" ? 10 : 20;

    setIsAIMode(isAI);
    if (isAI) {
      const difficulty = mode.split("-")[1] as "easy" | "medium" | "hard";
      setAiDifficulty(difficulty);
    }

    setCaptureTarget(target);
    setGameMode(mode);
    resetGame();
  };

  const renderCell = (row: number, col: number) => {
    const stone = gameState.board[row][col];
    const isLastMove =
      gameState.lastMove &&
      gameState.lastMove.row === row &&
      gameState.lastMove.col === col;

    const isStarPoint =
      gameState.boardSize === 19 &&
      ((row === 3 && (col === 3 || col === 9 || col === 15)) ||
        (row === 9 && (col === 3 || col === 9 || col === 15)) ||
        (row === 15 && (col === 3 || col === 9 || col === 15)));

    return (
      <div
        key={`${row}-${col}`}
        className="w-6 h-6 relative bg-amber-100 border border-amber-600"
        style={{
          backgroundImage: `
            linear-gradient(to right, #92400e 0px, #92400e 1px, transparent 1px),
            linear-gradient(to bottom, #92400e 0px, #92400e 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%",
        }}
      >
        {isStarPoint && !stone && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-800 rounded-full" />
          </div>
        )}

        {stone && (
          <button
            onClick={() => handleCellClick(row, col)}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="relative">
              <div
                className={`w-5 h-5 rounded-full border shadow-md ${
                  stone === "black"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              />
              {isLastMove && (
                <div className="absolute inset-0 w-5 h-5 rounded-full border-2 border-red-400 animate-pulse" />
              )}
            </div>
          </button>
        )}

        {!stone && (
          <button
            onClick={() => handleCellClick(row, col)}
            className="absolute inset-0 cursor-pointer hover:bg-amber-200/30 transition-colors"
          />
        )}
      </div>
    );
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
              囲碁
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-300/80 mb-4">
              Go (Weiqi/Baduk)
            </h2>
            <p className="text-amber-300/80 text-lg">
              Choose your game mode to begin your strategic battle.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => startGame("pvp")}
              className="cursor-pointer bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-8 transition-all duration-300 hover:scale-105 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-900/25 backdrop-blur-sm"
            >
              <div className="text-6xl mb-4">
                <Users className="w-16 h-16 mx-auto text-amber-300" />
              </div>
              <h3 className="text-2xl font-bold text-amber-100 mb-2">
                Player vs Player
              </h3>
              <p className="text-amber-300/70">
                Traditional Go - First to pass twice ends the game
              </p>
            </button>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-100 text-center mb-4">
                Player vs AI
              </h3>

              <button
                onClick={() => startGame("pve-easy")}
                className="cursor-pointer w-full bg-gradient-to-br from-blue-900/20 to-blue-950/40 border-2 border-blue-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Bot className="w-8 h-8 text-blue-300" />
                  <span className="text-xl font-bold text-blue-100">
                    Easy AI
                  </span>
                </div>
                <p className="text-blue-300/70 text-sm">
                  Beginner-friendly AI opponent
                </p>
              </button>

              <button
                onClick={() => startGame("pve-medium")}
                className="cursor-pointer w-full bg-gradient-to-br from-purple-900/20 to-purple-950/40 border-2 border-purple-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Bot className="w-8 h-8 text-purple-300" />
                  <span className="text-xl font-bold text-purple-100">
                    Medium AI
                  </span>
                </div>
                <p className="text-purple-300/70 text-sm">Balanced challenge</p>
              </button>

              <button
                onClick={() => startGame("pve-hard")}
                className="cursor-pointer w-full bg-gradient-to-br from-red-900/20 to-red-950/40 border-2 border-red-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-red-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Bot className="w-8 h-8 text-red-300" />
                  <span className="text-xl font-bold text-red-100">
                    Hard AI
                  </span>
                </div>
                <p className="text-red-300/70 text-sm">
                  Expert level challenge
                </p>
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-amber-100 text-center mb-4">
              Capture Game Modes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => startGame("capture-5")}
                className="cursor-pointer w-full bg-gradient-to-br from-green-900/20 to-green-950/40 border-2 border-green-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-green-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Target className="w-8 h-8 text-green-300" />
                  <span className="text-xl font-bold text-green-100">
                    5 Captures
                  </span>
                </div>
                <p className="text-green-300/70 text-sm">
                  Quick game - First to capture 5 stones wins
                </p>
              </button>

              <button
                onClick={() => startGame("capture-10")}
                className="cursor-pointer w-full bg-gradient-to-br from-yellow-900/20 to-yellow-950/40 border-2 border-yellow-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-yellow-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Target className="w-8 h-8 text-yellow-300" />
                  <span className="text-xl font-bold text-yellow-100">
                    10 Captures
                  </span>
                </div>
                <p className="text-yellow-300/70 text-sm">
                  Balanced game length
                </p>
              </button>

              <button
                onClick={() => startGame("capture-20")}
                className="cursor-pointer w-full bg-gradient-to-br from-red-900/20 to-red-950/40 border-2 border-red-700/50 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:border-red-500 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Target className="w-8 h-8 text-red-300" />
                  <span className="text-xl font-bold text-red-100">
                    20 Captures
                  </span>
                </div>
                <p className="text-red-300/70 text-sm">Long strategic game</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const winner =
    gameState.finalScore &&
    (gameState.capturedStones.black >= captureTarget
      ? "Black"
      : gameState.capturedStones.white >= captureTarget
      ? "White"
      : null);

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
                  : isAIMode
                  ? `Player vs AI (${aiDifficulty})`
                  : `Capture ${captureTarget} stones to win`}
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
            囲碁
          </h1>
          <h2 className="text-2xl font-semibold text-amber-300/80">
            Go (Weiqi/Baduk)
          </h2>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-semibold">
            {gameState.gameStatus === "playing" && (
              <span
                className={
                  gameState.currentPlayer === "black"
                    ? "text-slate-200"
                    : "text-white"
                }
              >
                {isAIMode && gameState.currentPlayer === "white"
                  ? "AI is thinking..."
                  : gameState.currentPlayer === "black"
                  ? "黑 (Black)"
                  : "白 (White)"}{" "}
                {!(isAIMode && gameState.currentPlayer === "white") &&
                  "to move"}
              </span>
            )}
            {gameState.gameStatus === "finished" && winner && (
              <span className="text-yellow-400">Game Over! {winner} wins!</span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-900/20 to-slate-950/40 border-2 border-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">
                Captured by 黑 (Black): {gameState.capturedStones.black}
              </h3>
              <div className="text-slate-300 text-sm">
                {gameMode !== "pvp" && `Target: ${captureTarget}`}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-200 mb-3">
                Captured by 白 (White): {gameState.capturedStones.white}
              </h3>
              <div className="text-amber-300 text-sm">
                {gameMode !== "pvp" && `Target: ${captureTarget}`}
              </div>
            </div>
          </div>

          <div className="bg-amber-100 p-4 rounded-lg shadow-xl">
            <div className="grid grid-cols-19 gap-0">
              {gameState.board.map((row, rowIndex) =>
                row.map((_, colIndex) => renderCell(rowIndex, colIndex))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoPage;
