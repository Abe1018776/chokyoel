import { BookOpen, Flame, Trophy, Star } from 'lucide-react';
import type { UserProgress } from '../types';

interface HeaderProps {
  progress: UserProgress;
  parsha: string;
  parshaHe: string;
  hebrewDate: string;
}

export function Header({ progress, parsha, parshaHe, hebrewDate }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-amber-800 to-amber-900 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-300" />
            <div>
              <h1 className="text-2xl font-bold">חק לישראל</h1>
              <p className="text-amber-200 text-sm">Chok LeYisrael</p>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-2 bg-amber-700/50 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">Level {progress.level}</span>
            <span className="text-amber-200 text-sm">({progress.points} pts)</span>
          </div>
        </div>

        {/* Parsha Info */}
        <div className="bg-amber-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-200 text-sm">This Week's Parsha</p>
              <p className="text-xl font-semibold">{parsha}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-hebrew">{parshaHe}</p>
              {hebrewDate && <p className="text-amber-200 text-sm">{hebrewDate}</p>}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 bg-amber-700/30 px-3 py-2 rounded-lg">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-xs text-amber-200">Streak</p>
              <p className="font-bold">{progress.currentStreak} days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-700/30 px-3 py-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-300" />
            <div>
              <p className="text-xs text-amber-200">Days</p>
              <p className="font-bold">{progress.totalDaysCompleted}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-700/30 px-3 py-2 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-xs text-amber-200">Achievements</p>
              <p className="font-bold">{progress.achievements.length}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
