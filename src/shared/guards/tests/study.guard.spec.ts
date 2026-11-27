import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { PrismaService } from '../../../prisma/prisma.service.js';
import { STUDY_DATA_KEY } from '../../decorators/study-data.decorator.js';
import { StudyGuard } from '../study.guard.js';

class Controller {}

function setup(account: { status: string; consents: unknown[] } | null) {
  const prisma = { user: { findUnique: vi.fn(async () => account) } };
  const guard = new StudyGuard(
    new Reflector(),
    prisma as unknown as PrismaService,
  );
  return { guard, prisma };
}

function contextFor(studyData: boolean) {
  const handler = () => undefined;
  if (studyData) Reflect.defineMetadata(STUDY_DATA_KEY, true, handler);
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 's1', role: 'student' } }),
    }),
    getHandler: () => handler,
    getClass: () => Controller,
  } as unknown as ExecutionContext;
}

describe('StudyGuard', () => {
  it('leaves routes that aren’t study data alone, without a database call', async () => {
    const { guard, prisma } = setup(null);
    await expect(guard.canActivate(contextFor(false))).resolves.toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('lets a consented, active student through', async () => {
    const { guard } = setup({ status: 'ACTIVE', consents: [{ id: 'c1' }] });
    await expect(guard.canActivate(contextFor(true))).resolves.toBe(true);
  });

  it('asks for consent first', async () => {
    const { guard } = setup({ status: 'ACTIVE', consents: [] });
    await expect(guard.canActivate(contextFor(true))).rejects.toMatchObject({
      code: 'CONSENT_REQUIRED',
      status: 403,
    });
  });

  it('saves nothing more once the student has withdrawn', async () => {
    const { guard } = setup({ status: 'WITHDRAWN', consents: [{ id: 'c1' }] });
    await expect(guard.canActivate(contextFor(true))).rejects.toMatchObject({
      code: 'STUDY_WITHDRAWN',
    });
  });
});
