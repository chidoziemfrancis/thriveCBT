import { z } from 'zod';

import { SESSION_ERRORS } from '../../errors/codes/session.errors.js';
import { ZodValidationPipe } from '../zod-validation.pipe.js';

const id = z.coerce.number().int().min(1).max(8);

describe('ZodValidationPipe', () => {
  it('returns the checked value', () => {
    expect(new ZodValidationPipe(id).transform('3')).toBe(3);
  });

  it('answers with the given error instead of a validation error when asked', () => {
    expect(() =>
      new ZodValidationPipe(id, SESSION_ERRORS.NOT_FOUND).transform('9'),
    ).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND', status: 404 }),
    );
  });

  it('otherwise throws the validation error as before', () => {
    expect(() => new ZodValidationPipe(id).transform('9')).toThrow(z.ZodError);
  });
});
