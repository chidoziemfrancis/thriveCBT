import { StyleSheet, Text, View } from 'react-native';

import Mascot from '@/components/mascot/Mascot';
import Screen from '@/components/ui/Screen';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { type } from '@/theme';

export default function HomeScreen() {
  const name = getOnboardingData().name;

  return (
    <Screen>
      <View style={styles.body}>
        <Mascot size={120} />
        <Text style={[type.title, styles.text]}>Hi{name ? `, ${name}` : ''}!</Text>
        <Text style={[type.body, styles.text]}>Your home screen is coming next.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  text: { textAlign: 'center' },
});
