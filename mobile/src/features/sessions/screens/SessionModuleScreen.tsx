import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import StepHeader from '@/components/ui/StepHeader';
import { addJournalEntry } from '@/features/journal/journalStore';
import { sessionContent } from '@/features/sessions/content';
import JournalModule from '@/features/sessions/modules/JournalModule';
import LessonModule from '@/features/sessions/modules/LessonModule';
import QuizModule from '@/features/sessions/modules/QuizModule';
import RatingsModule from '@/features/sessions/modules/RatingsModule';
import {
  completeModule,
  saveQuizAnswers,
  saveRatings,
  useSessionProgress,
} from '@/features/sessions/progressStore';
import { nextModuleId } from '@/features/sessions/sessionLogic';
import { haptics } from '@/lib/haptics';
import { type } from '@/theme';

export default function SessionModuleScreen() {
  const { id, module: moduleId } = useLocalSearchParams<{ id: string; module: string }>();
  const sessionId = Number(id);
  const content = sessionContent(sessionId);
  const progress = useSessionProgress();
  const [initialRatings] = useState(() => progress[sessionId]?.ratings);

  const index = content?.modules.findIndex((m) => m.id === moduleId) ?? -1;
  if (!content || index < 0) return <Redirect href={`/session/${id}`} />;
  const module = content.modules[index];

  function finish() {
    if (!content) return;
    completeModule(sessionId, module.id);
    haptics.success();
    // This render's progress predates completeModule, so count this module as done here.
    const next = nextModuleId(content, {
      ...progress[sessionId],
      done: [...(progress[sessionId]?.done ?? []), module.id],
    });
    router.replace(next ? `/session/${sessionId}/${next}` : `/session/${sessionId}/complete`);
  }

  return (
    <Screen>
      <StepHeader step={index + 1} totalSteps={content.modules.length} label="Part" />

      <View style={styles.body}>
        <Text style={type.eyebrow}>
          Part {index + 1} · {module.minutes} min
        </Text>
        {module.kind !== 'journal' && <Text style={type.title}>{module.title}</Text>}

        {module.kind === 'lesson' && <LessonModule cards={module.cards} onComplete={finish} />}
        {module.kind === 'ratings' && (
          <RatingsModule
            intro={module.intro}
            items={module.items}
            initial={initialRatings}
            onComplete={(ratings) => {
              saveRatings(sessionId, ratings);
              finish();
            }}
          />
        )}
        {module.kind === 'quiz' && (
          <QuizModule
            intro={module.intro}
            questions={module.questions}
            onComplete={(answers) => {
              saveQuizAnswers(sessionId, answers);
              finish();
            }}
          />
        )}
        {module.kind === 'journal' && (
          <JournalModule
            prompt={module.prompt}
            hint={module.hint}
            onComplete={(text) => {
              addJournalEntry({ prompt: module.prompt, text, sessionId });
              finish();
            }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, marginTop: 22, gap: 12 },
});
