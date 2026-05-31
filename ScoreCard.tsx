import { useEffect, useRef, useState } from 'react';
import { Theme } from '../types/game';

interface ScoreCardProps {
  label: string;
  value: number;
  theme: Theme;
  icon?: string;
}

export default function ScoreCard({ label, value, theme, icon }: ScoreCardProps) {
  const [displayed, setDisplayed] = useState(value);
  const [delta, setDelta] = useState(0);
  const [showDelta, setShowDelta] = useState(false);
  const [bump, setBump] = useState(false);
  const prevRef = useRef(value);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (value !== prevRef.current) {
      const diff = value - prevRef.current;
      if (diff > 0) {
        setDelta(diff);
        setShowDelta(true);
        setBump(true);
        clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setShowDelta(false);
          setBump(false);
        }, 900);
      }
      prevRef.current = value;
      setDisplayed(value);
    }
    return () => clearTimeout(timerRef.current);
  }, [value]);

  return (
    <div className={`relative ${theme.scoreCard} rounded-2xl px-4 py-2 text-center min-w-[80px] shadow-md`}>
      <div className={`text-[10px] font-semibold uppercase tracking-widest ${theme.textDark} opacity-70`}>
        {icon && <span className="mr-0.5">{icon}</span>}
        {label}
      </div>
      <div
        className={`text-xl font-black ${theme.textLight} transition-transform duration-200 ${bump ? 'scale-125' : 'scale-100'}`}
      >
        {displayed.toLocaleString()}
      </div>
      {showDelta && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black text-yellow-400 pointer-events-none whitespace-nowrap animate-slide-in-up">
          +{delta.toLocaleString()}
        </div>
      )}
    </div>
  );
}
