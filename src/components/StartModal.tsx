import React from 'react';
import { Play, Volume2 } from 'lucide-react';
import { CharacterType } from '../types';
import { soundEngine } from '../utils/audio';

interface StartModalProps {
  isOpen: boolean;
  onStart: () => void;
  character: CharacterType;
  onSelectCharacter: (char: CharacterType) => void;
}

export const StartModal: React.FC<StartModalProps> = ({
  isOpen,
  onStart,
  character,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  const handlePlayVoiceIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.unlockAudio();
    soundEngine.playIntro();
  };

  const handleStartClick = () => {
    soundEngine.unlockAudio();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-xs">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 transform animate-pop-success">
        {/* Cute Mascot Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-400 text-4xl shadow-md border-4 border-white mb-4 animate-bounce">
          👶
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-amber-950 mb-2 tracking-tight">
          Bé Ghép Khuôn Mặt
        </h1>

        {/* Subtitle / Toddler Invitation */}
        <div className="bg-amber-200/60 rounded-2xl p-3 sm:p-4 mb-5 border border-amber-300 relative group">
          <p className="text-amber-950 font-extrabold text-base sm:text-lg mb-1">
            “Các bé ơi! Chúng mình cùng ghép khuôn mặt nhé!”
          </p>
          <button
            onClick={handlePlayVoiceIntro}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 hover:bg-white text-amber-900 rounded-full text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 border border-amber-300"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Bấm nghe giọng cô</span>
          </button>
        </div>

        {/* Character Pick for the child */}
        <div className="mb-6">
          <span className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider block mb-2">
            Chọn bạn để cùng chơi:
          </span>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button
              onClick={() => {
                onSelectCharacter('boy');
                soundEngine.playTouchPop();
              }}
              className={`p-3 rounded-2xl border-3 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                character === 'boy'
                  ? 'bg-blue-100 border-blue-500 shadow-md scale-105'
                  : 'bg-white border-amber-200 hover:border-amber-300'
              }`}
            >
              <span className="text-3xl">👦</span>
              <span className="font-extrabold text-blue-900 text-sm">Bé Trai</span>
            </button>

            <button
              onClick={() => {
                onSelectCharacter('girl');
                soundEngine.playTouchPop();
              }}
              className={`p-3 rounded-2xl border-3 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                character === 'girl'
                  ? 'bg-rose-100 border-rose-500 shadow-md scale-105'
                  : 'bg-white border-amber-200 hover:border-amber-300'
              }`}
            >
              <span className="text-3xl">👧</span>
              <span className="font-extrabold text-rose-900 text-sm">Bé Gái</span>
            </button>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleStartClick}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-2xl shadow-xl hover:shadow-2xl transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border-b-4 border-amber-700 cursor-pointer"
        >
          <Play className="w-8 h-8 fill-white" />
          <span>BẮT ĐẦU CHƠI</span>
        </button>

        <p className="text-amber-800/80 text-xs sm:text-sm mt-4 font-semibold">
          Dành cho các bé từ 24 đến 36 tháng tuổi · Dễ chơi & Thú vị
        </p>
      </div>
    </div>
  );
};
