import { useEffect, useRef, useState } from 'react';
import { Tile, Theme } from '../types/game';

interface TileProps {
  tile: Tile;
  theme: Theme;
  getTileColor: (theme: Theme, value: number) => string;
}

function getTileFontSize(value: number): string {
  if (value >= 100000) return 'clamp(8px, 1.8vw, 12px)';
  if (value >= 10000) return 'clamp(10px, 2vw, 14px)';
  if (value >= 1000) return 'clamp(12px, 2.4vw, 18px)';
  if (value >= 100) return 'clamp(16px, 3vw, 24px)';
  return 'clamp(20px, 4vw, 32px)';
}

function formatValue(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 100000) return (value / 1000).toFixed(0) + 'k';
  return String(value);
}

function getNeonBorder(value: number): string {
  const colorMap: Record<number, string> = {
    2: '#00ff88',
    4: '#00ffcc',
    8: '#00eeff',
    16: '#0088ff',
    32: '#aa00ff',
    64: '#ff00aa',
    128: '#ff0055',
    256: '#ff6600',
    512: '#ffcc00',
    1024: '#ffffff',
    2048: '#00ff88',
    4096: '#ff00aa',
    8192: '#ffffff',
  };
  const keys = Object.keys(colorMap).map(Number).sort((a, b) => a - b);
  const maxKey = keys[keys.length - 1];
  const color = colorMap[value >= maxKey ? maxKey : value] || '#00ff88';
  return color;
}

export default function TileComponent({ tile, theme, getTileColor }: TileProps) {
  const [animState, setAnimState] = useState<'hidden' | 'appear' | 'idle' | 'merge'>('hidden');
  const mergedRef = useRef(false);

  useEffect(() => {
    if (tile.isNew) {
      // Pop-in animation
      requestAnimationFrame(() => {
        setTimeout(() => setAnimState('appear'), 10);
        setTimeout(() => setAnimState('idle'), 260);
      });
    } else {
      setAnimState('idle');
    }
  }, []);  // eslint-disable-line

  useEffect(() => {
    if (tile.isMerged && !mergedRef.current) {
      mergedRef.current = true;
      setAnimState('merge');
      setTimeout(() => {
        setAnimState('idle');
        mergedRef.current = false;
      }, 220);
    }
  }, [tile.isMerged]);

  const colorClass = getTileColor(theme, tile.value);
  const isNeon = theme.id === 'neon';
  const neonColor = isNeon ? getNeonBorder(tile.value) : undefined;
  const is2048Plus = tile.value >= 2048;

  const getTransform = () => {
    if (animState === 'hidden') return 'scale(0) rotate(-15deg)';
    if (animState === 'appear') return 'scale(1.12) rotate(2deg)';
    if (animState === 'merge') return 'scale(1.15)';
    return 'scale(1) rotate(0deg)';
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    // Gap is 12px (gap-3 = 0.75rem = 12px)
    // 4 tiles + 3 gaps in each dimension
    width: 'calc((100% - 36px) / 4)',
    height: 'calc((100% - 36px) / 4)',
    left: `calc(${tile.col} * ((100% - 36px) / 4 + 12px))`,
    top: `calc(${tile.row} * ((100% - 36px) / 4 + 12px))`,
    transition: 'left 0.13s cubic-bezier(0.2, 0, 0, 1), top 0.13s cubic-bezier(0.2, 0, 0, 1), transform 0.15s ease',
    transform: getTransform(),
    fontSize: getTileFontSize(tile.value),
    boxShadow: neonColor
      ? `0 0 12px ${neonColor}80, 0 0 24px ${neonColor}40, inset 0 0 8px ${neonColor}20`
      : is2048Plus
      ? '0 0 20px rgba(234,179,8,0.6), 0 4px 15px rgba(0,0,0,0.3)'
      : '0 2px 8px rgba(0,0,0,0.2)',
    border: neonColor ? `1px solid ${neonColor}` : undefined,
    zIndex: tile.isMerged ? 10 : 5,
  };

  return (
    <div
      style={style}
      className={`
        rounded-xl flex items-center justify-center font-black leading-none
        ${colorClass}
        ${is2048Plus && !isNeon ? 'animate-pulse-glow' : ''}
      `}
    >
      <span style={{ fontSize: 'inherit', lineHeight: 1 }}>
        {formatValue(tile.value)}
      </span>
      {/* Shine effect for high value tiles */}
      {is2048Plus && !isNeon && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }}
        />
      )}
    </div>
  );
}
