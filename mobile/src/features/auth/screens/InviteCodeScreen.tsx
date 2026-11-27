import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { MIN_CODE_LENGTH, useInviteCode } from '@/features/assignment';
import { getUserSession, setUserSession } from '@/features/auth/store/userSession';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function InviteCodeScreen() {
  const [code, setCode] = useState(() => getUserSession().inviteCode ?? '');
  const lookup = useInviteCode(code);
  const match = lookup.data;
  const typedEnough = code.replace(/\s/g, '').length >= MIN_CODE_LENGTH;
  const unknown = typedEnough && lookup.error?.code === 'ASSIGNMENT_CODE_NOT_FOUND';
  const failed = typedEnough && lookup.error && !unknown ? lookup.error.message : null;

  useEffect(() => {
    if (match) haptics.success();
  }, [match]);

  function handleChange(value: string) {
    setCode(value.toUpperCase());
  }

  function goOn(inviteCode: string | undefined) {
    setUserSession({ inviteCode });
    router.push('/consent/study-info');
  }

  return (
    <Screen
      footer={
        <>
          <Button
            disabled={!match}
            loading={lookup.isFetching}
            onPress={() => goOn(code.replace(/\s/g, ''))}
          >
            Continue
          </Button>
          <Button variant="ghost" onPress={() => goOn(undefined)}>
            I don’t have one
          </Button>
        </>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <Text style={type.title}>Do you have an invite code?</Text>
        <Text style={type.body}>
          If a researcher gave you a code, enter it to be matched with them. If not, we’ll match you
          with someone on the team.
        </Text>

        <View style={styles.field}>
          <TextField
            label="Invite code"
            value={code}
            onChangeText={handleChange}
            placeholder="e.g. GRACE1"
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            maxLength={12}
            returnKeyType="done"
            onSubmitEditing={() => match && goOn(code.replace(/\s/g, ''))}
            style={[styles.input, unknown && styles.inputError]}
          />
        </View>

        {match && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.matched}>
            <View style={styles.tick}>
              <CheckIcon size={11} color={colors.onPrimary} />
            </View>
            <Text style={styles.matchedText} accessibilityLiveRegion="polite">
              You’ll be matched with {match.name}
            </Text>
          </Animated.View>
        )}
        {unknown && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            We couldn’t find that code. Check it with the researcher who sent it.
          </Text>
        )}
        {failed && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {failed}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 16, gap: 8 },
  field: { marginTop: 20 },
  input: { fontFamily: fonts.bold, letterSpacing: 3 },
  inputError: { borderColor: colors.danger },
  matched: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  tick: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  matchedText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  error: { marginTop: 6, fontFamily: fonts.medium, fontSize: 14, color: colors.danger },
});
