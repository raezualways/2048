import { ThemeId } from '../types/game';
import { THEMES } from '../utils/themes';

interface Props {
  currentTheme: ThemeId;
  onSelect: (id: ThemeId) => void;
  onClose: () => void;
}

export default function ThemePanel({ currentTheme, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-black text-white">🎨 Themes</h2>
            <p className="text-gray-400 text-sm mt-1">Choose your style</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-4 grid grid-cols-2 gap-3">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const theme = THEMES[id];
            const isActive = currentTheme === id;
            return (
              <button
                key={id}
                onClick={() => { onSelect(id); onClose(); }}
                className={`
                  relative rounded-2xl p-4 text-left transition-all transform hover:scale-105 border-2
                  ${isActive ? 'border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'border-transparent hover:border-gray-500'}
                `}
                style={{ background: theme.preview }}
              >
                {/* Mini board preview */}
                <div className="grid grid-cols-4 gap-1 mb-3 rounded-lg overflow-hidden p-1" style={{ background: '#00000030' }}>
                  {[2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((v, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded flex items-center justify-center text-[6px] font-black ${theme.tiles[v] || ''}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="font-black text-base"
                      style={{ color: theme.id === 'classic' || theme.id === 'candy' ? '#333' : '#fff' }}
                    >
                      {theme.name}
                    </div>
                    <div
                      className="text-xs opacity-70 mt-0.5"
                      style={{ color: theme.id === 'classic' || theme.id === 'candy' ? '#555' : '#ccc' }}
                    >
                      {theme.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="text-yellow-400 text-xl ml-2">✓</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
