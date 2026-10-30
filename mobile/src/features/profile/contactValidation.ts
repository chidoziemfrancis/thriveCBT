/** Accepts local and international formats; only the digits are counted. */
export function isValidPhone(phone: string): boolean {
  if (!/^\+?[\d\s()-]+$/.test(phone.trim())) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}
