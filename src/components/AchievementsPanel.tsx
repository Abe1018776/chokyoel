import { Trophy, X } from 'lucide-react';
import progressService from '../services/progressService';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
  if (!isOpen) return null;

  const achievements = progressService.getAllAchievements();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-bold">Achievements</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Achievements List */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                  ${achievement.unlocked
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'}
                `}
              >
                <div className="text-3xl">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${achievement.unlocked ? 'text-amber-800' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <div className="text-green-500 text-2xl">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <p className="text-center text-sm text-gray-500">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
          </p>
        </div>
      </div>
    </div>
  );
}
