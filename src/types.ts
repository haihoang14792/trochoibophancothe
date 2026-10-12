export type CharacterType = 'boy' | 'girl';

// Level 1: Mức dễ (4 hình: cặp mắt, mũi, miệng, cặp tai)
// Level 2: Mức khó (6 bộ phận: mắt trái, mắt phải, tai trái, tai phải, mũi, miệng)
export type GameLevel = 1 | 2;

export type PartId =
  | 'eyes'
  | 'ears'
  | 'eye_left'
  | 'eye_right'
  | 'ear_left'
  | 'ear_right'
  | 'nose'
  | 'mouth';

export interface PartDefinition {
  id: PartId;
  label: string;
  speechText?: string;
  level: GameLevel[];
  // Slot coordinates in percentage of face container (0-100%)
  targetXPercent: number;
  targetYPercent: number;
  widthPercent: number;
  heightPercent: number;
}
