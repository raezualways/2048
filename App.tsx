import { useState, useCallback, useMemo } from 'react';
import { useGame } from './hooks/useGame';
import { THEMES } from './utils/themes';
import { loadTheme, saveTheme, loadLeaderboard } from './utils/storage';
import { ThemeId } from './types/game';
import GameBoard from './components/GameBoard';
import ScoreCard from './components/ScoreCard';
import AchievementToast from './components/AchievementToast';
import AchievementsPanel from './components/AchievementsPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import ThemePanel from './components/ThemePanel';
import DailyChallengePanel from './components/DailyChallenge';
import StatsPanel from './components/StatsPanel';

type Panel = 'none' | 'achievements' | 'leaderboard' | 'themes' | 'daily' | 'stats';

// Particle star for neon/galaxy
function Particle({ themeId }: { themeId: ThemeId }) {
  const particles = useMemo(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      color: themeId === 'neon' ? '#00ff88' : themeId === 'galaxy' ? '#9c27b0' : '#ffd700',
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    })),
  [themeId]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size + 'px',
            height: p.size + 'px',
            background: p.color,
            left: p.left + '%',
            top: p.top + '%',
            animation: `twinkle ${p.duration}s ease-in-out infinite ${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>(loadTheme);
  const theme = THEMES[themeId];
  const [openPanel, setOpenPanel] = useState<Panel>('none');
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);


  const {
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    keepPlaying,
    moveCount,
    stats,
    achievements,
    newAchievements,
    dailyChallenge,
    isDailyMode,
    dailyMoves,
    dailyCompleted,
    move,
    newGame,
    continueGame,
    clearNewAchievements,
    submitScore,
  } = useGame();

  const handleThemeSelect = useCallback((id: ThemeId) => {
    setThemeId(id);
    saveTheme(id);
  }, []);

  const handleSubmitScore = useCallback(
    (name: string) => {
      submitScore(name, themeId);
      setLeaderboard(loadLeaderboard());
    },
    [submitScore, themeId]
  );

  const handleNewGame = useCallback(() => {
    newGame(false);
  }, [newGame]);

  const handleDailyPlay = useCallback(() => {
    newGame(true);
  }, [newGame]);

  const closePanel = () => setOpenPanel('none');

  const todayCompleted = dailyChallenge?.completed;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const hasParticles = themeId === 'neon' || themeId === 'galaxy' || themeId === 'fire';

  // Neon border glow for board
  const boardGlow = themeId === 'neon'
    ? '0 0 40px rgba(0,255,136,0.2), 0 0 80px rgba(0,255,136,0.1)'
    : themeId === 'galaxy'
    ? '0 0 40px rgba(156,39,176,0.3)'
    : undefined;

  return (
    <div
      className={`min-h-screen ${theme.background} flex flex-col items-center justify-start pb-10 relative overflow-hidden transition-colors duration-500`}
      style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}
    >
      {/* Background particles */}
      {hasParticles && <Particle themeId={themeId} />}

      {/* Fire background glow */}
      {themeId === 'fire' && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,87,34,0.3) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Ocean wave overlay */}
      {themeId === 'ocean' && (
        <div
          className="fixed bottom-0 inset-x-0 h-32 pointer-events-none z-0 opacity-20"
          style={{
            background: 'linear-gradient(to top, rgba(0,119,182,0.8), transparent)',
          }}
        />
      )}

      <div className="w-full max-w-lg px-4 pt-6 relative z-10">
        {/* === HEADER === */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className={`text-5xl font-black ${theme.textLight} leading-none tracking-tight`}
                style={
                  themeId === 'neon'
                    ? { textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8880' }
                    : themeId === 'galaxy'
                    ? { textShadow: '0 0 20px #ce93d8, 0 0 40px #9c27b080' }
                    : undefined
                }
              >
                2048
              </h1>
              {isDailyMode && (
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  Daily
                </span>
              )}
            </div>
            <p className={`text-xs ${theme.textDark} mt-1 font-medium opacity-60`}>
              Join tiles, reach <span className="font-black opacity-100">2048!</span>
            </p>
          </div>

          {/* Score cards */}
          <div className="flex gap-2">
            <ScoreCard label="Score" value={score} theme={theme} />
            <ScoreCard label="Best" value={bestScore} theme={theme} icon="⭐" />
          </div>
        </div>

        {/* === ACTION BAR === */}
        <div className="flex items-center gap-2 mb-4">
          {/* New Game */}
          <button
            onClick={handleNewGame}
            className={`flex-1 py-3 px-4 ${theme.accent} ${theme.accentHover} ${theme.textLight} font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg text-sm tracking-wide`}
          >
            🔄 New Game
          </button>

          {/* Daily */}
          <button
            onClick={() => setOpenPanel('daily')}
            className={`relative py-3 px-4 rounded-2xl text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-1.5
              ${todayCompleted
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-black'
              }`}
          >
            📅
            <span className="hidden sm:inline">{todayCompleted ? 'Done!' : 'Daily'}</span>
            {!todayCompleted && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-current" />
            )}
          </button>

          {/* Move counter */}
          <div
            className={`py-3 px-4 ${theme.scoreCard} rounded-2xl text-center min-w-[60px] shadow-md`}
            style={boardGlow ? { boxShadow: undefined } : undefined}
          >
            <div className={`text-[10px] font-semibold uppercase tracking-wider ${theme.textDark} opacity-70`}>Moves</div>
            <div className={`text-sm font-black ${theme.textLight}`}>{moveCount}</div>
          </div>
        </div>

        {/* === GAME BOARD === */}
        <div style={boardGlow ? { borderRadius: 20, boxShadow: boardGlow } : undefined}>
          <GameBoard
            tiles={tiles}
            theme={theme}
            onMove={move}
            gameOver={gameOver}
            won={won}
            keepPlaying={keepPlaying}
            onNewGame={handleNewGame}
            onContinue={continueGame}
            score={score}
          />
        </div>

        {/* === DAILY PROGRESS === */}
        {isDailyMode && dailyChallenge && (
          <div
            className={`mt-4 p-4 ${theme.boardBg} rounded-2xl shadow-inner animate-slide-in-up`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-black ${theme.textLight}`}>{dailyChallenge.title}</span>
              {dailyCompleted ? (
                <span className="text-green-400 text-sm font-bold flex items-center gap-1">✓ Complete!</span>
              ) : dailyChallenge.maxMoves ? (
                <span className={`text-xs font-bold ${
                  (dailyChallenge.maxMoves - dailyMoves) <= 10 ? 'text-red-400' : `${theme.textDark}`
                }`}>
                  {dailyChallenge.maxMoves - dailyMoves} moves left
                </span>
              ) : null}
            </div>
            <p className={`text-xs ${theme.textDark} opacity-60 mb-3`}>{dailyChallenge.description}</p>

            {dailyChallenge.maxMoves && (
              <div className="mb-2">
                <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, (dailyMoves / dailyChallenge.maxMoves) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {dailyChallenge.targetScore && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`${theme.textDark} opacity-60`}>Score goal</span>
                  <span className={`${theme.textLight} font-bold`}>
                    {Math.min(score, dailyChallenge.targetScore).toLocaleString()} / {dailyChallenge.targetScore.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, (score / dailyChallenge.targetScore) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* === BOTTOM NAVIGATION === */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {([
            { id: 'achievements', icon: '🏅', label: 'Medals', sub: `${unlockedCount}/${achievements.length}` },
            { id: 'leaderboard', icon: '🏆', label: 'Ranks', sub: `Top ${leaderboard.length}` },
            { id: 'stats', icon: '📊', label: 'Stats', sub: `${stats.gamesPlayed} games` },
            { id: 'themes', icon: '🎨', label: 'Themes', sub: THEMES[themeId].name },
          ] as { id: Panel; icon: string; label: string; sub: string }[]).map(({ id, icon, label, sub }) => (
            <button
              key={id}
              onClick={() => setOpenPanel(id)}
              className={`
                flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all transform hover:scale-105 active:scale-95
                ${theme.scoreCard} ${theme.textDark}
                ${openPanel === id ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}
                shadow-md
              `}
            >
              <span className="text-2xl">{icon}</span>
              <span className={`text-xs font-bold ${theme.textLight} leading-none`}>{label}</span>
              <span className="text-[9px] opacity-50 leading-none mt-0.5">{sub}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-6 text-center text-xs ${theme.textDark} opacity-30 font-medium`}>
          2048 Pro · Optimized Puzzle Game
        </div>
      </div>

      {/* === PANELS === */}
      {openPanel === 'achievements' && (
        <AchievementsPanel achievements={achievements} onClose={closePanel} />
      )}
      {openPanel === 'leaderboard' && (
        <LeaderboardPanel
          entries={leaderboard}
          onClose={closePanel}
          currentScore={score}
          onSubmit={handleSubmitScore}
          gameOver={gameOver}
        />
      )}
      {openPanel === 'themes' && (
        <ThemePanel currentTheme={themeId} onSelect={handleThemeSelect} onClose={closePanel} />
      )}
      {openPanel === 'daily' && (
        <DailyChallengePanel
          challenge={dailyChallenge}
          onPlay={handleDailyPlay}
          onClose={closePanel}
          isDailyMode={isDailyMode}
          dailyMoves={dailyMoves}
          dailyCompleted={dailyCompleted}
          currentScore={score}
        />
      )}
      {openPanel === 'stats' && (
        <StatsPanel stats={stats} onClose={closePanel} />
      )}

      {/* === ACHIEVEMENT TOASTS === */}
      <AchievementToast achievements={newAchievements} onDone={clearNewAchievements} />
    </div>
  );
}
