import React from "react";
import Link from "next/link";
import { Swords } from "lucide-react";

interface BoardGame {
  id: string;
  name: string;
  players: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Master";
  estimatedTime: string;
  origin: string;
  icon: string;
}

const boardGames: BoardGame[] = [
  {
    id: "chess",
    name: "Chess",
    players: "2 Players",
    difficulty: "Intermediate",
    estimatedTime: "30-60 min",
    origin: "Ancient India ",
    icon: "♔ ",
  },
  {
    id: "chinese-chess",
    name: "Chinese Chess",
    players: "2 Players",
    difficulty: "Advanced",
    estimatedTime: "30-90 min",
    origin: "Ancient China",
    icon: "♜",
  },
  {
    id: "checkers",
    name: "Checkers",
    players: "2 Players",
    difficulty: "Beginner",
    estimatedTime: "15-30 min",
    origin: "Ancient Egypt",
    icon: "⚫",
  },
  {
    id: "go",
    name: "Go",
    players: "2 Players",
    difficulty: "Master",
    estimatedTime: "60-180 min",
    origin: "Ancient China ",
    icon: "○",
  },
  {
    id: "nine-mens-morris",
    name: "Nine Men's Morris",
    players: "2 Players",
    difficulty: "Intermediate",
    estimatedTime: "15-30 min",
    origin: "Medieval Europe",
    icon: "◉",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "text-green-400 bg-green-900/30";
    case "Intermediate":
      return "text-yellow-400 bg-yellow-900/30";
    case "Advanced":
      return "text-orange-400 bg-orange-900/30";
    case "Master":
      return "text-red-400 bg-red-900/30";
    default:
      return "text-gray-400 bg-gray-900/30";
  }
};

const GameCard = ({ game }: { game: BoardGame }) => {
  return (
    <Link href={`/games/${game.id}`} className="block group">
      <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border-2 border-amber-700/50 rounded-lg p-6 h-full transition-all duration-300 hover:scale-105 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-900/25 backdrop-blur-sm">
        <div className="text-center mb-4">
          <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {game.icon}
          </div>
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
              game.difficulty
            )}`}
          >
            {game.difficulty}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-amber-100 text-center group-hover:text-amber-50 transition-colors">
            {game.name}
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs text-amber-300/70">
            <div>
              <span className="font-semibold">Players:</span> {game.players}
            </div>
            <div>
              <span className="font-semibold">Time:</span> {game.estimatedTime}
            </div>
          </div>

          <div className="text-center text-xs text-amber-400/60 italic">
            Origin: {game.origin}
          </div>
        </div>

        <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-amber-300 text-sm font-semibold flex item-center justify-center gap-2">
            <Swords /> Enter the Game <Swords />
          </span>
        </div>
      </div>
    </Link>
  );
};

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
      <header className="relative overflow-hidden">
        <div className="relative container mx-auto px-6 py-16 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-4">
            Guild of Games
          </h1>
          <div className="text-2xl text-amber-300/80 mb-6 flex items-center justify-center gap-3">
            <Swords /> Medieval Board Game Arena <Swords />
          </div>
          <p className="text-amber-200/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to Guild of Games! Choose from our collection of classic
            board games. Each game is playable right in your browser.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boardGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <div className="text-center mt-16 text-amber-400/60">
          <p className="text-sm italic">
            Ready to play? Click any game above to get started.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Page;
