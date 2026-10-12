import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Sparkles, Heart, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CelebrationModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  characterName: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onPlayAgain,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive colorful confetti with toddler-friendly vibrant pastels & stars!
      const count = 220;
      const defaults = {
        origin: { y: 0.6 },
        colors: ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#F78C6B', '#A78BFA'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.4 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 transform animate-pop-success">
        {/* Floating Cute Icons */}
        <div className="absolute -top-6 -left-4 bg-amber-400 text-white rounded-full p-3 shadow-md animate-bounce">
          <Sparkles className="w-8 h-8 fill-amber-200" />
        </div>
        <div className="absolute -top-6 -right-4 bg-rose-400 text-white rounded-full p-3 shadow-md animate-wiggle">
          <Heart className="w-8 h-8 fill-rose-200" />
        </div>

        {/* Big Joyful Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-600 mb-1.5 tracking-tight">
          Hoan Hô! 🎉
        </h2>

        {/* Congratulatory subtitle */}
        <p className="text-2xl sm:text-3xl font-black text-rose-500 mb-2">
          Con Giỏi Lắm! ⭐
        </p>

        <p className="text-slate-600 text-sm sm:text-base mb-4 font-semibold">
          Bé đã ghép hoàn thành khuôn mặt thật xinh xắn!
        </p>

        {/* Voice replay button */}
        <div className="mb-6">
          <button
            onClick={() => soundEngine.queueVoice('congrats')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-200 transition-all cursor-pointer active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Nghe lại lời khen: “Hoan hô! Con giỏi lắm!”</span>
          </button>
        </div>

        {/* Big Play Again Button (Nút lớn CHƠI LẠI) */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-2xl shadow-xl hover:shadow-2xl transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border-b-4 border-emerald-700 cursor-pointer"
        >
          <RotateCcw className="w-8 h-8 stroke-[3]" />
          <span>CHƠI LẠI</span>
        </button>
      </div>
    </div>
  );
};
