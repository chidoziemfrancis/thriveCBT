import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC } from '../../decorators/public.decorator.js';
import { ROLES_KEY } from '../../decorators/roles.decorator.js';
import type { AuthUser } from '../../types/auth-user.js';
import { RolesGuard } from '../roles.guard.js';

const guard = new RolesGuard(new Reflector());
class Controller {}

function contextFor(metadata: Record<string, unknown>, user?: AuthUser) {
  const handler = () => undefined;
  for (const [key, value] of Object.entries(metadata))
    Reflect.defineMetadata(key, value, handler);
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => handler,
    getClass: () => Controller,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('lets any logged-in user through when a route names no roles', () => {
    expect(
      guard.canActivate(contextFor({}, { id: 'u1', role: 'student' })),
    ).toBe(true);
  });

  it('lets a matching role through', () => {
    const context = contextFor(
      { [ROLES_KEY]: ['researcher', 'lead'] },
      { id: 'u1', role: 'researcher' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('refuses a student on a researcher route with FORBIDDEN', () => {
    const context = contextFor(
      { [ROLES_KEY]: ['researcher'] },
      { id: 'u1', role: 'student' },
    );
    expect(() => guard.canActivate(context)).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN', status: 403 }),
    );
  });

  it('skips public routes', () => {
    expect(
      guard.canActivate(
        contextFor({ [IS_PUBLIC]: true, [ROLES_KEY]: ['lead'] }),
      ),
    ).toBe(true);
  });
});
