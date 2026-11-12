import type { SessionStep, StepAnswer } from '@/features/sessions/content/types';

import BalancedStepView from './BalancedStepView';
import BreatheStepView from './BreatheStepView';
import ChecklistStepView from './ChecklistStepView';
import ChoiceStepView from './ChoiceStepView';
import CompareStepView from './CompareStepView';
import EmotionStepView from './EmotionStepView';
import EvidenceStepView from './EvidenceStepView';
import FieldsStepView from './FieldsStepView';
import InfoStepView from './InfoStepView';
import JournalStepView from './JournalStepView';
import MythFactStepView from './MythFactStepView';
import PromptStepView from './PromptStepView';
import RateStepView from './RateStepView';
import RecapStepView from './RecapStepView';
import RevealStepView from './RevealStepView';
import ScaleStepView from './ScaleStepView';
import SortStepView from './SortStepView';
import TrapsStepView from './TrapsStepView';
import TriangleStepView from './TriangleStepView';
import VideoStepView from './VideoStepView';

/**
 * Draws any step, so a session and the flows outside sessions (thought records, challenges)
 * show the same screens. `steps` and `answers` are the whole part, for steps that look back.
 */
export default function StepBody({
  step,
  steps,
  answers,
  onAnswer,
  onScale,
}: {
  step: SessionStep;
  steps: SessionStep[];
  answers: Record<string, StepAnswer>;
  onAnswer: (value: StepAnswer) => void;
  /** Scales can move on by themselves; without this they just record the answer. */
  onScale?: (value: number) => void;
}) {
  const answer = answers[step.id];
  const list = Array.isArray(answer) ? (answer as string[]) : [];
  const text = typeof answer === 'string' ? answer : '';
  const number = typeof answer === 'number' ? answer : undefined;

  switch (step.kind) {
    case 'info':
      return <InfoStepView step={step} />;
    case 'video':
      return <VideoStepView step={step} />;
    case 'reveal':
      return <RevealStepView step={step} revealed={list} onReveal={onAnswer} />;
    case 'checklist':
      return (
        <ChecklistStepView
          step={step}
          picked={Array.isArray(answer) ? (answer as number[]) : []}
          onPick={onAnswer}
        />
      );
    case 'mythFact':
      return (
        <MythFactStepView
          step={step}
          answer={typeof answer === 'boolean' ? answer : undefined}
          onAnswer={onAnswer}
        />
      );
    case 'choice':
      return <ChoiceStepView step={step} answer={number} onAnswer={onAnswer} />;
    case 'scale':
      return <ScaleStepView step={step} answer={number} onAnswer={onScale ?? onAnswer} />;
    case 'triangle':
      return <TriangleStepView step={step} answer={list} onAnswer={onAnswer} />;
    case 'sort':
      return <SortStepView step={step} answer={list} onAnswer={onAnswer} />;
    case 'emotion':
      return <EmotionStepView step={step} answer={list} onAnswer={onAnswer} />;
    case 'traps':
      return <TrapsStepView step={step} answer={list} onAnswer={onAnswer} />;
    case 'prompt':
      return <PromptStepView step={step} text={text} onChange={onAnswer} />;
    case 'evidence':
      return <EvidenceStepView step={step} answer={list} onAnswer={onAnswer} />;
    case 'rate': {
      const quoted = step.quote ? answers[step.quote] : undefined;
      const quote = Array.isArray(quoted) ? (quoted[0] as string) : undefined;
      return <RateStepView step={step} answer={number} quote={quote} onAnswer={onAnswer} />;
    }
    case 'fields':
      return <FieldsStepView step={step} answer={list} onAnswer={onAnswer} />;
    case 'balanced':
      return (
        <BalancedStepView
          step={step}
          answer={list}
          evidence={answers[step.evidence]}
          onAnswer={onAnswer}
        />
      );
    case 'recap':
      return <RecapStepView step={step} steps={steps} answers={answers} />;
    case 'compare':
      return <CompareStepView step={step} done={answer === true} onDone={() => onAnswer(true)} />;
    case 'breathe':
      return <BreatheStepView step={step} done={answer === true} onDone={() => onAnswer(true)} />;
    case 'journal':
      return <JournalStepView step={step} text={text} onChange={onAnswer} />;
  }
}
