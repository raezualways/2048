import { useState } from 'react';
import { LeaderboardEntry } from '../types/game';

interface Props {
  entries: LeaderboardEntry[];
  onClose: () => void;
  currentScore: number;
  onSubmit: (name: string) => void;
  gameOver: boolean;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPanel({ entries, onClose, currentScore, onSubmit, gameOver }: Props) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today'>('all');

  const filtered = filter === 'today'
    ? entries.filter((e) => new Date(e.date).toDateString() === new Date().toDateString())
    : entries;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim().slice(0, 20));
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-black text-white">🏆 Leaderboard</h2>
            <p className="text-gray-400 text-sm mt-1">Top players worldwide</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Submit score */}
        {gameOver && currentScore > 0 && !submitted && (
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
            <p className="text-white font-semibold mb-2">Your score: <span className="text-yellow-400 font-black">{currentScore.toLocaleString()}</span></p>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter your name..."
                maxLength={20}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 text-sm outline-none focus:border-yellow-500 transition-colors"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}
        {submitted && (
          <div className="px-6 py-3 bg-green-900/30 border-b border-green-700/30 text-green-400 text-sm font-semibold text-center">
            ✓ Score submitted successfully!
          </div>
        )}

        {/* Filter tabs */}
        <div className="px-6 py-3 flex gap-2 border-b border-gray-700">
          {(['all', 'today'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize ${
                filter === f ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'All Time' : 'Today'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No entries yet</div>
          ) : (
            filtered.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-2xl ${
                  idx < 3 ? 'bg-gray-700/80 border border-gray-500' : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="w-8 text-center font-black text-lg">
                  {idx < 3 ? MEDAL[idx] : <span className="text-gray-500">#{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold truncate">{entry.name}</div>
                  <div className="text-gray-400 text-xs">
                    Highest tile: <span className="text-yellow-400 font-bold">{entry.highestTile.toLocaleString()}</span>
                    {' · '}{entry.moves} moves{' · '}{new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-yellow-400 font-black text-lg">{entry.score.toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
