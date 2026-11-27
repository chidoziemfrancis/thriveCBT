/** The seeded backend accounts used to try the app out (for example ada.student@thrivecbt.test). */
export function isTestAccount(email: string | undefined): boolean {
  return Boolean(email?.trim().toLowerCase().endsWith('@thrivecbt.test'));
}
