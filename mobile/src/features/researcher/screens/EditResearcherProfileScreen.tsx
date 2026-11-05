import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { updateSettings } from '@/features/researcher/settingsStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const BIO_MAX = 240;

export default function EditResearcherProfileScreen() {
  const { researcher } = useResearcher();
  const [name, setName] = useState(researcher?.name ?? '');
  const [bio, setBio] = useState(researcher?.bio ?? '');
  const canSave = name.trim().length > 1 && bio.trim().length > 0;

  function save() {
    updateSettings({ name: name.trim(), bio: bio.trim() });
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
      <Text style={[type.title, styles.title]}>Your profile</Text>
      <Text style={type.body}>Students see this when they’re matched with you.</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        accessibilityLabel="Name"
        style={styles.input}
      />

      <Text style={styles.label}>Bio for students</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={BIO_MAX}
        textAlignVertical="top"
        accessibilityLabel="Bio for students"
        style={[styles.input, styles.bio]}
      />
      <View style={styles.countRow}>
        <Text style={styles.hint}>A sentence or two in your own words.</Text>
        <Text style={styles.hint}>
          {bio.length} / {BIO_MAX}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 16, marginBottom: 6 },
  label: {
    marginTop: 24,
    marginBottom: 8,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  bio: { minHeight: 120, lineHeight: 23 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  hint: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
