import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { inviteLink, inviteMessage } from '@/features/researcher/invite';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const QR_SIZE = 180;

export default function InviteStudentScreen() {
  const { researcher, students } = useResearcher();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  if (!researcher) {
    return (
      <Screen>
        <BackButton />
      </Screen>
    );
  }

  const full = students.length >= researcher.capacity;
  const open = researcher.accepting && !full;
  const link = inviteLink(researcher);

  async function copy(what: 'code' | 'link') {
    await Clipboard.setStringAsync(what === 'code' ? researcher!.inviteCode : link);
    haptics.success();
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Screen
      footer={
        open ? (
          <Button onPress={() => Share.share({ message: inviteMessage(researcher) })}>
            Share invite
          </Button>
        ) : undefined
      }
    >
      <BackButton />
      <Text style={[type.title, styles.title]}>Invite a student</Text>
      <Text style={type.body}>Students who join with your code are matched with you.</Text>

      {open ? (
        <>
          <View
            style={styles.qr}
            accessible
            accessibilityLabel={`QR code for invite code ${researcher.inviteCode}`}
          >
            <QRCode
              value={link}
              size={QR_SIZE}
              color={colors.ink}
              backgroundColor={colors.surface}
            />
          </View>

          <View style={styles.codeRow}>
            <Text
              style={styles.code}
              accessibilityLabel={`Invite code ${researcher.inviteCode.split('').join(' ')}`}
            >
              {researcher.inviteCode}
            </Text>
            <CopyButton done={copied === 'code'} onPress={() => copy('code')} label="Copy code" />
          </View>

          <View style={styles.linkRow}>
            <View style={styles.linkText}>
              <Text style={styles.linkLabel}>Your link</Text>
              <Text style={styles.link} numberOfLines={1}>
                {link}
              </Text>
            </View>
            <CopyButton done={copied === 'link'} onPress={() => copy('link')} label="Copy link" />
          </View>
        </>
      ) : (
        <View style={styles.closed}>
          <Text style={styles.closedTitle}>
            {full ? 'Your caseload is full' : 'You’re not accepting new students'}
          </Text>
          <Text style={styles.closedBody}>
            {full
              ? 'Raise your caseload limit in Settings to invite more students.'
              : 'Turn on “Accepting new students” in Settings to invite students.'}
          </Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/researcher/settings')}>
            <Text style={styles.closedLink}>Open Settings</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.places}>
        {students.length} of {researcher.capacity} places used
      </Text>
    </Screen>
  );
}

function CopyButton({
  done,
  onPress,
  label,
}: {
  done: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={done ? 'Copied' : label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.copy, done && styles.copyDone, pressed && { opacity: 0.7 }]}
    >
      {done && <CheckIcon size={11} color={colors.onPrimary} />}
      <Text style={[styles.copyText, done && { color: colors.onPrimary }]}>
        {done ? 'Copied' : 'Copy'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 16, marginBottom: 6 },
  qr: {
    alignSelf: 'center',
    marginTop: 28,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 20,
  },
  code: { fontFamily: fonts.heavy, fontSize: 30, letterSpacing: 6, color: colors.ink },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  linkText: { flex: 1, gap: 2 },
  linkLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  link: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  copyDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  copyText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  closed: {
    gap: 8,
    marginTop: 28,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.butter,
  },
  closedTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  closedBody: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  closedLink: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  places: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkFaint,
  },
});
