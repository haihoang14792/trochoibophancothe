import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, Settings } from 'lucide-react';
import { CharacterType, GameLevel } from '../types';
import { useFirebase } from '../context/FirebaseContext';

interface HeaderBarProps {
  character: CharacterType;
  onToggleCharacter: () => void;
  level: GameLevel;
  onSelectLevel: (lvl: GameLevel) => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  character,
  onToggleCharacter,
  level,
  onSelectLevel,
  onRestart,
  isMuted,
  onToggleMute,
  onOpenSettings,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { user } = useFirebase();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-3 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200/80 bg-white/70 backdrop-blur-md rounded-2xl shadow-xs">
      {/* Brand & Character switch */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-xs">
            👶
          </div>
          <span className="font-extrabold text-amber-950 text-base sm:text-xl tracking-tight hidden xs:inline">
            Bé Ghép Khuôn Mặt
          </span>
        </div>

        {/* Character Switcher Button */}
        <button
          onClick={onToggleCharacter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm border border-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Đổi nhân vật Bé Trai / Bé Gái"
        >
          <span>{character === 'boy' ? '👦 Bé Trai' : '👧 Bé Gái'}</span>
          <span className="text-[10px] bg-amber-300/80 text-amber-900 rounded-md px-1 py-0.5">
            Đổi
          </span>
        </button>
      </div>

      {/* Level Selector */}
      <div className="flex items-center gap-1 bg-amber-100/70 p-1 rounded-xl border border-amber-200 text-xs sm:text-sm font-bold">
        <button
          onClick={() => onSelectLevel(1)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            level === 1
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          Mức Dễ (4 hình)
        </button>
        <button
          onClick={() => onSelectLevel(2)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            level === 2
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          Mức Khó (6 hình)
        </button>
      </div>

      {/* Action Controls: Settings, Restart, Audio, Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Teacher Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Chế độ dành cho Giáo Viên & Đồng bộ Firebase"
        >
          <Settings className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline">Giáo Viên</span>
          {user && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Firebase đã kết nối" />
          )}
        </button>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Chơi lại từ đầu"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Chơi lại</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            isMuted
              ? 'bg-slate-200 text-slate-600 border-slate-300'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs'
          }`}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer active:scale-95"
          title="Bật/Tắt toàn màn hình"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 stroke-[2]" />
          ) : (
            <Maximize2 className="w-5 h-5 stroke-[2]" />
          )}
        </button>
      </div>
    </header>
  );
};
