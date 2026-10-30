import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Mascot from '@/components/mascot/Mascot';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { signOut } from '@/features/auth/signOut';
import {
  WITHDRAW_PHRASE,
  confirmsWithdrawal,
  recordWithdrawal,
} from '@/features/profile/withdrawalStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

// Draft wording until the study team confirms what happens to data on withdrawal.
const WHAT_HAPPENS = [
  'Answers you’ve already given are kept for the study, without your name.',
  'Nothing new is collected from today.',
  'Your researcher is told, and won’t contact you about the study again.',
  'You’re signed out of the app.',
];

export default function WithdrawScreen() {
  const [reason, setReason] = useState('');
  const [typed, setTyped] = useState('');
  const confirmed = confirmsWithdrawal(typed);

  async function withdraw() {
    if (!confirmed) return;
    recordWithdrawal(reason.trim() || undefined);
    haptics.tap();
    await signOut();
    router.dismissAll();
    router.replace('/profile/withdrawn');
  }

  return (
    <Screen
      footer={
        <>
          <Button disabled={!confirmed} onPress={withdraw}>
            Withdraw from the study
          </Button>
          <Button variant="ghost" onPress={() => router.back()}>
            Keep taking part
          </Button>
        </>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.center}>
          <Mascot size={96} mood="calm" />
        </View>
        <Text style={[type.title, styles.centerText]}>Leaving the study</Text>
        <Text style={[type.body, styles.centerText]}>
          You can stop at any time, without giving a reason. Thank you for the time you’ve given so
          far.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What happens if you withdraw</Text>
          {WHAT_HAPPENS.map((line) => (
            <View key={line} style={styles.row}>
              <View style={styles.bullet} />
              <Text style={styles.rowText}>{line}</Text>
            </View>
          ))}
        </View>

        <Text style={type.caption}>
          If things feel hard right now, you can still reach support from the Help screen, or talk
          to your researcher before deciding.
        </Text>

        <TextField
          label="Anything you’d like to tell us? (optional)"
          value={reason}
          onChangeText={setReason}
          multiline
          placeholder="What made you decide to stop"
          style={styles.reason}
        />

        <TextField
          label={`Type ${WITHDRAW_PHRASE} to confirm`}
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={WITHDRAW_PHRASE}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 12, gap: 16 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  card: {
    gap: 10,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: colors.inkFaint,
  },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.ink },
  reason: { height: 90, paddingTop: 14, textAlignVertical: 'top' },
});
