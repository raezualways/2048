
import { DailyChallenge as DailyChallengeType } from '../types/game';

interface Props {
  challenge: DailyChallengeType | null;
  onPlay: () => void;
  onClose: () => void;
  isDailyMode: boolean;
  dailyMoves: number;
  dailyCompleted: boolean;
  currentScore: number;
}

export default function DailyChallengePanel({
  challenge,
  onPlay,
  onClose,
  isDailyMode,
  dailyMoves,
  dailyCompleted,
  currentScore,
}: Props) {
  if (!challenge) return null;

  const progressPct = (() => {
    if (!challenge) return 0;
    if (challenge.targetScore) return Math.min(100, (currentScore / challenge.targetScore) * 100);
    return 0;
  })();

  const movesLeft = challenge.maxMoves ? challenge.maxMoves - dailyMoves : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white">📅 Daily Challenge</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-xl transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Challenge details */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-800 rounded-2xl p-5">
            <h3 className="text-xl font-black text-yellow-400 mb-1">{challenge.title}</h3>
            <p className="text-gray-300">{challenge.description}</p>
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Goals</h4>
            {challenge.targetScore && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">🎯 Target Score</span>
                <span className="text-yellow-400 font-bold">{challenge.targetScore.toLocaleString()}</span>
              </div>
            )}
            {challenge.targetTile && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">🏆 Target Tile</span>
                <span className="text-yellow-400 font-bold">{challenge.targetTile}</span>
              </div>
            )}
            {challenge.maxMoves && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">⚡ Move Limit</span>
                <span className="text-yellow-400 font-bold">{challenge.maxMoves} moves</span>
              </div>
            )}
          </div>

          {/* Progress (if playing) */}
          {isDailyMode && !dailyCompleted && (
            <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Progress</h4>
              {challenge.targetScore && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Score: {currentScore.toLocaleString()}</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
              {movesLeft !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Moves remaining</span>
                  <span className={`font-bold ${movesLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {movesLeft}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Completed */}
          {dailyCompleted && (
            <div className="bg-green-900/30 border border-green-700 rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-green-400 font-black text-lg">Challenge Complete!</p>
              {challenge.score && (
                <p className="text-gray-400 text-sm mt-1">Score: {challenge.score.toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Action */}
          {!dailyCompleted && (
            <button
              onClick={() => { onPlay(); onClose(); }}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-black text-lg rounded-2xl transition-all transform hover:scale-105 shadow-lg"
            >
              {isDailyMode ? '▶ Continue Challenge' : '🎮 Start Challenge'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
