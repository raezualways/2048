import { useEffect, useState } from 'react';
import { Achievement } from '../types/game';

interface Props {
  achievements: Achievement[];
  onDone: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'from-gray-600 to-gray-800 border-gray-500',
  rare: 'from-blue-600 to-blue-900 border-blue-400',
  epic: 'from-purple-600 to-purple-900 border-purple-400',
  legendary: 'from-yellow-500 to-orange-700 border-yellow-300',
};

const RARITY_GLOW: Record<string, string> = {
  common: '',
  rare: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  epic: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  legendary: 'shadow-[0_0_30px_rgba(234,179,8,0.7)]',
};

export default function AchievementToast({ achievements, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) return;
    setCurrentIdx(0);
    setVisible(true);
  }, [achievements]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      if (currentIdx < achievements.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        setVisible(false);
        onDone();
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [visible, currentIdx, achievements.length, onDone]);

  if (!visible || achievements.length === 0) return null;

  const ach = achievements[currentIdx];
  const colors = RARITY_COLORS[ach.rarity];
  const glow = RARITY_GLOW[ach.rarity];

  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in-right">
      <div
        className={`
          flex items-center gap-4 px-5 py-4 rounded-2xl
          bg-gradient-to-br ${colors} border ${glow}
          max-w-sm shadow-2xl
        `}
      >
        <div className="text-4xl animate-bounce">{ach.icon}</div>
        <div>
          <div className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-0.5">
            🏅 Achievement Unlocked — <span className="capitalize">{ach.rarity}</span>
          </div>
          <div className="text-white font-black text-lg leading-tight">{ach.title}</div>
          <div className="text-white/70 text-sm">{ach.description}</div>
        </div>
      </div>
    </div>
  );
}
