import { useEffect, useCallback, useRef } from 'react';
import { Tile, Direction, Theme } from '../types/game';
import { getTileColor } from '../utils/themes';
import TileComponent from './TileComponent';

interface GameBoardProps {
  tiles: Tile[];
  theme: Theme;
  onMove: (dir: Direction) => void;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  score: number;
}

export default function GameBoard({
  tiles,
  theme,
  onMove,
  gameOver,
  won,
  keepPlaying,
  onNewGame,
  onContinue,
}: GameBoardProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      };
      if (map[e.key]) {
        e.preventDefault();
        onMove(map[e.key]);
      }
    },
    [onMove]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 20) return;
    if (absDx > absDy) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  const showOverlay = gameOver || (won && !keepPlaying);

  return (
    <div className="relative select-none">
      <div
        ref={boardRef}
        className={`relative rounded-2xl p-3 ${theme.boardBg} shadow-2xl`}
        style={{
          width: '100%',
          maxWidth: 480,
          aspectRatio: '1 / 1',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background grid cells */}
        <div className="grid grid-cols-4 gap-3 h-full">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={`rounded-xl ${theme.cellBg} opacity-60`} />
          ))}
        </div>

        {/* Tiles overlay - positioned absolutely over the grid */}
        <div className="absolute inset-3">
          {tiles.map((tile) => (
            <TileComponent key={tile.id} tile={tile} theme={theme} getTileColor={getTileColor} />
          ))}
        </div>

        {/* Game over / win overlay */}
        {showOverlay && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm z-50 animate-fade-in">
            {won && !keepPlaying ? (
              <>
                <div className="text-7xl mb-4 animate-bounce">👑</div>
                <h2 className="text-4xl font-black text-yellow-400 mb-2 drop-shadow-lg">You Won!</h2>
                <p className="text-white/80 mb-8 text-center px-6 text-sm">
                  You reached the legendary 2048 tile! Keep going for glory?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onContinue}
                    className="px-7 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-black rounded-2xl transition-all transform hover:scale-105 shadow-xl text-sm"
                  >
                    ✨ Keep Playing
                  </button>
                  <button
                    onClick={onNewGame}
                    className="px-7 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-2xl transition-all transform hover:scale-105 text-sm"
                  >
                    🔄 New Game
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-7xl mb-4 animate-float">😔</div>
                <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Game Over!</h2>
                <p className="text-white/80 mb-8 text-sm">No more moves. You gave it your all!</p>
                <button
                  onClick={onNewGame}
                  className="px-10 py-4 bg-white hover:bg-gray-100 text-gray-900 font-black rounded-2xl transition-all transform hover:scale-105 shadow-xl"
                >
                  🔄 Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <p className={`mt-2 text-center text-xs ${theme.textDark} opacity-40 font-medium`}>
        ← → ↑ ↓  ·  WASD  ·  Swipe
      </p>
    </div>
  );
}
