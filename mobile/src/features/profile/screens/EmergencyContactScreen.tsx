import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { isValidPhone } from '@/features/profile/contactValidation';
import {
  getEmergencyContact,
  removeEmergencyContact,
  saveEmergencyContact,
} from '@/features/profile/emergencyContactStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const RELATIONSHIPS = ['Parent', 'Sibling', 'Partner', 'Friend', 'Guardian', 'Other'];

export default function EmergencyContactScreen() {
  const [existing] = useState(getEmergencyContact);
  const [name, setName] = useState(existing?.name ?? '');
  const [relationship, setRelationship] = useState(existing?.relationship ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneOk = isValidPhone(phone);
  const canSave = name.trim().length > 0 && relationship !== '' && phoneOk;

  function save() {
    if (!canSave) return;
    saveEmergencyContact({ name: name.trim(), relationship, phone: phone.trim() });
    haptics.success();
    router.back();
  }

  function confirmRemove() {
    Alert.alert('Remove emergency contact?', 'You can add one again any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeEmergencyContact();
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen
      footer={
        <>
          <Button disabled={!canSave} onPress={save}>
            {existing ? 'Save changes' : 'Save contact'}
          </Button>
          {existing && (
            <Button variant="ghost" onPress={confirmRemove}>
              Remove contact
            </Button>
          )}
        </>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.header}>
          <FeatureIcon name="phone" size={56} />
          <Text style={[type.title, styles.title]}>Emergency contact</Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            We’d only contact them if we were seriously worried about your safety and couldn’t reach
            you. They won’t be told anything else about the study.
          </Text>
        </View>

        <TextField
          label="Their name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder="e.g. Ngozi Okafor"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {RELATIONSHIPS.map((option) => {
              const selected = relationship === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    haptics.tick();
                    setRelationship(option);
                  }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && { color: colors.onPrimary }]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <TextField
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            onBlur={() => setPhoneTouched(true)}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            placeholder="e.g. +234 803 123 4567"
          />
          {phoneTouched && phone !== '' && !phoneOk && (
            <Text style={styles.error}>That doesn’t look like a phone number yet.</Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 20, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
  note: { padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  noteText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  field: { gap: 8 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
});
