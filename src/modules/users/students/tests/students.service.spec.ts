import type { ConsentService } from '../../../consent/services/consent.service.js';
import type { StudentProfile } from '../../../../generated/prisma/client.js';
import {
  updatePreferencesSchema,
  updateProfileSchema,
} from '../dto/student-profile.dto.js';
import type { StudentsRepository } from '../repositories/students.repository.js';
import { StudentsService, studyWeek } from '../services/students.service.js';

const JOINED = new Date('2026-11-01T09:00:00Z');
const day = (n: number) => new Date(JOINED.getTime() + n * 86_400_000);

function setup(exists = true, startedAt: Date | null = null) {
  let profile = {
    userId: 'u1',
    name: null,
    dateOfBirth: null,
    isUndergraduate: null,
    avatarId: null,
    notifySessions: true,
    notifyMood: true,
    moodReminderTime: '18:00',
    notifyMessages: true,
    notifyCheckIns: true,
    joinedAt: JOINED,
  } as unknown as StudentProfile;
  const repository = {
    findByUserId: vi.fn(async () => (exists ? profile : null)),
    update: vi.fn(
      async (_userId: string, data: Partial<StudentProfile>) =>
        (profile = { ...profile, ...data }),
    ),
  };
  return {
    service: new StudentsService(
      repository as unknown as StudentsRepository,
      { startedAt: vi.fn(async () => startedAt) } as unknown as ConsentService,
    ),
    repository,
  };
}

describe('studyWeek', () => {
  it.each([
    [0, 1],
    [6, 1],
    [7, 2],
    [49, 8],
    [120, 8],
  ])('day %i of the study is week %i', (days, week) => {
    expect(studyWeek(JOINED, day(days))).toBe(week);
  });
});

describe('StudentsService', () => {
  it('counts the study week from the day the student consented, as the app does', async () => {
    const { service } = setup(true, day(10));
    await expect(service.getProfile('u1', day(17))).resolves.toMatchObject({
      studyWeek: 2,
      joinedAt: JOINED.toISOString(),
      startedAt: day(10).toISOString(),
    });
  });

  it('returns an empty profile with the study week', async () => {
    const { service } = setup();
    await expect(service.getProfile('u1', day(8))).resolves.toEqual({
      name: null,
      dateOfBirth: null,
      isUndergraduate: null,
      avatarId: null,
      studyWeek: 2,
      joinedAt: JOINED.toISOString(),
      startedAt: null,
    });
  });

  it('saves profile changes and keeps the date of birth as a plain date', async () => {
    const { service, repository } = setup();
    const result = await service.updateProfile(
      'u1',
      { name: 'Ada', dateOfBirth: '2004-03-09', avatarId: 'avatar-03' },
      day(1),
    );
    expect(repository.update.mock.calls[0][1]).toMatchObject({
      dateOfBirth: new Date('2004-03-09T00:00:00Z'),
    });
    expect(result).toMatchObject({
      name: 'Ada',
      dateOfBirth: '2004-03-09',
      avatarId: 'avatar-03',
    });
  });

  it('defaults notifications on, with the mood reminder at 18:00, and saves changes', async () => {
    const { service } = setup();
    await expect(service.getPreferences('u1')).resolves.toMatchObject({
      notifyMood: true,
      moodReminderTime: '18:00',
    });
    await expect(
      service.updatePreferences('u1', {
        notifyMood: false,
        moodReminderTime: '08:00',
      }),
    ).resolves.toMatchObject({
      notifyMood: false,
      moodReminderTime: '08:00',
    });
  });

  it('throws NOT_FOUND when there is no student profile', async () => {
    const { service } = setup(false);
    await expect(service.getProfile('u1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('profile and settings checks', () => {
  it('accept what the app sends', () => {
    expect(
      updateProfileSchema.safeParse({
        name: ' Ada ',
        dateOfBirth: '2004-03-09',
        isUndergraduate: true,
        avatarId: 'avatar-08',
      }).success,
    ).toBe(true);
    expect(
      updatePreferencesSchema.safeParse({ moodReminderTime: '21:00' }).success,
    ).toBe(true);
  });

  it('refuse empty updates, future birth dates, unknown avatars and reminder times', () => {
    for (const body of [
      {},
      { dateOfBirth: '2999-01-01' },
      { avatarId: 'cat' },
      { name: '' },
    ]) {
      expect(updateProfileSchema.safeParse(body).success).toBe(false);
    }
    expect(
      updatePreferencesSchema.safeParse({ moodReminderTime: '10:00' }).success,
    ).toBe(false);
    expect(updatePreferencesSchema.safeParse({}).success).toBe(false);
  });
});
