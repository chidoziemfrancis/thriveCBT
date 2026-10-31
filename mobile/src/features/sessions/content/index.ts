import { SESSION_1 } from './session1';
import type { SessionContent } from './types';

const CONTENT: Record<number, SessionContent> = { 1: SESSION_1 };

/** Undefined for sessions whose content hasn't been written yet. */
export function sessionContent(sessionId: number): SessionContent | undefined {
  return CONTENT[sessionId];
}
