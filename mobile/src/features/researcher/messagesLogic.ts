import type { Message } from '@/features/chat/chatLogic';

import type { CaseloadStudent } from './caseload';
import type { ResearcherChatState } from './researcherChatStore';

export type InboxFilter = 'all' | 'unread' | 'followUp';

/** Short replies researchers send often, editable before sending. */
export const QUICK_REPLIES = [
  'Just checking in, how are you doing?',
  'How did this week’s session go?',
  'Would a call this week help?',
  'Thank you for telling me.',
];

/** The whole conversation with a student: their messages plus what the researcher has sent. */
export function threadFor(student: CaseloadStudent, chat: ResearcherChatState): Message[] {
  return [...student.messages, ...(chat.sent[student.id] ?? [])].sort((a, b) =>
    a.sentAt.localeCompare(b.sentAt)
  );
}

// Replying counts as reading: anything the student wrote before the researcher's latest message
// has been seen. Opening the chat moves that point forward too.
function seenUntil(thread: Message[], readAt?: string): number {
  const lastReply = [...thread].reverse().find((m) => m.from === 'researcher');
  return Math.max(
    lastReply ? new Date(lastReply.sentAt).getTime() : 0,
    readAt ? new Date(readAt).getTime() : 0
  );
}

export function unreadIn(thread: Message[], readAt?: string): number {
  const since = seenUntil(thread, readAt);
  return thread.filter((m) => m.from === 'student' && new Date(m.sentAt).getTime() > since).length;
}

/** A message with risk words that the researcher hasn't replied to yet. */
export function unansweredRisk(thread: Message[]): boolean {
  const lastReply = [...thread].reverse().find((m) => m.from === 'researcher');
  const since = lastReply ? new Date(lastReply.sentAt).getTime() : 0;
  return thread.some(
    (m) => m.from === 'student' && m.flagged && new Date(m.sentAt).getTime() > since
  );
}

export type InboxRow = {
  student: CaseloadStudent;
  last: Message | undefined;
  unread: number;
  risk: boolean;
  followUp: boolean;
};

/**
 * One row per student with a conversation. Unanswered risk comes first, then chats flagged for
 * follow-up, then unread ones, then the most recent.
 */
export function inboxRows(
  students: CaseloadStudent[],
  chat: ResearcherChatState,
  filter: InboxFilter = 'all'
): InboxRow[] {
  return students
    .map((student) => {
      const thread = threadFor(student, chat);
      return {
        student,
        last: thread[thread.length - 1],
        unread: unreadIn(thread, chat.readAt[student.id]),
        risk: unansweredRisk(thread),
        followUp: chat.followUp.includes(student.id),
      };
    })
    .filter((row) => row.last)
    .filter((row) => filter !== 'unread' || row.unread > 0)
    .filter((row) => filter !== 'followUp' || row.followUp)
    .sort(
      (a, b) =>
        Number(b.risk) - Number(a.risk) ||
        Number(b.followUp) - Number(a.followUp) ||
        Number(b.unread > 0) - Number(a.unread > 0) ||
        (b.last?.sentAt ?? '').localeCompare(a.last?.sentAt ?? '')
    );
}

/** The time for today, "Yesterday", or a short date, like a messaging app's list. */
export function inboxTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000
  );
  if (days === 0) return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
