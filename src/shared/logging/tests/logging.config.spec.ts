import type { IncomingMessage, ServerResponse } from 'node:http';

import { REDACT_PATHS, requestIdFor } from '../logging.config.js';

function call(header?: string) {
  const res = { setHeader: vi.fn() };
  const req = {
    headers: header === undefined ? {} : { 'x-request-id': header },
  };
  const id = requestIdFor(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
  );
  return { id, res };
}

describe('requestIdFor', () => {
  it('keeps a well-formed incoming id and echoes it back', () => {
    const { id, res } = call('mobile-abc12345');
    expect(id).toBe('mobile-abc12345');
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'mobile-abc12345',
    );
  });

  it('replaces missing or unsafe ids with a new one', () => {
    expect(call().id).toMatch(/^[0-9a-f-]{36}$/);
    expect(call('bad id\nwith newline').id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('log redaction', () => {
  it('covers credentials and personal fields', () => {
    for (const path of [
      'req.headers.authorization',
      'password',
      '*.answers',
      '*.*.email',
    ]) {
      expect(REDACT_PATHS).toContain(path);
    }
  });
});
