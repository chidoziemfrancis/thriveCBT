import { fromPrismaError } from '../prisma-errors.js';

function prismaError(name: string, fields: Record<string, unknown> = {}) {
  return Object.assign(new Error('prisma'), { name, ...fields });
}

describe('fromPrismaError', () => {
  it('turns a duplicate into CONFLICT and a missing record into NOT_FOUND', () => {
    expect(
      fromPrismaError(
        prismaError('PrismaClientKnownRequestError', { code: 'P2002' }),
      ),
    ).toMatchObject({
      code: 'CONFLICT',
      status: 409,
    });
    expect(
      fromPrismaError(
        prismaError('PrismaClientKnownRequestError', { code: 'P2025' }),
      ),
    ).toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('turns an unreachable database into SERVICE_UNAVAILABLE', () => {
    expect(
      fromPrismaError(prismaError('PrismaClientInitializationError')),
    ).toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
    });
    expect(
      fromPrismaError(
        prismaError('DriverAdapterError', { cause: { code: 'ECONNREFUSED' } }),
      ),
    ).toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
  });

  it('leaves other errors alone', () => {
    expect(
      fromPrismaError(
        prismaError('PrismaClientKnownRequestError', { code: 'P2003' }),
      ),
    ).toBeUndefined();
    expect(fromPrismaError(new Error('boom'))).toBeUndefined();
    expect(fromPrismaError('text')).toBeUndefined();
  });
});
