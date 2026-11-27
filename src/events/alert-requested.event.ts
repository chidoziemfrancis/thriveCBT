import type { AlertKind } from '../generated/prisma/client.js';

export const ALERT_REQUESTED = 'alert.requested';

/** Something about a student a researcher must act on, raised by the module that spotted it. */
export class AlertRequestedEvent {
  constructor(
    readonly studentId: string,
    readonly kind: AlertKind,
    readonly urgent: boolean,
    readonly title: string,
    /** What it was raised from, e.g. a PHQ-9 result id; the same source never raises the same kind twice. */
    readonly sourceId: string,
    readonly quote?: string,
    readonly detail?: string,
  ) {}
}
