import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type Profile = ResponseOf<'/v1/me/profile', 'get'>;
export type ProfileUpdate = BodyOf<'/v1/me/profile', 'patch'>;
export type ServerPreferences = ResponseOf<'/v1/me/preferences', 'get'>;
export type PreferencesUpdate = BodyOf<'/v1/me/preferences', 'patch'>;
