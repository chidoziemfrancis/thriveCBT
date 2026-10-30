import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Icon3D from '@/components/icons/Icon3D';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { type } from '@/theme';

const TITLES = { terms: 'Terms of use', privacy: 'Privacy policy' } as const;

// The study's legal documents come from the research team and its ethics approval.
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc?: keyof typeof TITLES }>();
  const title = TITLES[doc ?? 'terms'] ?? TITLES.terms;

  return (
    <Screen>
      <BackButton />
      <Text style={[type.title, styles.title]}>{title}</Text>
      <View style={styles.body}>
        <Icon3D name="fileText" size={80} />
        <Text style={[type.body, styles.center]}>
          The final {title.toLowerCase()} will be added here before the study starts.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 18 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  center: { textAlign: 'center', maxWidth: 300 },
});
