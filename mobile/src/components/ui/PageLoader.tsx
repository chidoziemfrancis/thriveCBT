import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

import Spinner from './Spinner';

/** Only for when there's nothing to show yet and no known layout; otherwise use skeletons. */
export default function PageLoader({ message }: { message?: string }) {
  return (
    <View style={styles.page}>
      <Spinner size="large" label={message ?? 'Loading'} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  message: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted, textAlign: 'center' },
});
