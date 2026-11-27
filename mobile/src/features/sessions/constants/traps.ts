import type { PhotoKey } from './photos';

export type ThinkingTrap = {
  id: string;
  label: string;
  meaning: string;
  example: string;
  picture: PhotoKey;
};

// The four thinking traps the study plan names for Session 3.
export const TRAPS: ThinkingTrap[] = [
  {
    id: 'catastrophising',
    label: 'Catastrophising',
    meaning: 'Jumping to the worst possible outcome.',
    example: '“If I fail this test, my life is over.”',
    picture: 'trap-catastrophe',
  },
  {
    id: 'mind-reading',
    label: 'Mind reading',
    meaning: 'Being sure you know what others think of you.',
    example: '“They think I’m boring.”',
    picture: 'trap-mindreading',
  },
  {
    id: 'overgeneralising',
    label: 'Overgeneralising',
    meaning: 'Turning one bad moment into always or never.',
    example: '“I always mess things up.”',
    picture: 'trap-always',
  },
  {
    id: 'all-or-nothing',
    label: 'All-or-nothing',
    meaning: 'Seeing things as perfect or a total failure.',
    example: '“If it’s not perfect, it’s a failure.”',
    picture: 'trap-allornothing',
  },
];

export const NOT_SURE = 'not-sure';

export function trapLabels(ids: string[]): string[] {
  return ids
    .map((id) => (id === NOT_SURE ? 'Not sure' : TRAPS.find((t) => t.id === id)?.label))
    .filter((l): l is string => Boolean(l));
}
