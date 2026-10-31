export type Sender = 'student' | 'researcher';
export type MessageStatus = 'sent' | 'read';

export type Message = {
  id: string;
  from: Sender;
  text: string;
  sentAt: string;
  status: MessageStatus;
  /** Contained risk language; the researcher is alerted and the student is shown support. */
  flagged?: boolean;
};

export type ChatRow =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message; lastInGroup: boolean };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function dayLabel(iso: string, now = new Date()): string {
  const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Flattens messages into rows with a day separator before each new day. A message is the
 * last in its group when the next one is from someone else or on another day, which is where
 * the time and read ticks are shown.
 */
export function toChatRows(messages: Message[], now = new Date()): ChatRow[] {
  const rows: ChatRow[] = [];
  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const day = startOfDay(new Date(message.sentAt));

    if (!previous || startOfDay(new Date(previous.sentAt)) !== day) {
      rows.push({ kind: 'day', key: `day-${day}`, label: dayLabel(message.sentAt, now) });
    }
    const lastInGroup =
      !next || next.from !== message.from || startOfDay(new Date(next.sentAt)) !== day;
    rows.push({ kind: 'message', key: message.id, message, lastInGroup });
  });
  return rows;
}

export function unreadCount(messages: Message[], lastReadAt: string | null): number {
  const since = lastReadAt ? new Date(lastReadAt).getTime() : 0;
  return messages.filter((m) => m.from === 'researcher' && new Date(m.sentAt).getTime() > since)
    .length;
}
