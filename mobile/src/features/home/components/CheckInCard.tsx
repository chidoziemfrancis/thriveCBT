import { StyleSheet, Text, View } from 'react-native';

import Emoji from '@/components/icons/Emoji';
import { Researcher, firstName, initials } from '@/features/assignment/assign';
import { colors, fonts, radius } from '@/theme';

export default function CheckInCard({ researcher }: { researcher: Researcher | undefined }) {
  if (!researcher) {
    return (
      <View style={styles.card}>
        <Emoji name="videoCamera" size={40} />
        <View style={styles.text}>
          <Text style={styles.title}>Weekly check-in</Text>
          <Text style={styles.meta}>
            We’re matching you with a researcher. Your check-ins will appear here.
          </Text>
        </View>
      </View>
    );
  }

  const name = firstName(researcher.name);
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(researcher.name)}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Weekly check-in with {name}</Text>
        <Text style={styles.meta}>{name} will message you to book a time for your video call.</Text>
      </View>
      <Emoji name="videoCamera" size={34} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heavy, fontSize: 17, color: colors.lavenderInk },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
});
