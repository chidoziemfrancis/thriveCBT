import { hashPassword, verifyPassword } from '../password.js';

describe('password hashing', () => {
  it('verifies the right password and rejects others', async () => {
    const hash = await hashPassword('Password123');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain('Password123');
    await expect(verifyPassword(hash, 'Password123')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'password123')).resolves.toBe(false);
  });
});
