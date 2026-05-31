
import { Achievement } from '../types/game';

interface Props {
  achievements: Achievement[];
  onClose: () => void;
}

const RARITY_BADGE: Record<string, string> = {
  common: 'bg-gray-600 text-gray-200',
  rare: 'bg-blue-600 text-blue-100',
  epic: 'bg-purple-600 text-purple-100',
  legendary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
};

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };

export default function AchievementsPanel({ achievements, onClose }: Props) {
  const sorted = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
  });

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-black text-white">🏅 Achievements</h2>
            <p className="text-gray-400 text-sm mt-1">
              {unlocked}/{achievements.length} unlocked
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(unlocked / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-3">
          {sorted.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                ach.unlocked
                  ? 'bg-gray-800 border border-gray-600'
                  : 'bg-gray-800/40 border border-gray-700/40 opacity-50'
              }`}
            >
              <div className={`text-3xl ${ach.unlocked ? '' : 'grayscale'}`}>{ach.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-black ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {ach.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${RARITY_BADGE[ach.rarity]}`}>
                    {ach.rarity}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${ach.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {ach.description}
                </p>
                {ach.unlocked && ach.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {ach.unlocked && (
                <div className="text-green-400 text-xl flex-shrink-0">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
