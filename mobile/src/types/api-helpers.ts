import type { paths } from './api';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Json<T> = T extends { content: { 'application/json': infer Body } } ? Body : never;

/** The JSON a backend endpoint returns, e.g. ResponseOf<'/v1/me', 'get'>. */
export type ResponseOf<
  P extends keyof paths,
  M extends Method,
  S extends number = 200,
> = paths[P][M] extends {
  responses: infer Responses;
}
  ? S extends keyof Responses
    ? Json<Responses[S]>
    : never
  : never;

/** The JSON body a backend endpoint expects, e.g. BodyOf<'/v1/auth/login', 'post'>. */
export type BodyOf<P extends keyof paths, M extends Method> = paths[P][M] extends {
  requestBody?: infer Body;
}
  ? Json<NonNullable<Body>>
  : never;
