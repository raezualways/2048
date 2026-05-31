import { Achievement, GameStats } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_move',
    title: 'First Step',
    description: 'Make your first move',
    icon: '👣',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.totalMoves >= 1,
  },
  {
    id: 'score_1000',
    title: 'Rookie',
    description: 'Reach a score of 1,000',
    icon: '⭐',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.totalScore >= 1000 || s.currentScore >= 1000,
  },
  {
    id: 'tile_128',
    title: 'Getting Warm',
    description: 'Create a 128 tile',
    icon: '🔥',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.highestTile >= 128,
  },
  {
    id: 'tile_256',
    title: 'Power Player',
    description: 'Create a 256 tile',
    icon: '💪',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.highestTile >= 256,
  },
  {
    id: 'tile_512',
    title: 'Half Way There',
    description: 'Create a 512 tile',
    icon: '🎯',
    rarity: 'rare',
    unlocked: false,
    condition: (s) => s.highestTile >= 512,
  },
  {
    id: 'tile_1024',
    title: 'So Close!',
    description: 'Create a 1024 tile',
    icon: '⚡',
    rarity: 'rare',
    unlocked: false,
    condition: (s) => s.highestTile >= 1024,
  },
  {
    id: 'tile_2048',
    title: '2048 Master',
    description: 'Create the legendary 2048 tile!',
    icon: '👑',
    rarity: 'epic',
    unlocked: false,
    condition: (s) => s.highestTile >= 2048,
  },
  {
    id: 'tile_4096',
    title: 'Beyond the Legend',
    description: 'Create a 4096 tile',
    icon: '🌟',
    rarity: 'epic',
    unlocked: false,
    condition: (s) => s.highestTile >= 4096,
  },
  {
    id: 'tile_8192',
    title: 'Godlike',
    description: 'Create an 8192 tile — absolute insanity!',
    icon: '🏆',
    rarity: 'legendary',
    unlocked: false,
    condition: (s) => s.highestTile >= 8192,
  },
  {
    id: 'score_10000',
    title: 'High Scorer',
    description: 'Reach a score of 10,000',
    icon: '💎',
    rarity: 'rare',
    unlocked: false,
    condition: (s) => s.currentScore >= 10000,
  },
  {
    id: 'score_50000',
    title: 'Score Legend',
    description: 'Reach a score of 50,000',
    icon: '💰',
    rarity: 'epic',
    unlocked: false,
    condition: (s) => s.currentScore >= 50000,
  },
  {
    id: 'games_10',
    title: 'Dedicated',
    description: 'Play 10 games',
    icon: '🎮',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.gamesPlayed >= 10,
  },
  {
    id: 'games_50',
    title: 'Obsessed',
    description: 'Play 50 games',
    icon: '🕹️',
    rarity: 'rare',
    unlocked: false,
    condition: (s) => s.gamesPlayed >= 50,
  },
  {
    id: 'merges_100',
    title: 'Merger',
    description: 'Perform 100 merges in total',
    icon: '🔗',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.totalMerges >= 100,
  },
  {
    id: 'merges_1000',
    title: 'Fusion Master',
    description: 'Perform 1,000 merges in total',
    icon: '⚛️',
    rarity: 'rare',
    unlocked: false,
    condition: (s) => s.totalMerges >= 1000,
  },
  {
    id: 'efficiency',
    title: 'Efficiency Expert',
    description: 'Reach 2048 in under 500 moves',
    icon: '🧠',
    rarity: 'epic',
    unlocked: false,
    condition: (s) => s.highestTile >= 2048 && s.currentMoves <= 500,
  },
  {
    id: 'speedster',
    title: 'Speedster',
    description: 'Reach 1024 in under 200 moves',
    icon: '🚀',
    rarity: 'rare',
    unlocked: false,
    condition: (s) => s.highestTile >= 1024 && s.currentMoves <= 200,
  },
  {
    id: 'daily_1',
    title: 'Daily Grinder',
    description: 'Complete your first daily challenge',
    icon: '📅',
    rarity: 'common',
    unlocked: false,
    condition: (s) => s.gamesWon >= 1,
  },
];

export function checkAchievements(
  achievements: Achievement[],
  stats: GameStats
): { updated: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const updated = achievements.map((ach) => {
    if (!ach.unlocked && ach.condition(stats)) {
      const unlocked = { ...ach, unlocked: true, unlockedAt: Date.now() };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }
    return ach;
  });
  return { updated, newlyUnlocked };
}

export function loadAchievements(): Achievement[] {
  try {
    const saved = localStorage.getItem('2048_achievements');
    if (!saved) return ACHIEVEMENTS;
    const savedData = JSON.parse(saved) as { id: string; unlocked: boolean; unlockedAt?: number }[];
    return ACHIEVEMENTS.map((ach) => {
      const found = savedData.find((s) => s.id === ach.id);
      if (found) return { ...ach, unlocked: found.unlocked, unlockedAt: found.unlockedAt };
      return ach;
    });
  } catch {
    return ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  localStorage.setItem(
    '2048_achievements',
    JSON.stringify(achievements.map(({ id, unlocked, unlockedAt }) => ({ id, unlocked, unlockedAt })))
  );
}
