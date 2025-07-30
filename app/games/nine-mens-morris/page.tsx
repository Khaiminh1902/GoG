"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Crown, Bot, Users } from "lucide-react";
import { GameState, GameMode } from "./types";
import {
  createInitialGameState,
  makeMove,
  removePiece,
  makeAIMove,
  POSITIONS,
  getRemovablePieces,
  checkMill,
} from "./utils";

const NineMensMorris = () => {
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [waitingForRemoval, setWaitingForRemoval] = useState(false);
  const [removablePieces, setRemovablePieces] = useState<number[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const resetGame = () => {
    setGameState(createInitialGameState());
    setWaitingForRemoval(false);
    setRemovablePieces([]);
    setMoveHistory([]);
  };

  useEffect(() => {
    if (gameMode) {
      resetGame();
    }
  }, [gameMode]);

  const makeAIMoveCallback = useCallback(() => {
    if (
      gameState.currentPlayer !== "black" ||
      !gameMode?.startsWith("ai") ||
      gameState.gameOver ||
      waitingForRemoval
    )
      return;

    const difficulty =
      gameMode === "ai-easy"
        ? "easy"
        : gameMode === "ai-medium"
        ? "medium"
        : "hard";

    setTimeout(() => {
      const resultState = makeAIMove(gameState, difficulty);
      setGameState(resultState);

      const last = resultState.lastMove;
      let moveNotation = `black-move`;
      if (last?.from !== undefined && last?.to !== undefined) {
        moveNotation = `black-move-${last.from}-${last.to}`;
      } else if (last?.to !== undefined) {
        moveNotation = `black-place-${last.to}`;
      }

      setMoveHistory((prev) => [...prev, moveNotation]);

      if (
        last?.to !== undefined &&
        checkMill(resultState.board, last.to, "black")
      ) {
        const removable = getRemovablePieces(resultState.board, "white");
        if (removable.length > 0) {
          setTimeout(() => {
            const randomRemove =
              removable[Math.floor(Math.random() * removable.length)];
            const finalState = removePiece(resultState, randomRemove);
            setGameState(finalState);
            setMoveHistory((prev) => [...prev, `black-remove-${randomRemove}`]);
          }, 800);
        }
      }
    }, 500);
  }, [gameState, gameMode, waitingForRemoval]);

  useEffect(() => {
    if (
      gameState.currentPlayer === "black" &&
      gameMode?.startsWith("ai") &&
      !gameState.gameOver &&
      !waitingForRemoval
    ) {
      makeAIMoveCallback();
    }
  }, [
    gameState.currentPlayer,
    gameMode,
    gameState.gameOver,
    waitingForRemoval,
    makeAIMoveCallback,
  ]);

  const handlePositionClick = useCallback(
    (position: number) => {
      if (gameState.gameOver) return;
      if (gameMode?.startsWith("ai") && gameState.currentPlayer === "black")
        return;

      if (waitingForRemoval) {
        if (removablePieces.includes(position)) {
          const newState = removePiece(gameState, position);
          setGameState(newState);
          setWaitingForRemoval(false);
          setRemovablePieces([]);

          const moveNotation = `${gameState.currentPlayer}-remove-${position}`;
          setMoveHistory((prev) => [...prev, moveNotation]);
        }
        return;
      }

      const { board, currentPlayer, phase, selectedPosition } = gameState;

      if (phase === "placing") {
        if (board[position] === null) {
          const newState = makeMove(gameState, undefined, position);

          if (checkMill(newState.board, position, currentPlayer)) {
            const opponent = currentPlayer === "white" ? "black" : "white";
            const removable = getRemovablePieces(newState.board, opponent);

            if (removable.length > 0) {
              setWaitingForRemoval(true);
              setRemovablePieces(removable);
              setGameState(newState);

              const moveNotation = `${currentPlayer}-place-${position}`;
              setMoveHistory((prev) => [...prev, moveNotation]);
              return;
            }
          }

          setGameState(newState);
          const moveNotation = `${currentPlayer}-place-${position}`;
          setMoveHistory((prev) => [...prev, moveNotation]);
        }
      } else {
        if (selectedPosition === null) {
          if (board[position] === currentPlayer) {
            setGameState({
              ...gameState,
              selectedPosition: position,
            });
          }
        } else {
          if (position === selectedPosition) {
            setGameState({
              ...gameState,
              selectedPosition: null,
            });
          } else if (board[position] === null) {
            const newState = makeMove(gameState, selectedPosition, position);

            if (checkMill(newState.board, position, currentPlayer)) {
              const opponent = currentPlayer === "white" ? "black" : "white";
              const removable = getRemovablePieces(newState.board, opponent);

              if (removable.length > 0) {
                setWaitingForRemoval(true);
                setRemovablePieces(removable);
                setGameState(newState);

                const moveNotation = `${currentPlayer}-move-${selectedPosition}-${position}`;
                setMoveHistory((prev) => [...prev, moveNotation]);
                return;
              }
            }

            setGameState(newState);
            const moveNotation = `${currentPlayer}-move-${selectedPosition}-${position}`;
            setMoveHistory((prev) => [...prev, moveNotation]);
          } else if (board[position] === currentPlayer) {
            setGameState({
              ...gameState,
              selectedPosition: position,
            });
          }
        }
      }
    },
    [gameState, waitingForRemoval, removablePieces, gameMode]
  );

  const renderPosition = (position: number) => {
    const { board, selectedPosition } = gameState;
    const piece = board[position];
    const isSelected = selectedPosition === position;
    const isRemovable = removablePieces.includes(position);
    const pos = POSITIONS[position];

    const pieceClass =
      piece === "white"
        ? "bg-amber-50 border-2 border-slate-800"
        : piece === "black"
        ? "bg-slate-800 border-2 border-amber-50"
        : "bg-amber-100 border-2 border-amber-400";

    const selectedClass = isSelected ? "ring-4 ring-amber-400 ring-inset" : "";
    const removableClass = isRemovable
      ? "ring-4 ring-green-400 ring-opacity-60 ring-inset animate-pulse"
      : "";

    return (
      <button
        key={position}
        onClick={() => handlePositionClick(position)}
        disabled={gameState.gameOver}
        className={`
          absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2
          hover:scale-110 transition-all duration-200 z-10
          ${pieceClass} ${selectedClass} ${removableClass}
        `}
        style={{
          left: `${(pos.x / 6) * 100}%`,
          top: `${(pos.y / 6) * 100}%`,
        }}
      />
    );
  };

  const renderBoard = () => {
    return (
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto">
        <svg
          className="absolute inset-0 w-full h-full text-amber-700"
          viewBox="0 0 6 6"
        >
          <rect
            x={0}
            y={0}
            width={6}
            height={6}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.15"
          />
          <rect
            x={1}
            y={1}
            width={4}
            height={4}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.15"
          />
          <rect
            x={2}
            y={2}
            width={2}
            height={2}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.15"
          />

          <line
            x1={3}
            y1={0}
            x2={3}
            y2={2}
            stroke="currentColor"
            strokeWidth="0.15"
          />
          <line
            x1={3}
            y1={4}
            x2={3}
            y2={6}
            stroke="currentColor"
            strokeWidth="0.15"
          />
          <line
            x1={0}
            y1={3}
            x2={2}
            y2={3}
            stroke="currentColor"
            strokeWidth="0.15"
          />
          <line
            x1={4}
            y1={3}
            x2={6}
            y2={3}
            stroke="currentColor"
            strokeWidth="0.15"
          />
        </svg>

        {Array.from({ length: 24 }, (_, i) => renderPosition(i))}
      </div>
    );
  };

  const getPhaseDescription = () => {
    switch (gameState.phase) {
      case "placing":
        return "Placing Phase";
      case "moving":
        return "Moving Phase";
      case "flying":
        return "Flying Phase";
      default:
        return "";
    }
  };

  const getStatusMessage = () => {
    if (gameState.gameOver) {
      return `${gameState.winner === "white" ? "White" : "Black"} Wins!`;
    }

    if (waitingForRemoval) {
      return `${
        gameState.currentPlayer === "white" ? "White" : "Black"
      } formed a mill! Remove an opponent piece.`;
    }

    return `${gameState.currentPlayer === "white" ? "White" : "Black"} to Move`;
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
              Nine Men&apos;s Morris
            </h1>
            <p className="text-amber-300/80 text-lg">
              Choose your game mode to begin your strategic battle.
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
                Challenge a friend to a classic strategy match
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
                <p className="text-red-300/70 text-sm">For strategy masters</p>
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
                <Crown className="w-5 h-5" />
                White Pieces
              </h3>
              <div className="space-y-2 text-amber-300/70 text-sm">
                <div>To place: {gameState.whitePieces}</div>
                <div>On board: {gameState.whiteOnBoard}</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900/20 to-slate-950/40 border-2 border-slate-700/50 rounded-lg p-4">
              <h3 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Black Pieces
              </h3>
              <div className="space-y-2 text-slate-300/70 text-sm">
                <div>To place: {gameState.blackPieces}</div>
                <div>On board: {gameState.blackOnBoard}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-gradient-to-br from-amber-950/40 to-amber-900/60 border-2 border-amber-700/50 rounded-lg flex flex-col items-center justify-center p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown
                    className={`w-6 h-6 ${
                      gameState.currentPlayer === "white"
                        ? "text-amber-300"
                        : "text-slate-300"
                    }`}
                  />
                  <span className="text-xl font-bold text-amber-200">
                    {getStatusMessage()}
                  </span>
                </div>
                <div className="text-amber-300/70 text-sm mb-2">
                  {getPhaseDescription()}
                </div>
                {gameState.gameOver && (
                  <button
                    onClick={resetGame}
                    className="cursor-pointer px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors mt-2"
                  >
                    Play Again
                  </button>
                )}
              </div>

              <div className="bg-amber-900/30 rounded-xl p-8 border-4 border-amber-800">
                {renderBoard()}
              </div>
            </div>
          </div>

          <div className="lg:order-3">
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-4">
              <h3 className="text-amber-200 font-bold mb-2">Move History</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {moveHistory.map((move, index) => (
                  <div
                    key={index}
                    className="text-amber-300/70 text-sm font-mono"
                  >
                    {Math.floor(index / 2) + 1}. {move}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-4 mt-4">
              <h3 className="text-amber-200 font-bold mb-2">How to Play</h3>
              <div className="space-y-2 text-amber-300/70 text-xs">
                <div>
                  <strong>Phase 1:</strong> Place 9 pieces
                </div>
                <div>
                  <strong>Phase 2:</strong> Move to adjacent spots
                </div>
                <div>
                  <strong>Phase 3:</strong> Fly to any empty spot (when 3 pieces
                  left)
                </div>
                <div>
                  <strong>Mills:</strong> 3 in a row = remove opponent piece
                </div>
                <div>
                  <strong>Win:</strong> Reduce opponent to &lt;3 pieces or no
                  moves
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NineMensMorris;
