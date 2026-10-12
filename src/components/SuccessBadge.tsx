import React from 'react';
import { Check, Star } from 'lucide-react';

interface SuccessBadgeProps {
  xPercent: number;
  yPercent: number;
  onAnimationEnd?: () => void;
}

/**
 * Popping green checkmark and sparkling stars when a part is correctly placed
 */
export const SuccessBadge: React.FC<SuccessBadgeProps> = ({
  xPercent,
  yPercent,
  onAnimationEnd,
}) => {
  return (
    <div
      className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      onAnimationEnd={onAnimationEnd}
    >
      {/* Green Checkmark Badge */}
      <div className="relative animate-pop-success bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-full p-2.5 shadow-lg border-2 border-white flex items-center justify-center">
        <Check className="w-8 h-8 stroke-[3.5]" />
      </div>

      {/* Sparkling Stars radiating outwards */}
      <div
        className="absolute -top-6 -left-6 text-yellow-400 animate-sparkle"
        style={{ animationDelay: '0.05s' }}
      >
        <Star className="w-6 h-6 fill-yellow-400 filter drop-shadow" />
      </div>
      <div
        className="absolute -top-7 right-[-10px] text-amber-300 animate-sparkle"
        style={{ animationDelay: '0.12s' }}
      >
        <Star className="w-5 h-5 fill-amber-300 filter drop-shadow" />
      </div>
      <div
        className="absolute -bottom-6 -right-6 text-yellow-400 animate-sparkle"
        style={{ animationDelay: '0.18s' }}
      >
        <Star className="w-6 h-6 fill-yellow-400 filter drop-shadow" />
      </div>
      <div
        className="absolute -bottom-5 -left-5 text-amber-300 animate-sparkle"
        style={{ animationDelay: '0.22s' }}
      >
        <Star className="w-4 h-4 fill-amber-300 filter drop-shadow" />
      </div>
    </div>
  );
};
