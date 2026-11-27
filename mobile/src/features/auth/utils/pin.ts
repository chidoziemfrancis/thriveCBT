export const PIN_LENGTH = 4;

/** After this many wrong PINs the PIN is wiped and a full password sign-in is required. */
export const MAX_PIN_ATTEMPTS = 5;

// Mood logs, journals and chats are private, so the app asks for the PIN again when someone
// returns to it after a while away.
export const RELOCK_AFTER_MS = 5 * 60_000;

/** Repeated digits (1111) and straight runs (1234, 9876) are the first PINs anyone guesses. */
export function isWeakPin(pin: string): boolean {
  if (pin.length !== PIN_LENGTH) return true;
  const digits = pin.split('').map(Number);
  const steps = digits.slice(1).map((d, i) => d - digits[i]);
  const sameStep = steps.every((step) => step === steps[0]);
  return sameStep && Math.abs(steps[0]) <= 1;
}

export function shouldRelock(backgroundedAt: number | null, now: number): boolean {
  return backgroundedAt !== null && now - backgroundedAt >= RELOCK_AFTER_MS;
}
