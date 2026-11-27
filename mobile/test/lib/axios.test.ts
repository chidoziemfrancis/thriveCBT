import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { InternalAxiosRequestConfig } from 'axios';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'request-id-1' }));

import { api, configureAuth } from '@/lib/axios';

type Seen = { url?: string; authorization?: string; requestId?: string };

let token: string | null = 'old-token';
let seen: Seen[] = [];
const refresh = jest.fn<() => Promise<string | null>>();
const onSignedOut = jest.fn();

function reply(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response = { status, data, statusText: '', headers: {}, config };
  if (status >= 400) {
    const error = Object.assign(new Error('failed'), { isAxiosError: true, config, response });
    return Promise.reject(error);
  }
  return Promise.resolve(response);
}

beforeEach(() => {
  token = 'old-token';
  seen = [];
  refresh.mockReset();
  onSignedOut.mockReset();
  configureAuth({ getAccessToken: () => token, refresh, onSignedOut });
  api.defaults.adapter = (config) => {
    const authorization = config.headers.get('Authorization') as string | undefined;
    seen.push({
      url: config.url,
      authorization,
      requestId: config.headers.get('x-request-id') as string,
    });
    return authorization === 'Bearer new-token'
      ? reply(config, 200, { ok: true })
      : reply(config, 401, {
          error: { code: 'UNAUTHENTICATED', message: 'Please log in again.', requestId: 'r' },
        });
  };
});

describe('the API client', () => {
  it('sends the access token and a request id', async () => {
    token = 'new-token';
    await api.get('/me');
    expect(seen[0]).toEqual({
      url: '/me',
      authorization: 'Bearer new-token',
      requestId: 'request-id-1',
    });
  });

  it('refreshes once on a 401 and repeats the request once', async () => {
    refresh.mockImplementation(async () => {
      token = 'new-token';
      return 'new-token';
    });
    await expect(api.get('/me')).resolves.toMatchObject({ data: { ok: true } });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(seen.map((s) => s.authorization)).toEqual(['Bearer old-token', 'Bearer new-token']);
  });

  it('shares one refresh between requests that fail together', async () => {
    let finish: (value: string) => void = () => undefined;
    refresh.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          finish = (value) => {
            token = value;
            resolve(value);
          };
        })
    );
    const requests = Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    finish('new-token');
    await requests;
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('signs out when the login can no longer be renewed', async () => {
    refresh.mockResolvedValue(null);
    await expect(api.get('/me')).rejects.toMatchObject({ code: 'UNAUTHENTICATED', status: 401 });
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the login when the refresh fails because the phone is offline', async () => {
    refresh.mockRejectedValue(
      Object.assign(new Error('Network Error'), { isAxiosError: true, code: 'ERR_NETWORK' })
    );
    await expect(api.get('/me')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(onSignedOut).not.toHaveBeenCalled();
  });

  it('never refreshes for login and refresh calls themselves', async () => {
    await expect(api.post('/auth/login', {}, { skipAuthRefresh: true })).rejects.toMatchObject({
      status: 401,
    });
    expect(refresh).not.toHaveBeenCalled();
  });
});
