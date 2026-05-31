export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
  prevRow?: number;
  prevCol?: number;
}

export interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  moved: boolean;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  moveCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: GameStats) => boolean;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameStats {
  highestTile: number;
  totalMoves: number;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  currentScore: number;
  currentMoves: number;
  mergeCount: number;
  totalMerges: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  highestTile: number;
  date: number;
  moves: number;
  theme: string;
}

export interface DailyChallenge {
  date: string;
  title: string;
  description: string;
  targetScore?: number;
  targetTile?: number;
  maxMoves?: number;
  startingTiles?: { value: number; row: number; col: number }[];
  completed: boolean;
  score?: number;
}

export type ThemeId = 'classic' | 'ocean' | 'forest' | 'galaxy' | 'fire' | 'candy' | 'monochrome' | 'neon';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: string;
  background: string;
  boardBg: string;
  cellBg: string;
  headerBg: string;
  tiles: Record<number, string>;
  textLight: string;
  textDark: string;
  accent: string;
  accentHover: string;
  scoreCard: string;
  font?: string;
}
