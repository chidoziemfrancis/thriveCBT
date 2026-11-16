import { createStore } from '@/lib/createStore';

import type { CrisisPlan } from './coping';

/** How a coping tool went: 0 didn't help, 1 helped a bit, 2 helped a lot. */
export type ToolUse = { cardId: string; at: string; helped: 0 | 1 | 2 };

export type StressEntry = {
  id: string;
  at: string;
  situation: string;
  /** 0 to 100%. */
  level?: number;
  helped?: string;
};

const toolkit = createStore<string[]>('coping_toolkit', []);
const uses = createStore<ToolUse[]>('coping_uses', []);
const stressLog = createStore<StressEntry[]>('stress_log', []);
const crisisPlan = createStore<CrisisPlan | null>('crisis_plan', null);

export const useToolkit = toolkit.use;
export const getToolkit = toolkit.get;
export const useToolUses = uses.use;
export const useStressLog = stressLog.use;
export const getStressLog = stressLog.get;
export const useCrisisPlan = crisisPlan.use;
export const getCrisisPlan = crisisPlan.get;

/** Adds cards to the toolkit, keeping the order they were first saved in. */
export function saveTools(ids: string[]) {
  const current = toolkit.get();
  const fresh = ids.filter((id) => !current.includes(id));
  if (fresh.length > 0) toolkit.set([...current, ...fresh]);
}

export function toggleTool(id: string) {
  const current = toolkit.get();
  toolkit.set(current.includes(id) ? current.filter((c) => c !== id) : [...current, id]);
}

export function logToolUse(cardId: string, helped: ToolUse['helped'], now = new Date()) {
  uses.set([{ cardId, helped, at: now.toISOString() }, ...uses.get()]);
}

export function addStressEntry(entry: Omit<StressEntry, 'id' | 'at'>, now = new Date()) {
  stressLog.set([
    { ...entry, id: `stress-${now.getTime()}`, at: now.toISOString() },
    ...stressLog.get(),
  ]);
}

export function saveCrisisPlan(plan: CrisisPlan) {
  crisisPlan.set(plan);
}
