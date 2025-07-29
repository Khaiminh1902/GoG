"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Crown, Bot, Users } from "lucide-react";
import {
  GiChessKing,
  GiChessQueen,
  GiChessRook,
  GiChessBishop,
  GiChessKnight,
  GiChessPawn,
} from "react-icons/gi";

import { Piece, Color, PieceType, GameMode, Position } from "./types";
import { getValidMoves, isInCheck } from "./utils";

const ChessPieceIcon = ({ type, color }: { type: PieceType; color: Color }) => {
  const iconSize = "w-8 h-8 sm:w-10 sm:h-10";
  const colorClasses =
    color === "white"
      ? "text-amber-50 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
      : "text-slate-800 drop-shadow-[2px_2px_4px_rgba(255,255,255,0.3)]";

  const iconMap = {
    king: GiChessKing,
    queen: GiChessQueen,
    rook: GiChessRook,
    bishop: GiChessBishop,
    knight: GiChessKnight,
    pawn: GiChessPawn,
  };

  const IconComponent = iconMap[type];

  return <IconComponent className={`${iconSize} ${colorClasses}`} />;
};
const initialBoard: Piece[][] = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  [
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
    { type: "pawn", color: "black" },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
    { type: "pawn", color: "white" },
  ],
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
];

const ChessGame = () => {
  const [board, setBoard] = useState<Piece[][]>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Color>("white");
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "check" | "checkmate" | "stalemate"
  >("playing");
  const [capturedPieces, setCapturedPieces] = useState<{
    white: Piece[];
    black: Piece[];
  }>({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionPosition, setPromotionPosition] = useState<Position | null>(
    null
  );
  const [promotionColor, setPromotionColor] = useState<Color | null>(null);

  const makeMove = useCallback(
    (
      fromRow: number,
      fromCol: number,
      toRow: number,
      toCol: number
    ): Piece[][] => {
      const newBoard = board.map((row) => [...row]);
      const piece = newBoard[fromRow][fromCol];
      const capturedPiece = newBoard[toRow][toCol];

      if (piece && piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
        const rookCol = toCol === 6 ? 7 : 0;
        const newRookCol = toCol === 6 ? 5 : 3;

        newBoard[toRow][newRookCol] = newBoard[toRow][rookCol];
        newBoard[toRow][rookCol] = null;
      }

      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = null;

      if (capturedPiece) {
        setCapturedPieces((prev) => ({
          ...prev,
          [capturedPiece.color]: [...prev[capturedPiece.color], capturedPiece],
        }));
      }

      return newBoard;
    },
    [board]
  );

  const handleSquareClick = (row: number, col: number) => {
    if (gameMode?.startsWith("ai") && currentPlayer === "black") return;

    const piece = board[row][col];

    if (selectedSquare) {
      const isValidMove = validMoves.some(
        (move) => move.row === row && move.col === col
      );

      if (isValidMove) {
        const newBoard = makeMove(
          selectedSquare.row,
          selectedSquare.col,
          row,
          col
        );

        if (!isInCheck(newBoard, currentPlayer)) {
          setBoard(newBoard);
          setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

          const moveNotation = `${String.fromCharCode(
            97 + selectedSquare.col
          )}${8 - selectedSquare.row}-${String.fromCharCode(97 + col)}${
            8 - row
          }`;
          setMoveHistory((prev) => [...prev, moveNotation]);

          const movingPiece = board[selectedSquare.row][selectedSquare.col];
          if (
            movingPiece &&
            movingPiece.type === "pawn" &&
            (row === 0 || row === 7)
          ) {
            setPromotionPosition({ row, col });
            setPromotionColor(movingPiece.color);
            setShowPromotionModal(true);
          }
        }
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare({ row, col });
      const moves = getValidMoves(piece, row, col, board);

      const validMovesFiltered = moves.filter((move) => {
        const testBoard = board.map((r) => [...r]);
        testBoard[move.row][move.col] = testBoard[row][col];
        testBoard[row][col] = null;
        return !isInCheck(testBoard, currentPlayer);
      });
      setValidMoves(validMovesFiltered);
    }
  };

  const makeAIMove = useCallback(() => {
    if (currentPlayer !== "black" || !gameMode?.startsWith("ai")) return;

    const allMoves: {
      from: Position;
      to: Position;
      piece: Piece;
      score: number;
    }[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === "black") {
          const moves = getValidMoves(piece, row, col, board);
          moves.forEach((move) => {
            const testBoard = board.map((r) => [...r]);
            testBoard[move.row][move.col] = testBoard[row][col];
            testBoard[row][col] = null;

            if (!isInCheck(testBoard, "black")) {
              let score = Math.random();

              if (gameMode === "ai-medium" || gameMode === "ai-hard") {
                if (board[move.row][move.col]) {
                  const capturedPiece = board[move.row][move.col]!;
                  const pieceValues = {
                    pawn: 1,
                    knight: 3,
                    bishop: 3,
                    rook: 5,
                    queen: 9,
                    king: 100,
                  };
                  score += pieceValues[capturedPiece.type] * 10;
                }

                if (
                  move.row >= 2 &&
                  move.row <= 5 &&
                  move.col >= 2 &&
                  move.col <= 5
                ) {
                  score += 2;
                }

                if (piece.type === "pawn") {
                  score += 0.5;
                }

                if (piece.type === "king" && move.row >= 2 && move.row <= 5) {
                  score -= 1;
                }
              }

              if (gameMode === "ai-hard") {
                if (
                  move.row >= 3 &&
                  move.row <= 4 &&
                  move.col >= 3 &&
                  move.col <= 4
                ) {
                  score += 5;
                }

                if (piece.type === "knight" || piece.type === "bishop") {
                  score += 3;
                }

                if (piece.type === "pawn" && move.row < row) {
                  score += 1;
                }
              }

              if (gameMode === "ai-hard") {
                if (isInCheck(testBoard, "white")) {
                  score += 50;
                }

                const attackers = [];
                for (let r = 0; r < 8; r++) {
                  for (let c = 0; c < 8; c++) {
                    const p = testBoard[r][c];
                    if (p && p.color === "white") {
                      const whiteMoves = getValidMoves(p, r, c, testBoard);
                      if (
                        whiteMoves.some(
                          (m) => m.row === move.row && m.col === move.col
                        )
                      ) {
                        attackers.push(p);
                      }
                    }
                  }
                }
                if (attackers.length > 0) {
                  score -= 20;
                }
              }

              allMoves.push({ from: { row, col }, to: move, piece, score });
            }
          });
        }
      }
    }

    if (allMoves.length > 0) {
      allMoves.sort((a, b) => b.score - a.score);

      let chosenMove;
      if (gameMode === "ai-easy") {
        const topHalf = allMoves.slice(
          0,
          Math.max(1, Math.floor(allMoves.length / 2))
        );
        chosenMove = topHalf[Math.floor(Math.random() * topHalf.length)];
      } else if (gameMode === "ai-medium") {
        const topQuarter = allMoves.slice(
          0,
          Math.max(1, Math.floor(allMoves.length / 4))
        );
        chosenMove = topQuarter[Math.floor(Math.random() * topQuarter.length)];
      } else {
        chosenMove =
          Math.random() < 0.9 ? allMoves[0] : allMoves[1] || allMoves[0];
      }

      setTimeout(() => {
        const newBoard = makeMove(
          chosenMove.from.row,
          chosenMove.from.col,
          chosenMove.to.row,
          chosenMove.to.col
        );

        if (
          chosenMove.piece &&
          chosenMove.piece.type === "pawn" &&
          chosenMove.to.row === 7
        ) {
          newBoard[chosenMove.to.row][chosenMove.to.col] = {
            type: "queen",
            color: "black",
          };
        }

        setBoard(newBoard);
        setCurrentPlayer("white");

        const moveNotation = `${String.fromCharCode(97 + chosenMove.from.col)}${
          8 - chosenMove.from.row
        }-${String.fromCharCode(97 + chosenMove.to.col)}${
          8 - chosenMove.to.row
        }`;
        setMoveHistory((prev) => [...prev, moveNotation]);
      }, 500);
    }
  }, [board, currentPlayer, gameMode, makeMove]);

  useEffect(() => {
    const inCheck = isInCheck(board, currentPlayer);

    const allMoves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
          const moves = getValidMoves(piece, row, col, board);
          moves.forEach((move) => {
            const testBoard = board.map((r) => [...r]);
            testBoard[move.row][move.col] = testBoard[row][col];
            testBoard[row][col] = null;
            if (!isInCheck(testBoard, currentPlayer)) {
              allMoves.push({ from: { row, col }, to: move });
            }
          });
        }
      }
    }

    if (allMoves.length === 0) {
      if (inCheck) {
        setGameStatus("checkmate");
      } else {
        setGameStatus("stalemate");
      }
    } else if (inCheck) {
      setGameStatus("check");
    } else {
      setGameStatus("playing");
    }
  }, [board, currentPlayer]);

  useEffect(() => {
    if (gameStatus === "playing") {
      makeAIMove();
    }
  }, [currentPlayer, gameStatus, makeAIMove]);

  const resetGame = () => {
    setBoard(initialBoard);
    setCurrentPlayer("white");
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus("playing");
    setCapturedPieces({ white: [], black: [] });
    setMoveHistory([]);
    setShowPromotionModal(false);
    setPromotionPosition(null);
    setPromotionColor(null);
  };

  const handlePromotion = (pieceType: PieceType) => {
    if (promotionPosition && promotionColor) {
      const newBoard = [...board];
      newBoard[promotionPosition.row][promotionPosition.col] = {
        type: pieceType,
        color: promotionColor,
      };
      setBoard(newBoard);
    }
    setShowPromotionModal(false);
    setPromotionPosition(null);
    setPromotionColor(null);
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isValidMoveSquare = (row: number, col: number) => {
    return validMoves.some((move) => move.row === row && move.col === col);
  };

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const baseColor = isLight ? "bg-amber-100" : "bg-amber-800";

    if (isSquareSelected(row, col)) {
      return "bg-amber-400 ring-4 ring-amber-300 ring-inset";
    }

    if (isValidMoveSquare(row, col)) {
      return `${baseColor} ring-4 ring-green-400 ring-opacity-60 ring-inset`;
    }

    return baseColor;
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
              Chess
            </h1>
            <p className="text-amber-300/80 text-lg">
              Choose your game mode to begin your chess battle.
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
                Challenge a friend to a classic chess match
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
                <p className="text-red-300/70 text-sm">For chess masters</p>
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
              <h3 className=" font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">
                  <GiChessKing />
                </span>{" "}
                White Captured
              </h3>
              <div className="flex flex-wrap gap-1">
                {capturedPieces.white.map((piece, index) => (
                  <div key={index} className="w-6 h-6 text-amber-300">
                    <ChessPieceIcon type={piece!.type} color={piece!.color} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900/20 to-slate-950/40 border-2 border-slate-700/50 rounded-lg p-4">
              <h3 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">
                  <GiChessKing />
                </span>{" "}
                Black Captured
              </h3>
              <div className="flex flex-wrap gap-1">
                {capturedPieces.black.map((piece, index) => (
                  <div key={index} className="w-6 h-6 text-slate-300">
                    <ChessPieceIcon type={piece!.type} color={piece!.color} />
                  </div>
                ))}
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
                    {gameStatus === "checkmate"
                      ? `${currentPlayer === "white" ? "Black" : "White"} Wins!`
                      : gameStatus === "stalemate"
                      ? "Stalemate!"
                      : gameStatus === "check"
                      ? `${currentPlayer} in Check`
                      : `${
                          currentPlayer === "white" ? "White" : "Black"
                        } to Move`}
                  </span>
                </div>
                {(gameStatus === "checkmate" || gameStatus === "stalemate") && (
                  <button
                    onClick={resetGame}
                    className="cursor-pointer px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors"
                  >
                    Play Again
                  </button>
                )}
              </div>

              <div className="inline-block border-4 border-amber-800 rounded-lg overflow-hidden bg-amber-900">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {row.map((piece, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={`cursor-pointer w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-4xl font-bold transition-all duration-200 hover:scale-105 ${getSquareColor(
                          rowIndex,
                          colIndex
                        )}`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        disabled={
                          gameStatus === "checkmate" ||
                          gameStatus === "stalemate"
                        }
                      >
                        {piece && (
                          <ChessPieceIcon
                            type={piece.type}
                            color={piece.color}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
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
                    className="text-amber-300/70 text-sm font-mono "
                  >
                    {Math.floor(index / 2) + 1}. {move}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border-2 border-amber-700 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-amber-200 mb-4 text-center">
              Choose promotion piece for {promotionColor} pawn
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => handlePromotion("queen")}
                className="cursor-pointer bg-amber-800/50 hover:bg-amber-700/50 border border-amber-600 rounded-lg p-4 transition-colors flex flex-col items-center gap-2"
              >
                <ChessPieceIcon
                  type="queen"
                  color={promotionColor || "white"}
                />
                <span className="text-amber-200 text-sm font-semibold">
                  Queen
                </span>
              </button>
              <button
                onClick={() => handlePromotion("rook")}
                className="cursor-pointer bg-amber-800/50 hover:bg-amber-700/50 border border-amber-600 rounded-lg p-4 transition-colors flex flex-col items-center gap-2"
              >
                <ChessPieceIcon type="rook" color={promotionColor || "white"} />
                <span className="text-amber-200 text-sm font-semibold">
                  Rook
                </span>
              </button>
              <button
                onClick={() => handlePromotion("bishop")}
                className="cursor-pointer bg-amber-800/50 hover:bg-amber-700/50 border border-amber-600 rounded-lg p-4 transition-colors flex flex-col items-center gap-2"
              >
                <ChessPieceIcon
                  type="bishop"
                  color={promotionColor || "white"}
                />
                <span className="text-amber-200 text-sm font-semibold">
                  Bishop
                </span>
              </button>
              <button
                onClick={() => handlePromotion("knight")}
                className="cursor-pointer bg-amber-800/50 hover:bg-amber-700/50 border border-amber-600 rounded-lg p-4 transition-colors flex flex-col items-center gap-2"
              >
                <ChessPieceIcon
                  type="knight"
                  color={promotionColor || "white"}
                />
                <span className="text-amber-200 text-sm font-semibold">
                  Knight
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
