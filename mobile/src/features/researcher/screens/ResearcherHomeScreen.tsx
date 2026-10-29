import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { signOut } from '@/features/auth/signOut';
import { getUserSession } from '@/features/auth/userSession';
import { colors, fonts, radius, type } from '@/theme';

export default function ResearcherHomeScreen() {
  const { email } = getUserSession();

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  return (
    <Screen
      footer={
        <Button variant="secondary" onPress={handleSignOut}>
          Sign out
        </Button>
      }
    >
      <View style={styles.body}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Researcher</Text>
        </View>
        <Text style={[type.title, styles.center]}>Welcome back</Text>
        {email && <Text style={[type.body, styles.center]}>{email}</Text>}
        <Text style={[type.caption, styles.center]}>
          Your students, invites and check-ins will live here.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  center: { textAlign: 'center' },
  badge: {
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 13, color: colors.lavenderInk },
});
