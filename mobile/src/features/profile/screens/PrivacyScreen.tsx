import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon, CloseIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { colors, fonts, radius, type } from '@/theme';

type Visibility = 'yes' | 'no' | 'pending';

// Mirrors the study information. Journal access is an open question for the study team,
// so it's shown honestly as undecided rather than guessed.
const ITEMS: { label: string; detail: string; visibility: Visibility }[] = [
  { label: 'Check-in questionnaires', detail: 'Your PHQ-9 answers and scores', visibility: 'yes' },
  { label: 'Session progress', detail: 'Which parts you’ve finished', visibility: 'yes' },
  { label: 'Mood logs', detail: 'The moods you log each day', visibility: 'yes' },
  { label: 'Messages', detail: 'Your chat with them', visibility: 'yes' },
  { label: 'Check-in feedback', detail: 'How calls felt, if you shared it', visibility: 'yes' },
  {
    label: 'Emergency contact',
    detail: 'Only used if they’re seriously worried',
    visibility: 'yes',
  },
  {
    label: 'Journal entries',
    detail: 'To be confirmed by the study team',
    visibility: 'pending',
  },
  { label: 'Your PIN and password', detail: 'Never seen by anyone', visibility: 'no' },
];

function Badge({ visibility }: { visibility: Visibility }) {
  if (visibility === 'pending') {
    return (
      <View style={[styles.badge, styles.badgePending]}>
        <Text style={styles.badgePendingText}>?</Text>
      </View>
    );
  }
  const yes = visibility === 'yes';
  return (
    <View style={[styles.badge, yes ? styles.badgeYes : styles.badgeNo]}>
      {yes ? (
        <CheckIcon size={12} color={colors.onPrimary} />
      ) : (
        <CloseIcon size={12} color={colors.onPrimary} />
      )}
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <Screen>
      <BackButton />
      <Text style={[type.title, styles.title]}>What your researcher can see</Text>
      <Text style={type.body}>
        Your researcher sees this to support you and for the study. It’s never shared with your
        school, and study results never include your name.
      </Text>

      <View style={styles.card}>
        {ITEMS.map((item) => (
          <View
            key={item.label}
            style={styles.row}
            accessibilityLabel={`${item.label}: ${
              item.visibility === 'yes'
                ? 'visible'
                : item.visibility === 'no'
                  ? 'not visible'
                  : 'not decided yet'
            }. ${item.detail}`}
          >
            <Badge visibility={item.visibility} />
            <View style={styles.text}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 18, marginBottom: 8 },
  card: {
    marginTop: 20,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeYes: { backgroundColor: colors.primary },
  badgeNo: { backgroundColor: colors.inkFaint },
  badgePending: { backgroundColor: colors.butter },
  badgePendingText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.butterInk },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  detail: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
