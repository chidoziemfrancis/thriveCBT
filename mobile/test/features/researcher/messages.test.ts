import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { Message } from '@/features/chat/chatLogic';
import { mockCaseload } from '@/features/researcher/caseload';
import {
  inboxRows,
  inboxTime,
  unansweredRisk,
  unreadIn,
} from '@/features/researcher/messagesLogic';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));

beforeEach(() => mockMemory.clear());

const now = new Date(2026, 10, 3, 13, 0);

function msg(from: Message['from'], hour: number, flagged?: boolean): Message {
  return {
    id: `${from}${hour}`,
    from,
    text: 'x',
    sentAt: new Date(2026, 10, 3, hour).toISOString(),
    status: 'read',
    flagged,
  };
}

const empty = { sent: {}, readAt: {}, followUp: [] };

describe('unreadIn', () => {
  it('counts student messages since the researcher last replied', () => {
    expect(
      unreadIn([msg('student', 8), msg('researcher', 9), msg('student', 10), msg('student', 11)])
    ).toBe(2);
  });

  it('treats opening the chat as reading it', () => {
    expect(unreadIn([msg('student', 10)], new Date(2026, 10, 3, 12).toISOString())).toBe(0);
  });
});

describe('unansweredRisk', () => {
  it('is true until the researcher replies after a risky message', () => {
    expect(unansweredRisk([msg('student', 10, true)])).toBe(true);
    expect(unansweredRisk([msg('student', 10, true), msg('researcher', 11)])).toBe(false);
  });
});

describe('inboxRows', () => {
  const { students } = mockCaseload(now);

  it('puts unanswered risk first', () => {
    const rows = inboxRows(students, empty);
    expect(rows[0].student.id).toBe('s-tolu');
    expect(rows[0].risk).toBe(true);
  });

  it('puts follow-up chats above other unread ones', () => {
    const rows = inboxRows(students, { ...empty, followUp: ['s-emeka'] });
    expect(rows.findIndex((r) => r.student.id === 's-emeka')).toBe(1);
  });

  it('filters to unread or follow-up chats', () => {
    expect(inboxRows(students, empty, 'unread').every((r) => r.unread > 0)).toBe(true);
    expect(
      inboxRows(students, { ...empty, followUp: ['s-seyi'] }, 'followUp').map((r) => r.student.id)
    ).toEqual(['s-seyi']);
  });

  it('includes what the researcher has sent', () => {
    const sent = { 's-tolu': [{ ...msg('researcher', 23), id: 'r1', text: 'I’m here.' }] };
    const [tolu] = inboxRows(students, { ...empty, sent }).filter((r) => r.student.id === 's-tolu');
    expect(tolu.last?.text).toBe('I’m here.');
    expect(tolu.risk).toBe(false);
    expect(tolu.unread).toBe(0);
  });
});

describe('inboxTime', () => {
  it('reads like a messaging app', () => {
    expect(inboxTime(new Date(2026, 10, 2, 9).toISOString(), now)).toBe('Yesterday');
    expect(inboxTime(new Date(2026, 9, 20, 9).toISOString(), now)).not.toMatch(/Yesterday/);
  });
});

describe('researcher chat store', () => {
  it('saves sent messages, read times and follow-up flags', () => {
    jest.isolateModules(() => {
      const store =
        require('@/features/researcher/researcherChatStore') as typeof import('@/features/researcher/researcherChatStore');
      store.sendToStudent('s1', '  Hello  ', now);
      store.markThreadRead('s1', now);
      store.toggleFollowUp('s1');
      store.toggleFollowUp('s2');
      store.toggleFollowUp('s2');
      const saved = mockMemory.get('researcher_chat') as {
        sent: Record<string, Message[]>;
        readAt: Record<string, string>;
        followUp: string[];
      };
      expect(saved.sent.s1[0]).toMatchObject({ from: 'researcher', text: 'Hello' });
      expect(saved.readAt.s1).toBe(now.toISOString());
      expect(saved.followUp).toEqual(['s1']);
    });
  });
});
