import type { HealthRepository } from '../repositories/health.repository.js';
import { HealthService } from '../services/health.service.js';

function serviceWith(ping: () => Promise<void>) {
  return new HealthService({ ping } as unknown as HealthRepository);
}

describe('HealthService', () => {
  it('reports ok when the database answers', async () => {
    await expect(serviceWith(async () => undefined).check()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
    });
  });

  it('throws HEALTH_DATABASE_DOWN with a 503 when the database fails', async () => {
    const failing = serviceWith(async () => {
      throw new Error('ECONNREFUSED');
    });
    await expect(failing.check()).rejects.toMatchObject({
      code: 'HEALTH_DATABASE_DOWN',
      status: 503,
    });
  });
});
