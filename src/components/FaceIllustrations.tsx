import React from 'react';
import { CharacterType } from '../types';

interface FaceBackgroundProps {
  character: CharacterType;
  isCompleted: boolean;
  level: 1 | 2;
  hasEyesPlaced?: boolean;
  hasNosePlaced?: boolean;
  hasMouthPlaced?: boolean;
  hasEarLeftPlaced?: boolean;
  hasEarRightPlaced?: boolean;
}

/**
 * 2D Cartoon Baby Face base (without the removable eyes, nose, mouth, ears)
 * Rendered with vector SVG so it scales crisply to any screen resolution.
 */
export const BabyFaceBase: React.FC<FaceBackgroundProps> = ({
  character,
  isCompleted,
  level,
  hasEyesPlaced = false,
  hasNosePlaced = false,
  hasMouthPlaced = false,
  hasEarLeftPlaced = false,
  hasEarRightPlaced = false,
}) => {
  return (
    <svg
      viewBox="0 0 500 520"
      className="w-full h-full drop-shadow-xl select-none pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft skin radial gradient */}
        <radialGradient id="babySkin" cx="50%" cy="45%" r="55%" fx="50%" fy="40%">
          <stop offset="0%" stopColor="#FFF1E6" />
          <stop offset="70%" stopColor="#FED7C3" />
          <stop offset="100%" stopColor="#FBC3A6" />
        </radialGradient>

        {/* Rosy cheek gradient */}
        <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A8A" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#FFA4B0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FED7C3" stopOpacity="0" />
        </radialGradient>

        {/* Boy Hair Gradient */}
        <linearGradient id="boyHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C4A28" />
          <stop offset="60%" stopColor="#4A3018" />
          <stop offset="100%" stopColor="#301F0E" />
        </linearGradient>

        {/* Girl Hair Gradient */}
        <linearGradient id="girlHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7B4226" />
          <stop offset="60%" stopColor="#552B14" />
          <stop offset="100%" stopColor="#391B0B" />
        </linearGradient>

        {/* Cute Bow Gradient */}
        <linearGradient id="pinkBowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF85A2" />
          <stop offset="100%" stopColor="#FF477E" />
        </linearGradient>

        {/* Boy Cap Gradient */}
        <linearGradient id="boyCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Soft shadow */}
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#9C7756" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* BACK HAIR / EARS BACKGROUND */}
      {character === 'girl' && (
        <g id="girl-back-hair">
          {/* Left Pigtail / Bun */}
          <circle cx="85" cy="180" r="58" fill="url(#girlHairGrad)" />
          <circle cx="75" cy="170" r="48" fill="#6A361C" />
          {/* Right Pigtail / Bun */}
          <circle cx="415" cy="180" r="58" fill="url(#girlHairGrad)" />
          <circle cx="425" cy="170" r="48" fill="#6A361C" />
        </g>
      )}

      {/* NECK AND SHIRT/COLLAR */}
      <g id="body-collar">
        {/* Neck */}
        <path
          d="M 215 410 L 215 470 C 215 480, 285 480, 285 470 L 285 410 Z"
          fill="#FBC3A6"
        />
        {character === 'boy' ? (
          // Boy Soft Blue Shirt
          <g>
            <path
              d="M 155 455 C 205 440, 295 440, 345 455 C 375 470, 395 520, 395 520 L 105 520 C 105 520, 125 470, 155 455 Z"
              fill="#93C5FD"
            />
            {/* White collar */}
            <path
              d="M 210 455 C 235 480, 248 480, 250 480 C 252 480, 265 480, 290 455 C 275 468, 225 468, 210 455 Z"
              fill="#FFFFFF"
              stroke="#BFDBFE"
              strokeWidth="2"
            />
            {/* Cute Yellow Star Button */}
            <polygon
              points="250,488 253,495 260,495 255,499 257,506 250,502 243,506 245,499 240,495 247,495"
              fill="#FBBF24"
            />
          </g>
        ) : (
          // Girl Cute Pink/Peach Dress
          <g>
            <path
              d="M 155 455 C 205 440, 295 440, 345 455 C 375 470, 395 520, 395 520 L 105 520 C 105 520, 125 470, 155 455 Z"
              fill="#FCA5A5"
            />
            {/* Scallop lace collar */}
            <path
              d="M 195 455 Q 215 475 235 465 Q 250 480 265 465 Q 285 475 305 455 Q 250 465 195 455 Z"
              fill="#FFF1F2"
              stroke="#FECDD3"
              strokeWidth="2"
            />
            {/* Small floral button */}
            <circle cx="250" cy="492" r="6" fill="#F43F5E" />
            <circle cx="250" cy="492" r="2.5" fill="#FEF08A" />
          </g>
        )}
      </g>

      {/* MAIN HEAD (Chubby baby head contour) */}
      <path
        d="M 250 85 C 135 85, 100 170, 100 270 C 100 360, 150 435, 250 435 C 350 435, 400 360, 400 270 C 400 170, 365 85, 250 85 Z"
        fill="url(#babySkin)"
        stroke="#F2B294"
        strokeWidth="4"
        filter="url(#softShadow)"
      />

      {/* EYEBROWS (Always visible, cute, high above eyes) */}
      <g id="eyebrows" opacity="0.85">
        {/* Left Eyebrow */}
        <path
          d="M 155 178 Q 185 165 210 174"
          stroke="#8A5A36"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eyebrow */}
        <path
          d="M 290 174 Q 315 165 345 178"
          stroke="#8A5A36"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* CHEEKS / BLUSH */}
      {/* Normal subtle blush */}
      <ellipse cx="145" cy="305" rx="30" ry="18" fill="url(#blushGradient)" opacity={isCompleted ? 1 : 0.45} />
      <ellipse cx="355" cy="305" rx="30" ry="18" fill="url(#blushGradient)" opacity={isCompleted ? 1 : 0.45} />

      {/* Extra joyful glowing blushing cheeks when completed */}
      {isCompleted && (
        <g id="happy-blush" className="animate-pulse">
          <ellipse cx="145" cy="305" rx="36" ry="22" fill="#FF6B8B" opacity="0.55" />
          <ellipse cx="355" cy="305" rx="36" ry="22" fill="#FF6B8B" opacity="0.55" />
          {/* Cute sparkle hearts on cheeks */}
          <path
            d="M 135 298 C 135 294, 140 292, 143 295 C 146 292, 151 294, 151 298 C 151 303, 143 308, 143 308 C 143 308, 135 303, 135 298 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          <path
            d="M 348 298 C 348 294, 353 292, 356 295 C 359 292, 364 294, 364 298 C 364 303, 356 308, 356 308 C 356 308, 348 303, 348 298 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </g>
      )}

      {/* FAINT GUIDE SILHOUETTES (Vị trí gợi ý mờ) */}
      <g id="guide-silhouettes">
        {/* EYES GUIDE */}
        {level === 1 ? (
          // Level 1: Pair of eyes guide
          !hasEyesPlaced && (
            <g opacity="0.32">
              {/* Outer guide dashed container */}
              <rect
                x="132"
                y="196"
                width="236"
                height="68"
                rx="34"
                fill="#FEE2E2"
                stroke="#F87171"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />
              {/* Left eye ghost silhouette */}
              <circle cx="185" cy="230" r="24" fill="#9CA3AF" opacity="0.4" />
              <circle cx="180" cy="225" r="7" fill="#FFFFFF" opacity="0.6" />
              {/* Right eye ghost silhouette */}
              <circle cx="315" cy="230" r="24" fill="#9CA3AF" opacity="0.4" />
              <circle cx="310" cy="225" r="7" fill="#FFFFFF" opacity="0.6" />
            </g>
          )
        ) : (
          // Level 2: Left and right separate eye guides
          <>
            {!hasEyesPlaced && (
              <g opacity="0.28">
                {/* Left eye slot */}
                <circle
                  cx="180"
                  cy="230"
                  r="28"
                  fill="#FEE2E2"
                  stroke="#F87171"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="180" cy="230" r="20" fill="#9CA3AF" opacity="0.4" />
              </g>
            )}
          </>
        )}

        {/* NOSE GUIDE */}
        {!hasNosePlaced && (
          <g opacity="0.35">
            <ellipse
              cx="250"
              cy="295"
              rx="24"
              ry="18"
              fill="#FED7AA"
              stroke="#FB923C"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            {/* Soft button nose silhouette */}
            <path
              d="M 243 293 C 243 297, 257 297, 257 293"
              stroke="#9CA3AF"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* LEFT EAR GUIDE */}
        {!hasEarLeftPlaced && (
          <g opacity="0.35">
            <path
              d="M 102 235 C 65 235, 60 310, 105 315 Z"
              fill="#FED7AA"
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
            {/* Inner ear curve hint */}
            <path
              d="M 98 255 C 80 255, 78 295, 100 300"
              stroke="#EA580C"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
            />
          </g>
        )}

        {/* RIGHT EAR GUIDE */}
        {!hasEarRightPlaced && (
          <g opacity="0.35">
            <path
              d="M 398 235 C 435 235, 440 310, 395 315 Z"
              fill="#FED7AA"
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
            {/* Inner ear curve hint */}
            <path
              d="M 402 255 C 420 255, 422 295, 400 300"
              stroke="#EA580C"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
            />
          </g>
        )}

        {/* MOUTH GUIDE */}
        {!hasMouthPlaced && (
          <g opacity="0.32">
            <rect
              x="175"
              y="350"
              width="150"
              height="60"
              rx="28"
              fill="#FCE7F3"
              stroke="#F472B6"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
            {/* Smiling mouth silhouette curve */}
            <path
              d="M 210 372 Q 250 400 290 372"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </g>

      {/* HAIR (Foreground cute hairstyle) */}
      {character === 'boy' ? (
        // Boy Cute Haircut
        <g id="boy-hair">
          {/* Top Hair Volume */}
          <path
            d="M 120 215 C 110 150, 160 80, 250 80 C 340 80, 390 150, 380 215 C 365 170, 345 155, 320 158 C 295 160, 280 145, 255 145 C 230 145, 215 160, 185 158 C 155 155, 135 170, 120 215 Z"
            fill="url(#boyHairGrad)"
            stroke="#301F0E"
            strokeWidth="3"
          />
          {/* Playful Spiky Tuft on Top */}
          <path
            d="M 240 82 C 235 55, 255 45, 260 48 C 265 52, 270 65, 262 82 Z"
            fill="url(#boyHairGrad)"
            stroke="#301F0E"
            strokeWidth="2.5"
          />
          {/* Soft Bangs */}
          <path
            d="M 145 170 C 170 190, 190 170, 210 180 C 235 170, 260 175, 285 165 C 310 175, 335 168, 355 170 C 340 145, 310 135, 250 135 C 190 135, 160 145, 145 170 Z"
            fill="#5A3A1E"
          />
          {/* Glossy Hair highlight */}
          <path
            d="M 190 115 C 215 105, 285 105, 310 115"
            stroke="#A37145"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </g>
      ) : (
        // Girl Cute Hair & Big Pink Ribbon Bows
        <g id="girl-hair">
          {/* Front bangs and side curls */}
          <path
            d="M 120 230 C 110 150, 160 80, 250 80 C 340 80, 390 150, 380 230 C 365 180, 350 165, 330 172 C 305 155, 275 165, 250 155 C 225 165, 195 155, 170 172 C 150 165, 135 180, 120 230 Z"
            fill="url(#girlHairGrad)"
            stroke="#391B0B"
            strokeWidth="3"
          />
          {/* Cute rounded bangs */}
          <path
            d="M 160 165 Q 200 195 240 168 Q 280 195 320 168 C 300 145, 280 135, 240 135 C 200 135, 180 145, 160 165 Z"
            fill="#6A361C"
          />

          {/* Left Ribbon Bow */}
          <g transform="translate(105, 165) rotate(-15)">
            <ellipse cx="-16" cy="0" rx="18" ry="12" fill="url(#pinkBowGrad)" stroke="#BE185D" strokeWidth="2" />
            <ellipse cx="16" cy="0" rx="18" ry="12" fill="url(#pinkBowGrad)" stroke="#BE185D" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#FFF1F2" stroke="#BE185D" strokeWidth="2" />
          </g>

          {/* Right Ribbon Bow */}
          <g transform="translate(395, 165) rotate(15)">
            <ellipse cx="-16" cy="0" rx="18" ry="12" fill="url(#pinkBowGrad)" stroke="#BE185D" strokeWidth="2" />
            <ellipse cx="16" cy="0" rx="18" ry="12" fill="url(#pinkBowGrad)" stroke="#BE185D" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#FFF1F2" stroke="#BE185D" strokeWidth="2" />
          </g>

          {/* Hair shine */}
          <path
            d="M 195 110 C 220 100, 280 100, 305 110"
            stroke="#A35932"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
        </g>
      )}
    </svg>
  );
};
