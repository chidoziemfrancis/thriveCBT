import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { getOnboardingData, setOnboardingData } from '@/features/onboarding/onboardingStore';
import { haptics } from '@/lib/haptics';
import { type } from '@/theme';

export default function EditNameScreen() {
  const [original] = useState(() => getOnboardingData().name ?? '');
  const [name, setName] = useState(original);
  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== original;

  function save() {
    if (!canSave) return;
    setOnboardingData({ name: trimmed });
    haptics.success();
    router.back();
  }

  return (
    <Screen
      footer={
        <Button disabled={!canSave} onPress={save}>
          Save
        </Button>
      }
    >
      <BackButton />
      <View style={styles.body}>
        <Text style={type.title}>Your name</Text>
        <Text style={type.body}>
          What should we call you? A first name or nickname is fine. Only you and your researcher
          see it.
        </Text>
        <TextField
          label="First name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 16 },
});
