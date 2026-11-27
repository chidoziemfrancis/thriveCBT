/** Codes ignore case and stray spaces, as people type them; the server does the same. */
export function normaliseCode(typed: string): string {
  return typed.replace(/\s/g, '').toUpperCase();
}
