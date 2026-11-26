import { FieldCipher } from '../field-cipher.js';
import { generateToken, hashToken, tokenMatches } from '../token-hash.js';

const key = Buffer.alloc(32, 7).toString('base64');

describe('FieldCipher', () => {
  const cipher = new FieldCipher(key);

  it('round-trips text, including non-ASCII', () => {
    const plain = 'I felt lighter today – Ẹ ṣé';
    expect(cipher.decrypt(cipher.encrypt(plain))).toBe(plain);
  });

  it('gives a different value each time for the same text', () => {
    expect(cipher.encrypt('same')).not.toBe(cipher.encrypt('same'));
  });

  it('rejects a tampered value', () => {
    const [version, iv, tag, data] = cipher.encrypt('secret').split(':');
    const flipped = Buffer.from(data, 'base64');
    flipped[0] ^= 1;
    expect(() =>
      cipher.decrypt([version, iv, tag, flipped.toString('base64')].join(':')),
    ).toThrow();
  });

  it('rejects a value from another key and unknown formats', () => {
    const other = new FieldCipher(Buffer.alloc(32, 9).toString('base64'));
    expect(() => other.decrypt(cipher.encrypt('secret'))).toThrow();
    expect(() => cipher.decrypt('plain text')).toThrow(/known format/);
  });

  it('refuses a key of the wrong length', () => {
    expect(() => new FieldCipher(Buffer.alloc(16).toString('base64'))).toThrow(
      /32 bytes/,
    );
  });
});

describe('token hashing', () => {
  it('matches only the original token', () => {
    const token = generateToken();
    const stored = hashToken(token);
    expect(stored).not.toContain(token);
    expect(tokenMatches(token, stored)).toBe(true);
    expect(tokenMatches(generateToken(), stored)).toBe(false);
  });
});
