import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IS_PUBLIC } from '../../decorators/public.decorator.js';
import { AuthGuard } from '../auth.guard.js';

const jwt = new JwtService({ secret: 'test-secret-test-secret-test-secret' });
const reflector = new Reflector();
const handler = () => undefined;
class Controller {}
const guard = new AuthGuard(jwt, reflector);

function contextWith(authorization?: string) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => Controller,
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('AuthGuard', () => {
  it('lets a valid token through and sets the user', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', role: 'student' });
    const { context, request } = contextWith(`Bearer ${token}`);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', role: 'student' });
  });

  it.each([
    ['no header', undefined],
    ['wrong scheme', 'Basic abc'],
    ['garbage token', 'Bearer not-a-jwt'],
  ])('rejects %s with UNAUTHENTICATED', async (_label, header) => {
    await expect(
      guard.canActivate(contextWith(header).context),
    ).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
      status: 401,
    });
  });

  it('rejects a token signed with another secret, expired, or with an unknown role', async () => {
    const other = new JwtService({
      secret: 'another-secret-another-secret-12',
    });
    const tokens = [
      await other.signAsync({ sub: 'user-1', role: 'student' }),
      await jwt.signAsync(
        { sub: 'user-1', role: 'student' },
        { expiresIn: -10 },
      ),
      await jwt.signAsync({ sub: 'user-1', role: 'admin' }),
    ];
    for (const token of tokens) {
      await expect(
        guard.canActivate(contextWith(`Bearer ${token}`).context),
      ).rejects.toMatchObject({
        code: 'UNAUTHENTICATED',
      });
    }
  });

  it('lets anyone through a route marked @Public()', async () => {
    const open = () => undefined;
    Reflect.defineMetadata(IS_PUBLIC, true, open);
    const request = { headers: {} };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => open,
      getClass: () => Controller,
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
