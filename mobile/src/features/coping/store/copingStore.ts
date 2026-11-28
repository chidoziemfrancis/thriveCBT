import * as Crypto from 'expo-crypto';

import { createStore } from '@/lib/createStore';
import { readJson, writeJson } from '@/lib/storage';
import {
  contentUuid,
  mergeServerItems,
  notOnServer,
  onStudentChange,
  queueChange,
  registerSyncKind,
  withUuids,
} from '@/lib/sync';

import {
  CRISIS_PLAN_PROGRESS_PATH,
  STRESS_ENTRIES_PATH,
  stressEntryPath,
  TOOL_USES_PATH,
  TOOLKIT_PATH,
  toolkitItemPath,
  toolUsePath,
} from '../api/coping.service';
import type {
  SaveStressEntryBody,
  ServerStressEntry,
  ServerToolkitItem,
  ServerToolUse,
} from '../types/coping.types';
import { type CrisisPlan, planFilled } from '../utils/coping';

/** How a coping tool went: 0 didn't help, 1 helped a bit, 2 helped a lot. */
export type ToolUse = {
  id: string;
  cardId: string;
  at: string;
  helped: 0 | 1 | 2;
  updatedAt?: string;
};

export type StressEntry = {
  id: string;
  at: string;
  situation: string;
  /** 0 to 100%. */
  level?: number;
  helped?: string;
  /** When the phone last changed it; the newest change wins when syncing. */
  updatedAt?: string;
};

/** When each card was last kept or removed on this phone, so a pull never undoes a newer change. */
type CardChanges = Record<string, { updatedAt: string; removed?: boolean }>;
const CARD_CHANGES_KEY = 'coping_toolkit_changes';
const CRISIS_SENT_KEY = 'crisis_plan_progress_sent';

const toolkit = createStore<string[]>('coping_toolkit', []);
const uses = createStore<ToolUse[]>('coping_uses', []);
const stressLog = createStore<StressEntry[]>('stress_log', []);
const crisisPlan = createStore<CrisisPlan | null>('crisis_plan', null);

// Uses and entries saved before sync had no ids, or ids like `stress-1730000000000`.
const usesWithIds = withUuids(
  uses.get().map((use) => ({ ...use, id: use.id ?? '' })),
  Crypto.randomUUID
);
if (usesWithIds) uses.set(usesWithIds);
const entriesWithIds = withUuids(stressLog.get(), Crypto.randomUUID);
if (entriesWithIds) stressLog.set(entriesWithIds);

export const useToolkit = toolkit.use;
export const getToolkit = toolkit.get;
export const useToolUses = uses.use;
export const useStressLog = stressLog.use;
export const getStressLog = stressLog.get;
export const useCrisisPlan = crisisPlan.use;
export const getCrisisPlan = crisisPlan.get;

const now = () => new Date().toISOString();

/** A card's id is made from the card, so keeping it again is the same item on every phone. */
export const toolkitItemId = (cardId: string) => contentUuid(`toolkit|${cardId}`);

function noteCardChange(cardId: string, removed: boolean, updatedAt: string) {
  const changes = readJson<CardChanges>(CARD_CHANGES_KEY, {});
  writeJson(CARD_CHANGES_KEY, {
    ...changes,
    [cardId]: { updatedAt, ...(removed ? { removed } : {}) },
  });
}

function sendCard(cardId: string, updatedAt: string) {
  const id = toolkitItemId(cardId);
  queueChange({
    key: `toolkit:${id}`,
    kind: 'toolkit',
    method: 'PUT',
    path: toolkitItemPath(id),
    body: { cardId, updatedAt },
  });
}

function keepCards(cardIds: string[]) {
  const updatedAt = now();
  cardIds.forEach((cardId) => {
    noteCardChange(cardId, false, updatedAt);
    sendCard(cardId, updatedAt);
  });
}

/** Adds cards to the toolkit, keeping the order they were first saved in. */
export function saveTools(ids: string[]) {
  const current = toolkit.get();
  const fresh = ids.filter((id) => !current.includes(id));
  if (fresh.length === 0) return;
  toolkit.set([...current, ...fresh]);
  keepCards(fresh);
}

export function toggleTool(cardId: string) {
  const current = toolkit.get();
  if (!current.includes(cardId)) return saveTools([cardId]);
  toolkit.set(current.filter((c) => c !== cardId));
  noteCardChange(cardId, true, now());
  const id = toolkitItemId(cardId);
  queueChange({
    key: `toolkit:${id}`,
    kind: 'toolkit',
    method: 'DELETE',
    path: toolkitItemPath(id),
  });
}

function sendUse(use: ToolUse) {
  queueChange({
    key: `tool-uses:${use.id}`,
    kind: 'tool-uses',
    method: 'PUT',
    path: toolUsePath(use.id),
    body: { cardId: use.cardId, helped: use.helped, at: use.at, updatedAt: use.updatedAt ?? now() },
  });
}

export function logToolUse(cardId: string, helped: ToolUse['helped'], at = new Date()) {
  const use: ToolUse = {
    id: Crypto.randomUUID(),
    cardId,
    helped,
    at: at.toISOString(),
    updatedAt: now(),
  };
  uses.set([use, ...uses.get()]);
  sendUse(use);
}

