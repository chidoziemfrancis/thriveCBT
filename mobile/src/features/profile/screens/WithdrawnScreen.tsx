import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { type } from '@/theme';

export default function WithdrawnScreen() {
  return (
    <Screen
      footer={
        <>
          <Button variant="secondary" onPress={() => router.push('/support')}>
            Support contacts
          </Button>
          <Button variant="ghost" onPress={() => router.replace('/')}>
            Close
          </Button>
        </>
      }
    >
      <View style={styles.body}>
        <Mascot size={120} mood="calm" />
        <Text style={[type.title, styles.center]}>You’ve left the study</Text>
        <Text style={[type.body, styles.center]}>
          Thank you for taking part. Looking after yourself matters, and support is still there
          whenever you need it.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  center: { textAlign: 'center' },
});
