import { describe, expect, it } from '@jest/globals';

import { Message, dayLabel, toChatRows, unreadCount } from '@/features/chat/chatLogic';

const now = new Date(2026, 9, 29, 15);

function message(id: string, from: Message['from'], at: Date): Message {
  return { id, from, text: id, sentAt: at.toISOString(), status: 'sent' };
}

describe('dayLabel', () => {
  it('names today and yesterday, and dates anything older', () => {
    expect(dayLabel(new Date(2026, 9, 29, 8).toISOString(), now)).toBe('Today');
    expect(dayLabel(new Date(2026, 9, 28, 23).toISOString(), now)).toBe('Yesterday');
    expect(dayLabel(new Date(2026, 9, 20).toISOString(), now)).not.toMatch(/Today|Yesterday/);
  });
});

describe('toChatRows', () => {
  const messages = [
    message('a', 'student', new Date(2026, 9, 28, 10)),
    message('b', 'researcher', new Date(2026, 9, 28, 11)),
    message('c', 'student', new Date(2026, 9, 29, 9)),
    message('d', 'student', new Date(2026, 9, 29, 9, 1)),
    message('e', 'researcher', new Date(2026, 9, 29, 10)),
  ];
  const rows = toChatRows(messages, now);

  it('adds a day separator before the first message of each day', () => {
    expect(
      rows.filter((r) => r.kind === 'day').map((r) => (r.kind === 'day' ? r.label : ''))
    ).toEqual(['Yesterday', 'Today']);
    expect(rows.map((r) => (r.key.startsWith('day') ? 'day' : r.key))).toEqual([
      'day',
      'a',
      'b',
      'day',
      'c',
      'd',
      'e',
    ]);
  });

  it('marks the last message before the sender or day changes', () => {
    const last = Object.fromEntries(
      rows.flatMap((r) => (r.kind === 'message' ? [[r.message.id, r.lastInGroup]] : []))
    );
    expect(last).toEqual({ a: true, b: true, c: false, d: true, e: true });
  });
});

describe('unreadCount', () => {
  const messages = [
    message('mine', 'student', new Date(2026, 9, 29, 9)),
    message('old', 'researcher', new Date(2026, 9, 29, 10)),
    message('new', 'researcher', new Date(2026, 9, 29, 12)),
  ];

  it('counts researcher messages after the last read time', () => {
    expect(unreadCount(messages, new Date(2026, 9, 29, 11).toISOString())).toBe(1);
  });

  it('counts every researcher message when the chat was never opened', () => {
    expect(unreadCount(messages, null)).toBe(2);
  });

  it('never counts the student’s own messages', () => {
    expect(unreadCount([messages[0]], null)).toBe(0);
  });
});