function toServerEntry(entry: StressEntry): SaveStressEntryBody {
  return {
    situation: entry.situation,
    level: entry.level ?? null,
    helped: entry.helped ?? null,
    at: entry.at,
    updatedAt: entry.updatedAt ?? now(),
  };
}

function sendEntry(entry: StressEntry) {
  queueChange({
    key: `stress-entries:${entry.id}`,
    kind: 'stress-entries',
    method: 'PUT',
    path: stressEntryPath(entry.id),
    body: toServerEntry(entry),
  });
}

export function addStressEntry(
  entry: Omit<StressEntry, 'id' | 'at' | 'updatedAt'>,
  at = new Date()
) {
  const created: StressEntry = {
    ...entry,
    id: Crypto.randomUUID(),
    at: at.toISOString(),
    updatedAt: now(),
  };
  stressLog.set([created, ...stressLog.get()]);
  sendEntry(created);
}

// The plan itself never leaves the phone; the server only learns how many parts are filled in.
function sendCrisisProgress(plan: CrisisPlan | null) {
  queueChange({
    key: 'crisis-plan-progress',
    kind: 'crisis-plan-progress',
    method: 'PUT',
    path: CRISIS_PLAN_PROGRESS_PATH,
    body: { partsFilled: planFilled(plan), updatedAt: now() },
  });
  writeJson(CRISIS_SENT_KEY, true);
}

export function saveCrisisPlan(plan: CrisisPlan) {
  crisisPlan.set(plan);
  sendCrisisProgress(plan);
}

// ---- Pulling from the server

export function applyServerToolkit(items: ServerToolkitItem[]) {
  const changes = readJson<CardChanges>(CARD_CHANGES_KEY, {});
  let cards = toolkit.get();
  for (const item of items) {
    const mine = changes[item.cardId];
    if (mine && mine.updatedAt > item.updatedAt) continue;
    const removed = item.deletedAt !== null;
    cards = removed
      ? cards.filter((c) => c !== item.cardId)
      : cards.includes(item.cardId)
        ? cards
        : [...cards, item.cardId];
    changes[item.cardId] = { updatedAt: item.updatedAt, ...(removed ? { removed } : {}) };
  }
  writeJson(CARD_CHANGES_KEY, changes);
  if (cards !== toolkit.get()) toolkit.set(cards);
}

export function uploadLocalToolkit(serverItems: ServerToolkitItem[]) {
  const onServer = new Set(serverItems.map((item) => item.cardId));
  keepCards(toolkit.get().filter((cardId) => !onServer.has(cardId)));
  // A plan made before sync existed is counted once, so the researcher knows it's there.
  if (!readJson<boolean>(CRISIS_SENT_KEY, false) && crisisPlan.get()) {
    sendCrisisProgress(crisisPlan.get());
  }
}

const newestFirst = <T extends { at: string }>(list: T[]) =>
  [...list].sort((a, b) => b.at.localeCompare(a.at));

export function applyServerToolUses(items: ServerToolUse[]) {
  uses.set(
    newestFirst(
      mergeServerItems(uses.get(), items, (item) => ({
        id: item.id,
        cardId: item.cardId,
        helped: item.helped as ToolUse['helped'],
        at: item.at,
        updatedAt: item.updatedAt,
      }))
    )
  );
}

export function uploadLocalToolUses(serverItems: ServerToolUse[]) {
  notOnServer(uses.get(), serverItems).forEach(sendUse);
}

export function applyServerStressEntries(items: ServerStressEntry[]) {
  stressLog.set(
    newestFirst(
      mergeServerItems(stressLog.get(), items, (item) => ({
        id: item.id,
        situation: item.situation,
        at: item.at,
        ...(item.level !== null ? { level: item.level } : {}),
        ...(item.helped ? { helped: item.helped } : {}),
        updatedAt: item.updatedAt,
      }))
    )
  );
}

export function uploadLocalStressEntries(serverItems: ServerStressEntry[]) {
  notOnServer(stressLog.get(), serverItems).forEach(sendEntry);
}

registerSyncKind<ServerToolkitItem>({
  name: 'toolkit',
  path: TOOLKIT_PATH,
  applyServerItems: applyServerToolkit,
  uploadLocal: uploadLocalToolkit,
  clearLocal: () => {
    toolkit.set([]);
    writeJson(CARD_CHANGES_KEY, {});
  },
});

registerSyncKind<ServerToolUse>({
  name: 'tool-uses',
  path: TOOL_USES_PATH,
  applyServerItems: applyServerToolUses,
  uploadLocal: uploadLocalToolUses,
  clearLocal: () => uses.set([]),
});

registerSyncKind<ServerStressEntry>({
  name: 'stress-entries',
  path: STRESS_ENTRIES_PATH,
  applyServerItems: applyServerStressEntries,
  uploadLocal: uploadLocalStressEntries,
  clearLocal: () => stressLog.set([]),
});

// The crisis plan stays on the phone, so it's only cleared when a different student signs in.
onStudentChange(() => {
  crisisPlan.set(null);
  writeJson(CRISIS_SENT_KEY, false);
});
