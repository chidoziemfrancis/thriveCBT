import { Injectable } from '@nestjs/common';

import type { StudentProfile } from '../../../../generated/prisma/client.js';
import { ConsentService } from '../../../consent/services/consent.service.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import type {
  PreferencesDto,
  StudentProfileDto,
  UpdatePreferencesBody,
  UpdateProfileBody,
} from '../dto/student-profile.dto.js';
import { StudentsRepository } from '../repositories/students.repository.js';

export const STUDY_WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function studyWeek(joinedAt: Date, now = new Date()): number {
  const week = Math.floor((now.getTime() - joinedAt.getTime()) / WEEK_MS) + 1;
  return Math.min(Math.max(week, 1), STUDY_WEEKS);
}

function toProfileDto(
  profile: StudentProfile,
  startedAt: Date | null,
  now: Date,
): StudentProfileDto {
  return {
    name: profile.name,
    dateOfBirth: profile.dateOfBirth
      ? profile.dateOfBirth.toISOString().slice(0, 10)
      : null,
    isUndergraduate: profile.isUndergraduate,
    avatarId: profile.avatarId,
    studyWeek: studyWeek(startedAt ?? profile.joinedAt, now),
    joinedAt: profile.joinedAt.toISOString(),
    startedAt: startedAt?.toISOString() ?? null,
  };
}

function toPreferencesDto(profile: StudentProfile): PreferencesDto {
  return {
    notifySessions: profile.notifySessions,
    notifyMood: profile.notifyMood,
    moodReminderTime:
      profile.moodReminderTime as PreferencesDto['moodReminderTime'],
    notifyMessages: profile.notifyMessages,
    notifyCheckIns: profile.notifyCheckIns,
  };
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly repository: StudentsRepository,
    private readonly consent: ConsentService,
  ) {}

  async getProfile(
    userId: string,
    now = new Date(),
  ): Promise<StudentProfileDto> {
    const [profile, startedAt] = await Promise.all([
      this.find(userId),
      this.consent.startedAt(userId),
    ]);
    return toProfileDto(profile, startedAt, now);
  }

  async updateProfile(
    userId: string,
    body: UpdateProfileBody,
    now = new Date(),
  ): Promise<StudentProfileDto> {
    await this.find(userId);
    const { dateOfBirth, ...rest } = body;
    const profile = await this.repository.update(userId, {
      ...rest,
      ...(dateOfBirth
        ? { dateOfBirth: new Date(`${dateOfBirth}T00:00:00Z`) }
        : {}),
    });
    return toProfileDto(profile, await this.consent.startedAt(userId), now);
  }

  async getPreferences(userId: string): Promise<PreferencesDto> {
    return toPreferencesDto(await this.find(userId));
  }

  async updatePreferences(
    userId: string,
    body: UpdatePreferencesBody,
  ): Promise<PreferencesDto> {
    await this.find(userId);
    return toPreferencesDto(await this.repository.update(userId, body));
  }

  private async find(userId: string): Promise<StudentProfile> {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) throw new AppError(COMMON_ERRORS.NOT_FOUND);
    return profile;
  }
}
