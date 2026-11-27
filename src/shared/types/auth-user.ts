export type AuthRole = 'student' | 'researcher' | 'lead';

export type AuthUser = { id: string; role: AuthRole };

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
