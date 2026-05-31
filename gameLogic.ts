import { Tile, Direction } from '../types/game';

let tileIdCounter = 0;

export function createTile(row: number, col: number, value: number): Tile {
  return {
    id: ++tileIdCounter,
    value,
    row,
    col,
    isNew: true,
    isMerged: false,
  };
}

export function getEmptyCells(tiles: Tile[]): { row: number; col: number }[] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!occupied.has(`${r},${c}`)) empty.push({ row: r, col: c });
    }
  }
  return empty;
}

export function addRandomTile(tiles: Tile[]): Tile[] {
  const empty = getEmptyCells(tiles);
  if (empty.length === 0) return tiles;
  const cell = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  return [...tiles, createTile(cell.row, cell.col, value)];
}

export function initGame(startingTiles?: { value: number; row: number; col: number }[]): Tile[] {
  tileIdCounter = 0;
  if (startingTiles) {
    let tiles: Tile[] = startingTiles.map((t) => createTile(t.row, t.col, t.value));
    tiles = addRandomTile(tiles);
    tiles = addRandomTile(tiles);
    return tiles;
  }
  let tiles: Tile[] = [];
  tiles = addRandomTile(tiles);
  tiles = addRandomTile(tiles);
  return tiles;
}

export function moveTiles(tiles: Tile[], direction: Direction): { tiles: Tile[]; score: number; moved: boolean; mergeCount: number } {
  const grid: (Tile | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  tiles.forEach((t) => { grid[t.row][t.col] = { ...t, isNew: false, isMerged: false }; });

  let score = 0;
  let moved = false;
  let mergeCount = 0;
  const newGrid: (Tile | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));

  const processLine = (indices: [number, number][]): void => {
    const line = indices.map(([r, c]) => grid[r][c]).filter(Boolean) as Tile[];
    const merged: Tile[] = [];
    let i = 0;
    while (i < line.length) {
      if (i + 1 < line.length && line[i].value === line[i + 1].value) {
        const newValue = line[i].value * 2;
        score += newValue;
        mergeCount++;
        merged.push({ ...line[i], value: newValue, isMerged: true, prevRow: line[i].row, prevCol: line[i].col });
        i += 2;
      } else {
        merged.push({ ...line[i], prevRow: line[i].row, prevCol: line[i].col });
        i++;
      }
    }
    merged.forEach((tile, idx) => {
      const [r, c] = indices[idx];
      if (tile.row !== r || tile.col !== c) moved = true;
      newGrid[r][c] = { ...tile, row: r, col: c };
    });
  };

  if (direction === 'left') {
    for (let r = 0; r < 4; r++) {
      processLine([[r, 0], [r, 1], [r, 2], [r, 3]]);
    }
  } else if (direction === 'right') {
    for (let r = 0; r < 4; r++) {
      processLine([[r, 3], [r, 2], [r, 1], [r, 0]]);
    }
  } else if (direction === 'up') {
    for (let c = 0; c < 4; c++) {
      processLine([[0, c], [1, c], [2, c], [3, c]]);
    }
  } else {
    for (let c = 0; c < 4; c++) {
      processLine([[3, c], [2, c], [1, c], [0, c]]);
    }
  }

  const resultTiles: Tile[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (newGrid[r][c]) resultTiles.push(newGrid[r][c]!);
    }
  }

  return { tiles: resultTiles, score, moved, mergeCount };
}

export function checkGameOver(tiles: Tile[]): boolean {
  if (getEmptyCells(tiles).length > 0) return false;
  const grid: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  tiles.forEach((t) => { grid[t.row][t.col] = t.value; });
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (c + 1 < 4 && grid[r][c] === grid[r][c + 1]) return false;
      if (r + 1 < 4 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

export function checkWon(tiles: Tile[]): boolean {
  return tiles.some((t) => t.value >= 2048);
}

export function getHighestTile(tiles: Tile[]): number {
  return tiles.reduce((max, t) => Math.max(max, t.value), 0);
}

export function serializeTiles(tiles: Tile[]): string {
  return JSON.stringify(tiles.map(({ value, row, col }) => ({ value, row, col })));
}

export function deserializeTiles(data: string): Tile[] {
  try {
    const parsed = JSON.parse(data) as { value: number; row: number; col: number }[];
    return parsed.map((t) => createTile(t.row, t.col, t.value));
  } catch {
    return [];
  }
}
