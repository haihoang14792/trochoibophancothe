import { GameLevel, PartDefinition, PartId } from './types';

export interface SlotArea {
  id: PartId;
  label: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  radius: number; // hit-test radius in percentage
}

/**
 * Level 1: Mức dễ (4 bộ phận: Cặp mắt, Mũi, Miệng, Cặp tai)
 * Dành cho trẻ 24-36 tháng mới làm quen:
 * - Cặp mắt -> Đọc "Mắt"
 * - Mũi -> Đọc "Mũi"
 * - Miệng -> Đọc "Miệng"
 * - Cặp tai -> Đọc "Tai"
 */
export const LEVEL_1_PARTS: PartDefinition[] = [
  {
    id: 'eyes',
    label: 'Cặp Mắt',
    speechKey: 'eyes',
    speechText: 'Mắt',
    graphicKey: 'eyes_pair',
    level: [1],
    targetXPercent: 50,
    targetYPercent: 43,
    widthPercent: 52,
    heightPercent: 24,
  },
  {
    id: 'nose',
    label: 'Mũi',
    speechKey: 'nose',
    speechText: 'Mũi',
    graphicKey: 'nose',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 58,
    widthPercent: 20,
    heightPercent: 19,
  },
  {
    id: 'mouth',
    label: 'Miệng',
    speechKey: 'mouth',
    speechText: 'Miệng',
    graphicKey: 'mouth',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 74,
    widthPercent: 35,
    heightPercent: 20,
  },
  {
    id: 'ears',
    label: 'Cặp Tai',
    speechKey: 'ears',
    speechText: 'Tai',
    graphicKey: 'ears_pair',
    level: [1],
    targetXPercent: 50,
    targetYPercent: 53.5,
    widthPercent: 88,
    heightPercent: 26,
  },
];

/**
 * Level 2: Mức nâng cao (6 bộ phận: Mắt trái, Mắt phải, Tai trái, Tai phải, Mũi, Miệng)
 * 
 * QUY TẮC TRÁI - PHẢI BẮT BUỘC THEO CƠ THỂ NHÂN VẬT:
 * - Phải xác định trái và phải theo cơ thể của nhân vật, không theo phía của người nhìn.
 * - Mắt trái của nhân vật nằm bên PHẢI màn hình khi nhìn trực diện (x = 64.5%).
 * - Mắt phải của nhân vật nằm bên TRÁI màn hình khi nhìn trực diện (x = 35.5%).
 * - Tai trái của nhân vật nằm bên PHẢI màn hình khi nhìn trực diện (x = 85.5%).
 * - Tai phải của nhân vật nằm bên TRÁI màn hình khi nhìn trực diện (x = 14.5%).
 */
export const LEVEL_2_PARTS: PartDefinition[] = [
  {
    id: 'eye_right',
    label: 'Mắt phải',
    speechKey: 'eye_right',
    speechText: 'Mắt phải',
    graphicKey: 'eye_left', // Mắt nằm bên trái màn hình (phía phải của em bé)
    level: [2],
    targetXPercent: 35.5,
    targetYPercent: 43,
    widthPercent: 25,
    heightPercent: 25,
  },
  {
    id: 'eye_left',
    label: 'Mắt trái',
    speechKey: 'eye_left',
    speechText: 'Mắt trái',
    graphicKey: 'eye_right', // Mắt nằm bên phải màn hình (phía trái của em bé)
    level: [2],
    targetXPercent: 64.5,
    targetYPercent: 43,
    widthPercent: 25,
    heightPercent: 25,
  },
  {
    id: 'ear_right',
    label: 'Tai phải',
    speechKey: 'ear_right',
    speechText: 'Tai phải',
    graphicKey: 'ear_left', // Tai gắn bên trái đầu, cong ra trái
    level: [2],
    targetXPercent: 14.5,
    targetYPercent: 53.5,
    widthPercent: 15,
    heightPercent: 26,
  },
  {
    id: 'ear_left',
    label: 'Tai trái',
    speechKey: 'ear_left',
    speechText: 'Tai trái',
    graphicKey: 'ear_right', // Tai gắn bên phải đầu, cong ra phải
    level: [2],
    targetXPercent: 85.5,
    targetYPercent: 53.5,
    widthPercent: 15,
    heightPercent: 26,
  },
  {
    id: 'nose',
    label: 'Mũi',
    speechKey: 'nose',
    speechText: 'Mũi',
    graphicKey: 'nose',
    level: [1, 2],
    targetXPercent: 50,
    targetYPercent: 58,
    widthPercent: 20,
    heightPercent: 19,
  },
  {
    id: 'mouth',
    label: 'Miệng',
    speechKey: 'mouth',
    speechText: 'Miệng',
    graphicKey: 'mouth',
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
      { id: 'eyes', label: 'Vị trí mắt', x: 50, y: 43, radius: 24 },
      { id: 'nose', label: 'Vị trí mũi', x: 50, y: 58, radius: 22 },
      { id: 'mouth', label: 'Vị trí miệng', x: 50, y: 74, radius: 22 },
      { id: 'ears', label: 'Vị trí tai', x: 50, y: 53.5, radius: 32 },
    ];
  } else {
    return [
      { id: 'eye_right', label: 'Vị trí mắt phải', x: 35.5, y: 43, radius: 20 },
      { id: 'eye_left', label: 'Vị trí mắt trái', x: 64.5, y: 43, radius: 20 },
      { id: 'ear_right', label: 'Vị trí tai phải', x: 14.5, y: 53.5, radius: 24 },
      { id: 'ear_left', label: 'Vị trí tai trái', x: 85.5, y: 53.5, radius: 24 },
      { id: 'nose', label: 'Vị trí mũi', x: 50, y: 58, radius: 22 },
      { id: 'mouth', label: 'Vị trí miệng', x: 50, y: 74, radius: 22 },
    ];
  }
}
