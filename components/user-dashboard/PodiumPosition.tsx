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
    <div className={`flex flex-col items-center space-y-4 ${isFirst ? "-mt-8" : ""}`}>
      <div className="relative">
        {/* Avatar Ring */}
        <div className={`relative rounded-full p-1 shadow-2xl ${
          rank === 1 ? "bg-linear-to-b from-yellow-400 to-orange-600 w-28 h-28" : 
          rank === 2 ? "bg-linear-to-b from-slate-300 to-slate-500 w-24 h-24" : 
          "bg-linear-to-b from-amber-600 to-amber-800 w-24 h-24"
        }`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-card border-4 border-background">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-xl font-bold">
                {user.username.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Rank Badge */}
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black text-white border-2 border-background shadow-lg ${
            rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-slate-400" : "bg-amber-700"
          }`}>
            #{rank}
          </div>

          {/* Icon for 1st Place */}
          {isFirst && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
              <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="font-black text-lg truncate max-w-[120px]">{user.username}</p>
        <p className="text-primary font-bold">{user.tp.toLocaleString()} TP</p>
      </div>
    </div>
  );
}