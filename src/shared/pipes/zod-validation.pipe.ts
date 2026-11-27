import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

import { AppError } from '../errors/app-error.js';
import type { ErrorDefinition } from '../errors/error-codes.js';

/**
 * Checks a value against a schema. `whenInvalid` swaps the usual VALIDATION_FAILED for a more
 * telling error, e.g. a path id that can't exist answers 404.
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<
  unknown,
  z.output<T>
> {
  constructor(
    private readonly schema: T,
    private readonly whenInvalid?: ErrorDefinition,
  ) {}

  transform(value: unknown): z.output<T> {
    if (!this.whenInvalid) return this.schema.parse(value);
    const result = this.schema.safeParse(value);
    if (!result.success) throw new AppError(this.whenInvalid);
    return result.data;
  }
}
