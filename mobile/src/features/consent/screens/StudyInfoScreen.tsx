import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import SpeechBubble from '@/components/mascot/SpeechBubble';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import DraftTag from '@/features/consent/components/DraftTag';
import { STUDY_INFO } from '@/features/consent/consentContent';
import { colors, fonts, radius, type } from '@/theme';

export default function StudyInfoScreen() {
  return (
    <Screen footer={<Button onPress={() => router.push('/consent/agree')}>I’ve read this</Button>}>
      <BackButton />

      <View style={styles.body}>
        <SpeechBubble>
          Before we start, here’s what you’re signing up for. No fine print.
        </SpeechBubble>

        <View style={styles.copy}>
          <DraftTag />
          <Text style={type.title}>About the study</Text>
        </View>

        <View style={styles.cards}>
          {STUDY_INFO.map(({ title, body }, index) => (
            <Animated.View
              key={title}
              entering={FadeInDown.delay(60 * index).duration(350)}
              style={styles.card}
            >
              <View style={styles.number}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardBody}>{body}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 20 },
  copy: { gap: 10 },
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  number: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontFamily: fonts.heavy, fontSize: 14, color: colors.mintInk },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  cardBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.inkMuted },
});
