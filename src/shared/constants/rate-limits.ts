const MINUTE_MS = 60_000;

export const RATE_LIMIT = { ttl: MINUTE_MS, limit: 100 };

export const STRICT_RATE_LIMIT = { default: { ttl: MINUTE_MS, limit: 5 } };

export const REFRESH_RATE_LIMIT = { default: { ttl: MINUTE_MS, limit: 20 } };
