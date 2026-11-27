import type { PhotoKey } from './photos';

export type EmotionFamily = {
  id: string;
  label: string;
  color: string;
  face: PhotoKey;
  words: string[];
};

// Family first, then the exact word, as in How We Feel: quicker than one long list.
export const EMOTION_FAMILIES: EmotionFamily[] = [
  {
    id: 'sad',
    label: 'Sad',
    color: '#7FA3C8',
    face: 'feel-sad',
    words: ['Down', 'Hopeless', 'Disappointed', 'Hurt', 'Tearful'],
  },
  {
    id: 'anxious',
    label: 'Anxious',
    color: '#E2B23F',
    face: 'feel-anxious',
    words: ['Nervous', 'Overwhelmed', 'Panicky', 'On edge', 'Worried'],
  },
  {
    id: 'angry',
    label: 'Angry',
    color: '#E8836B',
    face: 'feel-angry',
    words: ['Frustrated', 'Irritated', 'Resentful', 'Annoyed', 'Furious'],
  },
  {
    id: 'ashamed',
    label: 'Ashamed',
    color: '#A88BD6',
    face: 'feel-ashamed',
    words: ['Embarrassed', 'Guilty', 'Small', 'Not good enough', 'Exposed'],
  },
  {
    id: 'lonely',
    label: 'Lonely',
    color: '#5DB47E',
    face: 'feel-lonely',
    words: ['Left out', 'Ignored', 'Unwanted', 'Isolated', 'Homesick'],
  },
  {
    id: 'numb',
    label: 'Numb',
    color: '#9AA09D',
    face: 'feel-numb',
    words: ['Empty', 'Flat', 'Tired', 'Detached', 'Unmotivated'],
  },
];

export type EmotionAnswer = { family: string; word: string; strength: number };

/** Stored as plain strings, like every other answer: family, word, then strength. */
export function readEmotion(answer: unknown): Partial<EmotionAnswer> {
  if (!Array.isArray(answer)) return {};
  const [family, word, strength] = answer as string[];
  return {
    family,
    word,
    strength: strength === undefined ? undefined : Number(strength),
  };
}

export function emotionLabel(answer: unknown): string | null {
  const { family, word, strength } = readEmotion(answer);
  const found = EMOTION_FAMILIES.find((f) => f.id === family);
  if (!found || !word || strength === undefined) return null;
  return `${word} (${found.label.toLowerCase()}), ${strength}%`;
}
