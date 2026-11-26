import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';

import type { ErrorDefinition } from '../errors/error-codes.js';
import { errorResponseSchema } from '../errors/error-response.js';

type OpenApiSchema = Record<string, unknown>;

export function toOpenApiSchema(schema: z.ZodType): OpenApiSchema {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    io: 'output',
    unrepresentable: 'any',
  }) as OpenApiSchema;
  return rest;
}

export function ApiZodBody(schema: z.ZodType) {
  return ApiBody({ schema: toOpenApiSchema(schema) });
}

export function ApiZodResponse(
  status: number,
  schema: z.ZodType,
  description: string,
) {
  return ApiResponse({ status, description, schema: toOpenApiSchema(schema) });
}

export function ApiErrors(...definitions: ErrorDefinition[]) {
  const byStatus = new Map<number, ErrorDefinition[]>();
  for (const definition of definitions) {
    byStatus.set(definition.status, [
      ...(byStatus.get(definition.status) ?? []),
      definition,
    ]);
  }
  return applyDecorators(
    ...[...byStatus].map(([status, group]) =>
      ApiResponse({
        status,
        description: group.map((d) => d.code).join(', '),
        schema: toOpenApiSchema(errorResponseSchema),
        example: {
          error: {
            code: group[0].code,
            message: group[0].message,
            requestId: '0193c3c1-6c2d-7b51-9b6e-2f4a6c8d9e10',
          },
        },
      }),
    ),
  );
}
