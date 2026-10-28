import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export default function Screen({
  children,
  footer,
  background = colors.background,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  background?: string;
}) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, gap: 12 },
});
