import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ChoiceButton from '@/components/ui/ChoiceButton';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { OUTCOME_LABELS, type CallOutcome, callRecord } from '@/features/researcher/callLog';
import { logCall } from '@/features/researcher/callLogStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

type Choice = CallOutcome | 'missed';

export default function CallNoteScreen() {
  const params = useLocalSearchParams<{ callId: string; seconds?: string; joined?: string }>();
  const { students, calls } = useResearcher();
  const [call] = useState(() => calls.find((c) => c.id === params.callId));
  const student = call && students.find((s) => s.id === call.studentId);
  const joined = params.joined === '1';
  const seconds = Number(params.seconds) || 0;
  const [choice, setChoice] = useState<Choice | null>(joined ? null : 'missed');
  const [note, setNote] = useState('');

  if (!call || !student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This call couldn’t be found.</Text>
      </Screen>
    );
  }

  const first = student.name.split(' ')[0];
  const minutes = Math.max(1, Math.round(seconds / 60));

  function save(attended: boolean, outcome?: CallOutcome, text?: string, then?: 'book') {
    logCall(callRecord(call!, { attended, seconds, outcome, note: text }));
    haptics.success();
    if (then === 'book') {
      router.replace({ pathname: '/researcher/schedule', params: { studentId: student!.id } });
    } else {
      router.replace({ pathname: '/researcher/student/[id]', params: { id: student!.id } });
    }
  }

  function saveChoice(then?: 'book') {
    if (!choice) return;
    if (choice === 'missed') save(false, undefined, note, then);
    else save(true, choice, note, then);
  }

  return (
    <Screen
      footer={
        <>
          <Button disabled={!choice} onPress={() => saveChoice()}>
            Save
          </Button>
          {choice === 'concerns' && (
            <Button variant="secondary" onPress={() => saveChoice('book')}>
              Save and book a follow-up
            </Button>
          )}
          <Button variant="ghost" onPress={() => save(joined)}>
            Skip
          </Button>
        </>
      }
    >
      <View style={styles.header}>
        <Text style={type.title}>How did the call go?</Text>
        <Text style={styles.meta}>
          {student.name} · {joined ? `${minutes} min` : `${first} didn’t join`}
        </Text>
      </View>

      <View style={styles.choices} accessibilityRole="radiogroup">
        {(['good', 'concerns'] as const).map((key) => (
          <ChoiceButton key={key} selected={choice === key} onPress={() => setChoice(key)}>
            {OUTCOME_LABELS[key]}
          </ChoiceButton>
        ))}
        <ChoiceButton selected={choice === 'missed'} onPress={() => setChoice('missed')}>
          Didn’t happen
        </ChoiceButton>
      </View>

      <View style={styles.note}>
        <TextField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder={`What you talked about with ${first}`}
          multiline
          textAlignVertical="top"
          maxLength={1000}
          style={styles.noteInput}
        />
        <Text style={styles.hint}>Only you and the study team can see this.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  choices: { gap: 10, marginTop: 24 },
  note: { gap: 8, marginTop: 24 },
  noteInput: { height: 120, paddingTop: 14, fontSize: 15 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
});
