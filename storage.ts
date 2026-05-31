import { LeaderboardEntry, GameStats, DailyChallenge } from '../types/game';
import { ThemeId } from '../types/game';

const PREFIX = '2048_';

export function loadBestScore(): number {
  return parseInt(localStorage.getItem(`${PREFIX}best`) || '0', 10);
}

export function saveBestScore(score: number): void {
  localStorage.setItem(`${PREFIX}best`, String(score));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(`${PREFIX}leaderboard`);
    return data ? JSON.parse(data) : generateMockLeaderboard();
  } catch {
    return generateMockLeaderboard();
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  localStorage.setItem(`${PREFIX}leaderboard`, JSON.stringify(entries));
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): LeaderboardEntry[] {
  const board = loadLeaderboard();
  const newEntry: LeaderboardEntry = { ...entry, id: `user_${Date.now()}` };
  const updated = [...board, newEntry].sort((a, b) => b.score - a.score).slice(0, 20);
  saveLeaderboard(updated);
  return updated;
}

function generateMockLeaderboard(): LeaderboardEntry[] {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
  const entries: LeaderboardEntry[] = names.map((name, i) => ({
    id: `mock_${i}`,
    name,
    score: Math.floor(Math.random() * 80000) + 5000 - i * 3000,
    highestTile: [2048, 4096, 1024, 2048, 512, 4096, 2048, 1024, 2048, 4096][i],
    date: Date.now() - i * 86400000,
    moves: Math.floor(Math.random() * 800) + 200,
    theme: ['classic', 'ocean', 'galaxy', 'fire', 'forest'][i % 5],
  }));
  return entries.sort((a, b) => b.score - a.score);
}

export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(`${PREFIX}stats`);
    return data
      ? JSON.parse(data)
      : {
          highestTile: 0,
          totalMoves: 0,
          totalScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          currentScore: 0,
          currentMoves: 0,
          mergeCount: 0,
          totalMerges: 0,
        };
  } catch {
    return {
      highestTile: 0,
      totalMoves: 0,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      currentScore: 0,
      currentMoves: 0,
      mergeCount: 0,
      totalMerges: 0,
    };
  }
}

export function saveStats(stats: GameStats): void {
  localStorage.setItem(`${PREFIX}stats`, JSON.stringify(stats));
}

export function loadTheme(): ThemeId {
  return (localStorage.getItem(`${PREFIX}theme`) as ThemeId) || 'classic';
}

export function saveTheme(theme: ThemeId): void {
  localStorage.setItem(`${PREFIX}theme`, theme);
}

export function loadDailyChallenges(): Record<string, DailyChallenge> {
  try {
    const data = localStorage.getItem(`${PREFIX}daily`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveDailyChallenges(challenges: Record<string, DailyChallenge>): void {
  localStorage.setItem(`${PREFIX}daily`, JSON.stringify(challenges));
}

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function generateDailyChallenge(dateKey: string): DailyChallenge {
  const seed = dateKey.split('-').reduce((acc, n) => acc + parseInt(n), 0);
  const challenges = [
    {
      title: '🎯 Score Rush',
      description: 'Reach 5,000 points in 100 moves!',
      targetScore: 5000,
      maxMoves: 100,
    },
    {
      title: '🏃 Speed Run',
      description: 'Create a 512 tile in under 80 moves!',
      targetTile: 512,
      maxMoves: 80,
    },
    {
      title: '⚡ Lightning Round',
      description: 'Score 3,000 points in 60 moves!',
      targetScore: 3000,
      maxMoves: 60,
    },
    {
      title: '🎲 Survivor',
      description: 'Survive 200 moves and score 10,000 points',
      targetScore: 10000,
      maxMoves: 200,
    },
    {
      title: '🌟 High Roller',
      description: 'Reach the 1024 tile!',
      targetTile: 1024,
    },
    {
      title: '🧩 Puzzle Master',
      description: 'Score 20,000 points',
      targetScore: 20000,
    },
    {
      title: '🚀 Blitz Mode',
      description: 'Score 2,048 points in only 50 moves!',
      targetScore: 2048,
      maxMoves: 50,
    },
  ];
  const challenge = challenges[seed % challenges.length];
  return {
    date: dateKey,
    ...challenge,
    completed: false,
  };
}

export function saveGameState(tiles: unknown, score: number): void {
  try {
    localStorage.setItem(`${PREFIX}game_state`, JSON.stringify({ tiles, score }));
  } catch {
    // ignore
  }
}

export function loadGameState(): { tiles: unknown; score: number } | null {
  try {
    const data = localStorage.getItem(`${PREFIX}game_state`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(`${PREFIX}game_state`);
}
