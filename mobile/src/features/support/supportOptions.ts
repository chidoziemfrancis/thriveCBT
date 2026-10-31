import { HeartHandIcon, PhoneIcon, ShieldIcon } from '@/components/icons';

// Shared by the crisis screen after the PHQ-9 and the always-available help screen, so the
// two can never drift apart. Real contacts come from the study team.
export const SUPPORT_OPTIONS = [
  { label: 'Your campus counselling centre', Icon: ShieldIcon },
  { label: 'A local crisis helpline', Icon: PhoneIcon },
  { label: 'The research team supporting this study', Icon: HeartHandIcon },
];
