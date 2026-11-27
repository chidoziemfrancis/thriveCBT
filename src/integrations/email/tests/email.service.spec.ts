import type { PinoLogger } from 'nestjs-pino';

import type { ConfigService } from '../../../config/config.service.js';
import { EmailService } from '../email.service.js';

const message = {
  to: 'ada@uni.edu',
  subject: 'Your code',
  text: 'Code: 123456',
};

function setup(transport: 'log' | 'unosend') {
  const settings: Record<string, string> = {
    EMAIL_TRANSPORT: transport,
    EMAIL_FROM: 'ThriveCBT <no-reply@thrivecbt.app>',
    UNOSEND_API_KEY: 'un_test_key',
    UNOSEND_API_URL: 'https://api.unosend.co/v1',
  };
  const logger = { setContext: vi.fn(), info: vi.fn(), error: vi.fn() };
  const config = { get: (key: string) => settings[key] };
  const service = new EmailService(
    config as unknown as ConfigService,
    logger as unknown as PinoLogger,
  );
  return { service, logger };
}

afterEach(() => vi.unstubAllGlobals());

describe('EmailService', () => {
  it('prints the email locally with the log transport', async () => {
    const { service, logger } = setup('log');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await service.send(message);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Code: 123456'),
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends through Unosend with the key, sender and plain text, without tracking', async () => {
    const { service } = setup('unosend');
    const fetch = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    await service.send(message);

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.unosend.co/v1/emails');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer un_test_key' });
    expect(JSON.parse(init.body as string)).toEqual({
      from: 'ThriveCBT <no-reply@thrivecbt.app>',
      to: ['ada@uni.edu'],
      subject: 'Your code',
      text: 'Code: 123456',
      tracking: { open: false, click: false },
    });
  });

  it('fails with EMAIL_SEND_FAILED when Unosend refuses, without logging the message', async () => {
    const { service, logger } = setup('unosend');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":"bad"}', { status: 422 })),
    );
    await expect(service.send(message)).rejects.toMatchObject({
      code: 'EMAIL_SEND_FAILED',
      status: 503,
    });
    expect(logger.error).toHaveBeenCalledWith(
      { status: 422 },
      expect.any(String),
    );
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('123456');
  });

  it('fails with EMAIL_SEND_FAILED when Unosend cannot be reached', async () => {
    const { service } = setup('unosend');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('fetch failed'))),
    );
    await expect(service.send(message)).rejects.toMatchObject({
      code: 'EMAIL_SEND_FAILED',
    });
  });
});
