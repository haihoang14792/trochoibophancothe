import { GameLevel, PartDefinition, PartId } from './types';

export interface SlotArea {
  id: PartId;
  label: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  radius: number; // hit-test radius in percentage (generous for toddlers ~14-22%)
}

// Level 1: Mức dễ (4 bộ phận: Cặp mắt, Mũi, Miệng, Cặp tai)
export const LEVEL_1_PARTS: PartDefinition[] = [
  {
    id: 'eyes',
    label: 'Cặp Mắt',
    speechText: 'Đây là mắt.',
    level: [1],
    targetXPercent: 50,
    targetYPercent: 43,
    widthPercent: 52,
    heightPercent: 24,
  },
  {
    id: 'nose',
    label: 'Mũi',
    speechText: 'Đây là mũi.',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 58,
    widthPercent: 20,
    heightPercent: 19,
  },
  {
    id: 'mouth',
    label: 'Miệng',
    speechText: 'Đây là miệng.',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 74,
    widthPercent: 35,
    heightPercent: 20,
  },
  {
    id: 'ears',
    label: 'Cặp Tai',
    speechText: 'Đây là tai.',
    level: [1],
    targetXPercent: 50,
    targetYPercent: 53.5,
    widthPercent: 88,
    heightPercent: 26,
  },
];

// Level 2: Mức khó (6 bộ phận: Mắt trái, Mắt phải, Tai trái, Tai phải, Mũi, Miệng)
export const LEVEL_2_PARTS: PartDefinition[] = [
  {
    id: 'eye_left',
    label: 'Mắt Trái',
    speechText: 'Đây là mắt.',
    level: [2],
    targetXPercent: 35.5,
    targetYPercent: 43,
    widthPercent: 25,
    heightPercent: 25,
  },
  {
    id: 'eye_right',
    label: 'Mắt Phải',
    speechText: 'Đây là mắt.',
    level: [2],
    targetXPercent: 64.5,
    targetYPercent: 43,
    widthPercent: 25,
    heightPercent: 25,
  },
  {
    id: 'ear_left',
    label: 'Tai Trái',
    speechText: 'Đây là tai.',
    level: [2],
    targetXPercent: 14.5,
    targetYPercent: 53.5,
    widthPercent: 15,
    heightPercent: 26,
  },
  {
    id: 'ear_right',
    label: 'Tai Phải',
    speechText: 'Đây là tai.',
    level: [2],
    targetXPercent: 85.5,
    targetYPercent: 53.5,
    widthPercent: 15,
    heightPercent: 26,
  },
  {
    id: 'nose',
    label: 'Mũi',
    speechText: 'Đây là mũi.',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 58,
    widthPercent: 20,
    heightPercent: 19,
  },
  {
    id: 'mouth',
    label: 'Miệng',
    speechText: 'Đây là miệng.',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 74,
    widthPercent: 35,
    heightPercent: 20,
  },
];

export function getPartsForLevel(level: GameLevel): PartDefinition[] {
  return level === 1 ? LEVEL_1_PARTS : LEVEL_2_PARTS;
}

export function getSlotsForLevel(level: GameLevel): SlotArea[] {
  if (level === 1) {
    return [
      { id: 'eyes', label: 'Vị trí mắt', x: 50, y: 43, radius: 20 },
      { id: 'nose', label: 'Vị trí mũi', x: 50, y: 58, radius: 15 },
      { id: 'mouth', label: 'Vị trí miệng', x: 50, y: 74, radius: 18 },
      // Ears pair slot centered at head with generous snap zone
      { id: 'ears', label: 'Vị trí tai', x: 50, y: 53.5, radius: 28 },
    ];
  } else {
    return [
      { id: 'eye_left', label: 'Vị trí mắt trái', x: 35.5, y: 43, radius: 16 },
      { id: 'eye_right', label: 'Vị trí mắt phải', x: 64.5, y: 43, radius: 16 },
      { id: 'ear_left', label: 'Vị trí tai trái', x: 14.5, y: 53.5, radius: 18 },
      { id: 'ear_right', label: 'Vị trí tai phải', x: 85.5, y: 53.5, radius: 18 },
      { id: 'nose', label: 'Vị trí mũi', x: 50, y: 58, radius: 15 },
      { id: 'mouth', label: 'Vị trí miệng', x: 50, y: 74, radius: 18 },
    ];
  }
}
