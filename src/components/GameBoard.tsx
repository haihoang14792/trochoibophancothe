import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CharacterType, GameLevel, PartDefinition, PartId } from '../types';
import { getPartsForLevel, getSlotsForLevel, SlotArea } from '../constants';
import { BabyFaceBase } from './FaceIllustrations';
import { PartGraphic } from './PartGraphics';
import { SuccessBadge } from './SuccessBadge';
import { soundEngine } from '../utils/audio';
import { Check } from 'lucide-react';

interface GameBoardProps {
  character: CharacterType;
  level: GameLevel;
  onGameComplete: () => void;
  isGameCompleted: boolean;
  onReset: () => void;
}

interface DragState {
  partId: PartId;
  currentPointerX: number;
  currentPointerY: number;
  startX: number;
  startY: number;
  originRect: DOMRect | null;
}

interface BoingState {
  partId: PartId;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  rot: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  character,
  level,
  onGameComplete,
  isGameCompleted,
  onReset,
}) => {
  // Parts for current level
  const parts = getPartsForLevel(level);
  const slots = getSlotsForLevel(level);

  // Locked parts state
  const [lockedParts, setLockedParts] = useState<Record<PartId, boolean>>({
    eyes: false,
    ears: false,
    eye_left: false,
    eye_right: false,
    nose: false,
    mouth: false,
    ear_left: false,
    ear_right: false,
  });

  // Dragging state
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Boing / bouncing state when placed incorrectly
  const [boingState, setBoingState] = useState<BoingState | null>(null);

  // Success badge notification
  const [successBadge, setSuccessBadge] = useState<{
    x: number;
    y: number;
    id: PartId;
  } | null>(null);

  // Container refs for calculating responsive coordinates
  const faceContainerRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const partButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset internal states on reset or level change
  useEffect(() => {
    setLockedParts({
      eyes: false,
      ears: false,
      eye_left: false,
      eye_right: false,
      nose: false,
      mouth: false,
      ear_left: false,
      ear_right: false,
    });
    setDragState(null);
    setBoingState(null);
    setSuccessBadge(null);
  }, [level, character, onReset]);

  // Check for completion
  useEffect(() => {
    const requiredPartIds = parts.map((p) => p.id);
    const allLocked = requiredPartIds.every((id) => lockedParts[id]);

    if (allLocked && !isGameCompleted && requiredPartIds.length > 0) {
      const timer = setTimeout(() => {
        onGameComplete();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [lockedParts, parts, isGameCompleted, onGameComplete]);

  // Handle pointer down on a tray part
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    part: PartDefinition
  ) => {
    if (lockedParts[part.id] || boingState?.partId === part.id || isGameCompleted) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Bubble pop sound effect on touch
    soundEngine.playTouchPop();

    const targetEl = e.currentTarget;
    const rect = targetEl.getBoundingClientRect();

    setDragState({
      partId: part.id,
      currentPointerX: e.clientX,
      currentPointerY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      originRect: rect,
    });
  };

  // Pointer move handler
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState) return;
      e.preventDefault();

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentPointerX: e.clientX,
              currentPointerY: e.clientY,
            }
          : null
      );
    },
    [dragState]
  );

  // Pointer up handler: evaluates hit test
  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragState) return;
      const { partId, currentPointerX, currentPointerY, originRect } = dragState;
      setDragState(null);

      const faceEl = faceContainerRef.current;
      if (!faceEl) return;

      const faceRect = faceEl.getBoundingClientRect();

      // Convert release coordinates to percentage of face container (0-100%)
      const relX = ((currentPointerX - faceRect.left) / faceRect.width) * 100;
      const relY = ((currentPointerY - faceRect.top) / faceRect.height) * 100;

      // Find the correct target slot for this piece
      const correctSlot = slots.find((s) => s.id === partId);
      if (!correctSlot) return;

      const distToCorrect = Math.hypot(relX - correctSlot.x, relY - correctSlot.y);
      const snapRadius = level === 1 ? correctSlot.radius * 1.25 : correctSlot.radius * 1.2;

      let isSnapSuccess = false;
      let wrongSlotHit: SlotArea | null = null;

      if (partId === 'ears') {
        // ========== LEVEL 1: CẶP TAI ==========
        // A pair of ears goes on the sides of the baby's head.
        // Toddlers can drop it anywhere across the baby head or sides to snap!
        const isNearLeftEar = Math.hypot(relX - 14.5, relY - 53.5) <= 32;
        const isNearRightEar = Math.hypot(relX - 85.5, relY - 53.5) <= 32;
        const isNearCenter = Math.hypot(relX - 50, relY - 53.5) <= 38;
        const isAcrossHead = relY >= 30 && relY <= 72 && relX >= 0 && relX <= 100;

        // Check if dropped explicitly down on mouth (y >= 75) or high up on hair (y <= 24)
        const isExplicitlyOnMouth = relY >= 75 && Math.abs(relX - 50) <= 20;
        const isExplicitlyOnHair = relY <= 24 && Math.abs(relX - 50) <= 25;

        if (isExplicitlyOnMouth) {
          isSnapSuccess = false;
          wrongSlotHit = slots.find((s) => s.id === 'mouth') || null;
        } else if (isExplicitlyOnHair) {
          isSnapSuccess = false;
          wrongSlotHit = slots.find((s) => s.id === 'eyes') || null;
        } else if (isNearLeftEar || isNearRightEar || isNearCenter || isAcrossHead) {
          isSnapSuccess = true;
        }
      } else if (partId === 'ear_left') {
        // ========== LEVEL 2: TAI TRÁI ==========
        // Left ear belongs on the left side of the baby head (x: 14.5, y: 53.5)
        const isNearTarget = distToCorrect <= snapRadius * 1.35;
        const isOnLeftSide = relX <= 32 && relY >= 32 && relY <= 75;

        if (isNearTarget || isOnLeftSide) {
          isSnapSuccess = true;
        } else if (relX >= 68 && relY >= 32 && relY <= 75) {
          // Dropped on opposite ear
          isSnapSuccess = false;
          wrongSlotHit = slots.find((s) => s.id === 'ear_right') || null;
        } else if (distToCorrect > snapRadius) {
          const otherWrong = slots.find(
            (s) => s.id !== 'ear_left' && Math.hypot(relX - s.x, relY - s.y) <= s.radius * 1.15
          );
          wrongSlotHit = otherWrong || null;
        }
      } else if (partId === 'ear_right') {
        // ========== LEVEL 2: TAI PHẢI ==========
        // Right ear belongs on the right side of the baby head (x: 85.5, y: 53.5)
        const isNearTarget = distToCorrect <= snapRadius * 1.35;
        const isOnRightSide = relX >= 68 && relY >= 32 && relY <= 75;

        if (isNearTarget || isOnRightSide) {
          isSnapSuccess = true;
        } else if (relX <= 32 && relY >= 32 && relY <= 75) {
          // Dropped on opposite ear
          isSnapSuccess = false;
          wrongSlotHit = slots.find((s) => s.id === 'ear_left') || null;
        } else if (distToCorrect > snapRadius) {
          const otherWrong = slots.find(
            (s) => s.id !== 'ear_right' && Math.hypot(relX - s.x, relY - s.y) <= s.radius * 1.15
          );
          wrongSlotHit = otherWrong || null;
        }
      } else {
        // ========== ALL OTHER INDIVIDUAL PARTS ==========
        // (eyes, nose, mouth, eye_left, eye_right)
        let closestSlot = correctSlot;
        let minDistance = distToCorrect;

        for (const s of slots) {
          if (level === 1 && s.id === 'ears') continue;

          const d = Math.hypot(relX - s.x, relY - s.y);
          if (d < minDistance) {
            minDistance = d;
            closestSlot = s;
          }
        }

        if (distToCorrect <= snapRadius) {
          if (closestSlot.id === partId) {
            isSnapSuccess = true;
          } else {
            if (distToCorrect <= snapRadius * 0.85) {
              isSnapSuccess = true;
            } else {
              isSnapSuccess = false;
              wrongSlotHit = closestSlot;
            }
          }
        } else {
          isSnapSuccess = false;
          if (closestSlot.id !== partId && minDistance <= closestSlot.radius * 1.25) {
            wrongSlotHit = closestSlot;
          }
        }
      }

      if (isSnapSuccess) {
        // ========== SUCCESS: CORRECT SNAP! ==========
        soundEngine.playTick();

        setLockedParts((prev) => ({
          ...prev,
          [partId]: true,
        }));

        setSuccessBadge({
          x: correctSlot.x,
          y: correctSlot.y,
          id: partId,
        });

        setTimeout(() => {
          setSuccessBadge((curr) => (curr?.id === partId ? null : curr));
        }, 1200);
      } else {
        // ========== INCORRECT: BOING BOUNCE RECOIL! ==========
        // Plays Boing! sound and triggers elastic spring bounce back to tray
        soundEngine.playBoing();

        // Calculate bounce kickback vector
        let bounceOffsetX = 0;
        let bounceOffsetY = -30;
        let bounceRot = -10;

        if (wrongSlotHit) {
          // If dropped right on a wrong slot (e.g. eyes on mouth, nose on eyes):
          // Bounce away sharply from the center of that wrong slot
          const dx = relX - wrongSlotHit.x;
          const dy = relY - wrongSlotHit.y;
          bounceOffsetX = dx >= 0 ? 35 : -35;
          bounceOffsetY = dy >= 0 ? 25 : -35;
          bounceRot = dx >= 0 ? 15 : -15;
        } else {
          // Dropped elsewhere or outside
          bounceOffsetX = (Math.random() - 0.5) * 40;
          bounceOffsetY = -25;
          bounceRot = (Math.random() - 0.5) * 20;
        }

        setBoingState({
          partId,
          x: currentPointerX,
          y: currentPointerY,
          offsetX: bounceOffsetX,
          offsetY: bounceOffsetY,
          rot: bounceRot,
        });

        // After spring bounce (650ms), piece returns safely to its tray dock
        setTimeout(() => {
          setBoingState(null);
        }, 650);
      }
    },
    [dragState, slots, level]
  );

  // Attach global pointer listeners when dragging
  useEffect(() => {
    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, handlePointerMove, handlePointerUp]);

  // Compute magnetic proximity highlight for assistive snap cue
  let nearCorrectSlot = false;
  if (dragState && faceContainerRef.current) {
    const faceRect = faceContainerRef.current.getBoundingClientRect();
    const relX = ((dragState.currentPointerX - faceRect.left) / faceRect.width) * 100;
    const relY = ((dragState.currentPointerY - faceRect.top) / faceRect.height) * 100;
    const correctSlot = slots.find((s) => s.id === dragState.partId);
    if (correctSlot) {
      if (dragState.partId === 'ears') {
        if (
          (relY >= 30 && relY <= 72 && relX >= 0 && relX <= 100) ||
          Math.hypot(relX - 50, relY - 53.5) <= 38 ||
          Math.hypot(relX - 14.5, relY - 53.5) <= 32 ||
          Math.hypot(relX - 85.5, relY - 53.5) <= 32
        ) {
          nearCorrectSlot = true;
        }
      } else if (dragState.partId === 'ear_left') {
        if (
          (relX <= 35 && relY >= 30 && relY <= 75) ||
          Math.hypot(relX - 14.5, relY - 53.5) <= 28
        ) {
          nearCorrectSlot = true;
        }
      } else if (dragState.partId === 'ear_right') {
        if (
          (relX >= 65 && relY >= 30 && relY <= 75) ||
          Math.hypot(relX - 85.5, relY - 53.5) <= 28
        ) {
          nearCorrectSlot = true;
        }
      } else if (Math.hypot(relX - correctSlot.x, relY - correctSlot.y) <= correctSlot.radius * 1.4) {
        nearCorrectSlot = true;
      }
    }
  }

  // Active dragged part definition
  const activeDraggedDef = parts.find((p) => p.id === dragState?.partId);
  const activeBoingDef = parts.find((p) => p.id === boingState?.partId);

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-4xl mx-auto flex-1 p-2 sm:p-4 select-none">
      {/* Friendly Guide Banner */}
      <div className="w-full flex items-center justify-center mb-2 px-2">
        <div className="bg-white/90 border-2 border-amber-300 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-2 max-w-md">
          <span className="text-xl">⭐</span>
          <span className="text-amber-900 font-bold text-sm sm:text-base leading-tight">
            Bé hãy kéo mắt, mũi, miệng và đôi tai vào khuôn mặt nhé!
          </span>
        </div>
      </div>

      {/* CENTER: LARGE BABY FACE STAGE */}
      <div className="relative w-full flex items-center justify-center my-auto py-2">
        <div
          ref={faceContainerRef}
          className={`relative w-72 sm:w-96 md:w-[420px] aspect-[500/520] transition-transform duration-300 ${
            isGameCompleted ? 'scale-105' : ''
          }`}
        >
          {/* Base Baby Face Illustration */}
          <BabyFaceBase
            character={character}
            isCompleted={isGameCompleted}
            level={level}
            hasEyesPlaced={
              level === 1
                ? lockedParts.eyes
                : lockedParts.eye_left && lockedParts.eye_right
            }
            hasNosePlaced={lockedParts.nose}
            hasMouthPlaced={lockedParts.mouth}
            hasEarLeftPlaced={lockedParts.ears || lockedParts.ear_left}
            hasEarRightPlaced={lockedParts.ears || lockedParts.ear_right}
          />

          {/* Magnetic Attraction Glow Ring (Level 1 assistive visual snap cue) */}
          {nearCorrectSlot && activeDraggedDef && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400 bg-yellow-300/30 animate-ping z-10"
              style={{
                left: `${activeDraggedDef.targetXPercent}%`,
                top: `${activeDraggedDef.targetYPercent}%`,
                width: `${activeDraggedDef.widthPercent * 1.1}%`,
                height: `${activeDraggedDef.heightPercent * 1.1}%`,
              }}
            />
          )}

          {/* FIXED SNAPPED PARTS (Permanently locked into face) */}
          {/* Left Ear */}
          {(lockedParts.ears || lockedParts.ear_left) && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
              style={{
                left: '14.5%',
                top: '53.5%',
                width: '15%',
                height: '26%',
              }}
            >
              <PartGraphic partId="ear_left" isLocked={true} />
            </div>
          )}

          {/* Right Ear */}
          {(lockedParts.ears || lockedParts.ear_right) && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
              style={{
                left: '85.5%',
                top: '53.5%',
                width: '15%',
                height: '26%',
              }}
            >
              <PartGraphic partId="ear_right" isLocked={true} />
            </div>
          )}

          {/* Level 1: Pair of Eyes */}
          {level === 1 && lockedParts.eyes && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: '50%',
                top: '43%',
                width: '52%',
                height: '25%',
              }}
            >
              <PartGraphic partId="eyes" isLocked={true} isHappyWin={isGameCompleted} />
            </div>
          )}

          {/* Level 2: Left Eye */}
          {level === 2 && lockedParts.eye_left && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: '35.5%',
                top: '43%',
                width: '25%',
                height: '25%',
              }}
            >
              <PartGraphic partId="eye_left" isLocked={true} isHappyWin={isGameCompleted} />
            </div>
          )}

          {/* Level 2: Right Eye */}
          {level === 2 && lockedParts.eye_right && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: '64.5%',
                top: '43%',
                width: '25%',
                height: '25%',
              }}
            >
              <PartGraphic partId="eye_right" isLocked={true} isHappyWin={isGameCompleted} />
            </div>
          )}

          {/* Nose */}
          {lockedParts.nose && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: '50%',
                top: '58%',
                width: '20%',
                height: '19%',
              }}
            >
              <PartGraphic partId="nose" isLocked={true} isHappyWin={isGameCompleted} />
            </div>
          )}

          {/* Mouth */}
          {lockedParts.mouth && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: '50%',
                top: '74%',
                width: '35%',
                height: '20%',
              }}
            >
              <PartGraphic partId="mouth" isLocked={true} isHappyWin={isGameCompleted} />
            </div>
          )}

          {/* Success Checkmark & Sparkles Badge */}
          {successBadge && (
            <SuccessBadge
              xPercent={successBadge.x}
              yPercent={successBadge.y}
            />
          )}
        </div>
      </div>

      {/* BOTTOM TOY TRAY (Khay chứa các bộ phận) */}
      <div
        ref={trayRef}
        className="w-full bg-amber-100/90 border-3 border-amber-300 rounded-3xl p-2 sm:p-3 shadow-lg backdrop-blur-xs flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-around gap-2 sm:gap-2.5 mt-2"
      >
        {parts.map((part) => {
          const isLocked = lockedParts[part.id];
          const isDraggingThis = dragState?.partId === part.id;
          const isBoingingThis = boingState?.partId === part.id;

          return (
            <div
              key={part.id}
              ref={(el) => {
                partButtonRefs.current[part.id] = el;
              }}
              onPointerDown={(e) => handlePointerDown(e, part)}
              className={`relative flex-1 min-w-[75px] max-w-[130px] sm:max-w-[160px] h-20 sm:h-26 rounded-2xl border-3 flex flex-col items-center justify-center p-1 sm:p-2 transition-all duration-200 select-none ${
                isLocked
                  ? 'bg-emerald-50 border-emerald-300 opacity-80 cursor-default'
                  : 'bg-white hover:bg-amber-50 active:scale-95 border-amber-400 cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg'
              }`}
              style={{ touchAction: 'none' }}
            >
              {/* Slot Placeholder when dragged or locked */}
              {isLocked ? (
                <div className="flex flex-col items-center justify-center text-emerald-600 gap-1">
                  <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-sm">
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700">
                    {part.label} (Đúng!)
                  </span>
                </div>
              ) : isDraggingThis || isBoingingThis ? (
                // Empty indented silhouette waiting for return
                <div className="w-full h-full border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/70 flex flex-col items-center justify-center opacity-70">
                  <span className="text-xs font-bold text-amber-700">
                    {part.label}
                  </span>
                </div>
              ) : (
                // Available piece in tray
                <div className="w-full h-full flex flex-col items-center justify-between">
                  <div className="w-full flex-1 flex items-center justify-center p-1">
                    <PartGraphic partId={part.id} className="max-h-full max-w-full" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-900 tracking-wide">
                    {part.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOATING DRAGGED COMPONENT (follows cursor/touch, scaled 1:1 with face) */}
      {dragState && activeDraggedDef && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-105 drop-shadow-2xl"
          style={{
            left: `${dragState.currentPointerX}px`,
            top: `${dragState.currentPointerY}px`,
            width: `${
              faceContainerRef.current
                ? (activeDraggedDef.widthPercent / 100) *
                  faceContainerRef.current.getBoundingClientRect().width
                : 160
            }px`,
            height: `${
              faceContainerRef.current
                ? (activeDraggedDef.heightPercent / 100) *
                  faceContainerRef.current.getBoundingClientRect().height
                : 80
            }px`,
          }}
        >
          <PartGraphic partId={activeDraggedDef.id} />
        </div>
      )}

      {/* ELASTIC SPRING BOUNCE RECOIL (When dropped incorrectly) */}
      {boingState && activeBoingDef && (
        <div
          className="fixed pointer-events-none z-50 animate-boing"
          style={
            {
              left: `${boingState.x}px`,
              top: `${boingState.y}px`,
              width: `${
                faceContainerRef.current
                  ? (activeBoingDef.widthPercent / 100) *
                    faceContainerRef.current.getBoundingClientRect().width
                  : 160
              }px`,
              height: `${
                faceContainerRef.current
                  ? (activeBoingDef.heightPercent / 100) *
                    faceContainerRef.current.getBoundingClientRect().height
                  : 80
              }px`,
              '--boing-offset-x': `${boingState.offsetX}px`,
              '--boing-offset-y': `${boingState.offsetY}px`,
              '--boing-rot': `${boingState.rot}deg`,
              transform: 'translate(-50%, -50%)',
            } as React.CSSProperties
          }
        >
          <div className="w-full h-full drop-shadow-xl">
            <PartGraphic partId={activeBoingDef.id} />
          </div>
        </div>
      )}
    </div>
  );
};
