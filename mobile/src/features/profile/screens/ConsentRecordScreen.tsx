import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import DraftTag from '@/features/consent/components/DraftTag';
import { CONSENT_STATEMENTS, STUDY_INFO } from '@/features/consent/consentContent';
import { getConsent } from '@/features/consent/consentStore';
import { colors, fonts, radius, type } from '@/theme';

/** A read-only copy of what the participant agreed to, and when. */
export default function ConsentRecordScreen() {
  const [consent] = useState(getConsent);

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <DraftTag />
        <Text style={type.title}>Your consent</Text>
        <Text style={type.body}>
          {consent
            ? `You agreed on ${new Date(consent.agreedAt).toLocaleString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}.`
            : 'No consent has been recorded on this device.'}
        </Text>
        {consent && <Text style={type.caption}>Consent version: {consent.version}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>You confirmed that</Text>
        {CONSENT_STATEMENTS.map((statement) => (
          <View key={statement} style={styles.row}>
            <View style={styles.check}>
              <CheckIcon size={12} color={colors.onPrimary} />
            </View>
            <Text style={styles.rowText}>{statement}</Text>
          </View>
        ))}
      </View>

      <Text style={[type.eyebrow, styles.section]}>About the study</Text>
      <View style={styles.info}>
        {STUDY_INFO.map(({ title, body }) => (
          <View key={title} style={styles.infoItem}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.rowText}>{body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 18, gap: 8 },
  card: {
    gap: 12,
    marginTop: 20,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  check: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.ink },
  section: { marginTop: 24, marginBottom: 8 },
  info: { gap: 14 },
  infoItem: { gap: 4 },
  infoTitle: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
});
