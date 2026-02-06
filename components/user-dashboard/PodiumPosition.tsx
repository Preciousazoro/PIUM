"use client";

import { Crown, Medal } from "lucide-react";
import Image from "next/image";

type Entry = {
  rank: number;
  username: string;
  tasks: number;
  tp: number;
  level: string;
  avatar?: string | null;
};

interface PodiumProps {
  user: Entry;
  rank: number;
  isFirst: boolean;
}

export function PodiumPosition({ user, rank, isFirst }: PodiumProps) {
  return (
    <div className={`flex flex-col items-center space-y-6 sm:space-y-8 ${isFirst ? "-mt-12 sm:-mt-16 scale-110" : ""}`}>
      <div className="relative">
        {/* Avatar Ring */}
        <div className={`relative rounded-full p-3 shadow-2xl transition-transform hover:scale-105 ${
          rank === 1 ? "bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 w-32 h-32 sm:w-40 sm:h-40 ring-4 ring-yellow-400/50" : 
          rank === 2 ? "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 w-28 h-28 sm:w-36 sm:h-36 ring-4 ring-slate-400/50" : 
          "bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 w-28 h-28 sm:w-36 sm:h-36 ring-4 ring-amber-600/50"
        }`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-card border-4 border-background">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-2xl sm:text-3xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Rank Badge */}
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-base font-black text-white border-2 border-background shadow-lg ${
            rank === 1 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : rank === 2 ? "bg-gradient-to-r from-slate-400 to-slate-500" : "bg-gradient-to-r from-amber-600 to-amber-700"
          }`}>
            #{rank}
          </div>

          {/* Icon for 1st Place */}
          {isFirst && (
            <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 animate-bounce">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
            </div>
          )}
        </div>
      </div>

      <div className="text-center px-4">
        <p className="font-black text-lg sm:text-2xl break-words max-w-[160px] sm:max-w-[200px] mb-2 leading-tight">{user.username}</p>
        <p className="text-primary font-bold text-base sm:text-xl mb-1">{user.tp.toLocaleString()} TP</p>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{user.level}</p>
      </div>
    </div>
  );
}