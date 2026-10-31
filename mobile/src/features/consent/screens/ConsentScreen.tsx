import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import DraftTag from '@/features/consent/components/DraftTag';
import { CONSENT_STATEMENTS, CONSENT_VERSION } from '@/features/consent/consentContent';
import { recordConsent } from '@/features/consent/consentStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

export default function ConsentScreen() {
  const [ticked, setTicked] = useState<boolean[]>(() => CONSENT_STATEMENTS.map(() => false));
  const allTicked = ticked.every(Boolean);

  function toggle(index: number) {
    haptics.tick();
    setTicked((prev) => prev.map((value, i) => (i === index ? !value : value)));
  }

  function handleAgree() {
    if (!allTicked) return;
    recordConsent(CONSENT_VERSION);
    haptics.success();
    router.push('/onboarding/name');
  }

  return (
    <Screen
      footer={
        <>
          <Button disabled={!allTicked} onPress={handleAgree}>
            I agree to take part
          </Button>
          <Button variant="ghost" onPress={() => router.back()}>
            Read the study information again
          </Button>
        </>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.copy}>
          <DraftTag />
          <Text style={type.title}>Your consent</Text>
          <Text style={type.body}>Tick each one to confirm. You can withdraw at any time.</Text>
        </View>

        <View style={styles.list}>
          {CONSENT_STATEMENTS.map((statement, index) => {
            const checked = ticked[index];
            return (
              <Pressable
                key={statement}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => toggle(index)}
                style={({ pressed }) => [
                  styles.row,
                  checked && styles.rowChecked,
                  pressed && { transform: [{ scale: 0.99 }] },
                ]}
              >
                <View style={[styles.box, checked && styles.boxChecked]}>
                  {checked && <CheckIcon size={13} color={colors.onPrimary} />}
                </View>
                <Text style={styles.statement}>{statement}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 20 },
  copy: { gap: 10 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowChecked: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  box: {
    width: 24,
    height: 24,
    marginTop: 1,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  statement: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
