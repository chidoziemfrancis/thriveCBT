import { Text, View } from 'react-native';

import RelaxPlayer from '@/features/coping/components/RelaxPlayer';
import type { RelaxStep } from '@/features/sessions/content/types';

import { stepText } from './stepText';

export default function RelaxStepView({
  step,
  done,
  onDone,
}: {
  step: RelaxStep;
  done: boolean;
  onDone: () => void;
}) {
  return (
    <View style={stepText.center}>
      <View style={stepText.block}>
        <Text style={[stepText.title, stepText.centered]}>{step.title}</Text>
        <Text style={[stepText.body, stepText.centered]}>{step.body}</Text>
      </View>
      <RelaxPlayer exercise={step.exercise} done={done} onDone={onDone} />
    </View>
  );
}
