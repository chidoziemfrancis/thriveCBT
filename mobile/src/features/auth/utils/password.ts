export const MIN_PASSWORD_LENGTH = 8;

export type PasswordCheck = { label: string; met: boolean };

export function passwordChecks(password: string): PasswordCheck[] {
  return [
    {
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    { label: 'A letter and a number', met: /[a-z]/i.test(password) && /\d/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return passwordChecks(password).every((check) => check.met);
}

export type PasswordStrength = 0 | 1 | 2 | 3;

export const STRENGTH_LABELS = ['Too short', 'Okay', 'Good', 'Strong'] as const;

/** 0 until the rules are met, then rises with length and character variety. */
export function passwordStrength(password: string): PasswordStrength {
  if (!isPasswordValid(password)) return 0;
  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[^a-z0-9]/i.test(password)) {
    score += 1;
  }
  return score as PasswordStrength;
}
