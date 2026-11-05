import { firstName, type Researcher } from '@/features/assignment/assign';

// Placeholder until the study has a domain; the code is what students actually need.
export const INVITE_BASE_URL = 'https://thrivecbt.app/join/';

export function inviteLink(researcher: Researcher): string {
  return `${INVITE_BASE_URL}${researcher.inviteCode}`;
}

export function inviteMessage(researcher: Researcher): string {
  return `Hi! I'm ${firstName(researcher.name)} from the ThriveCBT study. Download the app and use my code ${researcher.inviteCode} to join: ${inviteLink(researcher)}`;
}
