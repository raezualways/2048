import { GameStats } from '../types/game';

interface Props {
  stats: GameStats;
  onClose: () => void;
}

function StatRow({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
      <span className="text-white font-black text-lg">{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </div>
  );
}

export default function StatsPanel({ stats, onClose }: Props) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-black text-white">📊 Statistics</h2>
            <p className="text-gray-400 text-sm mt-1">Your gameplay data</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-3">
          <StatRow icon="🏆" label="Highest Tile" value={stats.highestTile.toLocaleString()} />
          <StatRow icon="💰" label="Total Score (All Time)" value={stats.totalScore} />
          <StatRow icon="🎮" label="Games Played" value={stats.gamesPlayed} />
          <StatRow icon="🏅" label="Games Won" value={stats.gamesWon} />
          <StatRow icon="📈" label="Win Rate" value={`${winRate}%`} />
          <StatRow icon="👆" label="Total Moves" value={stats.totalMoves} />
          <StatRow icon="🔗" label="Total Merges" value={stats.totalMerges} />
          {stats.totalMoves > 0 && (
            <StatRow
              icon="⚡"
              label="Avg Score per Move"
              value={Math.round(stats.totalScore / stats.totalMoves)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
