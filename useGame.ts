import { useState, useCallback, useRef } from 'react';
import { Tile, Direction, GameStats, DailyChallenge } from '../types/game';
import {
  initGame,
  moveTiles,
  addRandomTile,
  checkGameOver,
  checkWon,
  getHighestTile,
  deserializeTiles,
} from '../utils/gameLogic';
import { checkAchievements, loadAchievements, saveAchievements } from '../utils/achievements';
import { Achievement } from '../types/game';
import {
  loadBestScore,
  saveBestScore,
  loadStats,
  saveStats,
  addLeaderboardEntry,
  loadDailyChallenges,
  saveDailyChallenges,
  getTodayKey,
  generateDailyChallenge,
  saveGameState,
  loadGameState,
  clearGameState,
} from '../utils/storage';

export interface UseGameReturn {
  tiles: Tile[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  moveCount: number;
  stats: GameStats;
  achievements: Achievement[];
  newAchievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  isDailyMode: boolean;
  dailyMoves: number;
  dailyCompleted: boolean;
  move: (dir: Direction) => void;
  newGame: (useDaily?: boolean) => void;
  continueGame: () => void;
  clearNewAchievements: () => void;
  submitScore: (name: string, theme: string) => void;
}

export function useGame(): UseGameReturn {
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const saved = loadGameState();
    if (saved && Array.isArray(saved.tiles) && saved.tiles.length > 0) {
      return deserializeTiles(JSON.stringify(saved.tiles));
    }
    return initGame();
  });
  const [score, setScore] = useState(() => {
    const saved = loadGameState();
    return saved ? saved.score : 0;
  });
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [dailyMoves, setDailyMoves] = useState(0);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(() => {
    const challenges = loadDailyChallenges();
    const today = getTodayKey();
    return challenges[today] || generateDailyChallenge(today);
  });
  const movingRef = useRef(false);

  const checkDailyCompletion = useCallback(
    (currentScore: number, tiles: Tile[], moves: number, challenge: DailyChallenge) => {
      if (dailyCompleted || !isDailyMode) return false;
      let completed = false;
      if (challenge.targetScore && currentScore >= challenge.targetScore) completed = true;
      if (challenge.targetTile && getHighestTile(tiles) >= challenge.targetTile) completed = true;
      if (challenge.maxMoves && moves >= challenge.maxMoves && !completed) return false;
      if (completed) {
        setDailyCompleted(true);
        const challenges = loadDailyChallenges();
        const today = getTodayKey();
        const updated = { ...challenges, [today]: { ...challenge, completed: true, score: currentScore } };
        saveDailyChallenges(updated);
        setDailyChallenge({ ...challenge, completed: true, score: currentScore });
        const newStats = { ...stats, gamesWon: stats.gamesWon + 1 };
        setStats(newStats);
        saveStats(newStats);
      }
      return completed;
    },
    [dailyCompleted, isDailyMode, stats]
  );

  const move = useCallback(
    (dir: Direction) => {
      if (movingRef.current) return;
      if (gameOver) return;
      if (won && !keepPlaying) return;
      if (isDailyMode && dailyChallenge?.maxMoves && dailyMoves >= dailyChallenge.maxMoves && !dailyCompleted) return;

      movingRef.current = true;
      setTimeout(() => { movingRef.current = false; }, 120);

      setTiles((prev) => {
        const result = moveTiles(prev, dir);
        if (!result.moved) return prev;

        const newTiles = addRandomTile(result.tiles);
        const newScore = score + result.score;
        const newMoveCount = moveCount + 1;
        const newDailyMoves = dailyMoves + 1;
        const highest = getHighestTile(newTiles);

        // Update score
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
          saveBestScore(newScore);
        }

        setMoveCount(newMoveCount);
        if (isDailyMode) setDailyMoves(newDailyMoves);

        // Update stats
        const newStats: GameStats = {
          ...stats,
          highestTile: Math.max(stats.highestTile, highest),
          totalMoves: stats.totalMoves + 1,
          totalScore: stats.totalScore + result.score,
          currentScore: newScore,
          currentMoves: newMoveCount,
          totalMerges: stats.totalMerges + result.mergeCount,
          mergeCount: result.mergeCount,
        };
        setStats(newStats);
        saveStats(newStats);

        // Check achievements
        const { updated, newlyUnlocked } = checkAchievements(achievements, newStats);
        if (newlyUnlocked.length > 0) {
          setAchievements(updated);
          saveAchievements(updated);
          setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
        }

        // Check win
        if (!won && !keepPlaying && checkWon(newTiles)) {
          setWon(true);
        }

        // Check game over
        if (checkGameOver(newTiles)) {
          setGameOver(true);
          setStats((s) => {
            const updated = { ...s, gamesPlayed: s.gamesPlayed + 1 };
            saveStats(updated);
            return updated;
          });
          clearGameState();
        } else {
          saveGameState(newTiles.map(({ value, row, col }) => ({ value, row, col })), newScore);
        }

        // Check daily
        if (isDailyMode && dailyChallenge) {
          checkDailyCompletion(newScore, newTiles, newDailyMoves, dailyChallenge);
        }

        return newTiles;
      });
    },
    [gameOver, won, keepPlaying, score, bestScore, moveCount, stats, achievements, isDailyMode, dailyMoves, dailyChallenge, dailyCompleted, checkDailyCompletion]
  );

  const newGame = useCallback((useDaily = false) => {
    const saved = loadDailyChallenges();
    const today = getTodayKey();
    const challenge = saved[today] || generateDailyChallenge(today);

    let newTiles: Tile[];
    if (useDaily && challenge.startingTiles) {
      newTiles = initGame(challenge.startingTiles);
    } else {
      newTiles = initGame();
    }

    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setMoveCount(0);
    setIsDailyMode(useDaily);
    setDailyMoves(0);
    setDailyCompleted(challenge.completed && useDaily);
    setDailyChallenge(challenge);
    clearGameState();

    setStats((s) => {
      const updated = { ...s, currentScore: 0, currentMoves: 0 };
      saveStats(updated);
      return updated;
    });
  }, []);

  const continueGame = useCallback(() => {
    setWon(false);
    setKeepPlaying(true);
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const submitScore = useCallback(
    (name: string, theme: string) => {
      addLeaderboardEntry({
        name,
        score,
        highestTile: getHighestTile(tiles),
        date: Date.now(),
        moves: moveCount,
        theme,
      });
    },
    [score, tiles, moveCount]
  );

  return {
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
  };
}
