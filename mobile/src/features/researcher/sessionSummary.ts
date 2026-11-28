import { readPlan, readRatings } from '@/features/activities/utils/activities';
import { readArrow } from '@/features/beliefs/utils/beliefs';
import { readGoal } from '@/features/wellbeing/utils/wellbeing';
import { copingCard, readTriggers, spotLabels } from '@/features/coping/utils/coping';
import {
  CHECKLIST_NONE,
  type SessionContent,
  type StepAnswer,
} from '@/features/sessions/content/types';
import { emotionLabel } from '@/features/sessions/constants/emotions';
import { trapLabels } from '@/features/sessions/constants/traps';
import {
  FLIPPED,
  type SessionRecord,
  balancedText,
  readEvidence,
  sortProgress,
} from '@/features/sessions/utils/sessionLogic';

export type SummaryLine = { label: string; value: string };

export type PartSummary = {
  id: string;
  title: string;
  done: boolean;
  lines: SummaryLine[];
  /** The student's written reflection, shown in full rather than as a line. */
  reflection?: string;
};

function shorten(text: string, max = 48) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * What a student actually did in each part of a session, in plain words, so a researcher can
 * read it like a submitted piece of work. Reading-only steps (info and video) are skipped.
 */
export function summariseSession(
  content: SessionContent,
  record: SessionRecord | undefined
): PartSummary[] {
  const answers: Record<string, StepAnswer> = record?.answers ?? {};
  return content.modules.map((module) => {
    const lines: SummaryLine[] = [];
    let reflection: string | undefined;
    let quizAnswered = 0;
    let quizRight = 0;
    let safetyFilled = 0;

    for (const step of module.steps) {
      const answer = answers[step.id];
      switch (step.kind) {
        case 'checklist': {
          if (!Array.isArray(answer)) break;
          const picks = answer as number[];
          lines.push({
            label: step.title,
            value: picks.includes(CHECKLIST_NONE)
              ? 'None of these'
              : picks
                  .map((i) => step.options[i])
                  .filter(Boolean)
                  .join(', '),
          });
          break;
        }
        case 'mythFact':
          if (typeof answer !== 'boolean') break;
          lines.push({
            label: `Myth or fact: “${shorten(step.statement)}”`,
            value: answer === step.isFact ? 'Called it right' : 'Called it wrong',
          });
          break;
        case 'reveal': {
          if (!Array.isArray(answer)) break;
          const opened = answer.length;
          lines.push({
            label: step.title,
            value:
              opened >= step.cards.length
                ? `Opened all ${step.cards.length} cards`
                : `Opened ${opened} of ${step.cards.length}`,
          });
          break;
        }
        case 'breathe':
          // Breathing can be skipped, so a finished part with no answer means it was skipped.
          if (record?.done.includes(module.id) || answer !== undefined) {
            lines.push({
              label: 'Breathing exercise',
              value: answer === true ? 'Completed' : 'Skipped',
            });
          }
          break;
        case 'scale':
          if (typeof answer === 'number') lines.push({ label: step.title, value: `${answer} / 5` });
          break;
        case 'choice':
          if (typeof answer === 'number') {
            quizAnswered += 1;
            if (answer === step.answer) quizRight += 1;
          }
          break;
        case 'journal':
          if (typeof answer === 'string' && answer.trim()) reflection = answer.trim();
          break;
        case 'triangle':
          if (Array.isArray(answer)) {
            lines.push({
              label: step.title,
              value: (answer as string[]).includes(FLIPPED)
                ? 'Followed the loop and tried a different thought'
                : 'Followed the loop',
            });
          }
          break;
        case 'sort': {
          const { scenario, placed, firstTry, done } = sortProgress(step, answer);
          if (!scenario) break;
          if (step.scenarios.length > 1)
            lines.push({ label: 'Story picked', value: scenario.label });
          lines.push({
            label: step.targets ? step.title : 'Sorted into thought, feeling, do',
            value: done
              ? `${firstTry} of ${scenario.cards.length} right first time`
              : `${placed.length} of ${scenario.cards.length} sorted`,
          });
          break;
        }
        case 'emotion': {
          const label = emotionLabel(answer);
          if (label) lines.push({ label: step.title, value: label });
          break;
        }
        case 'traps':
          if (Array.isArray(answer) && answer.length > 0) {
            lines.push({ label: step.title, value: trapLabels(answer as string[]).join(', ') });
          }
          break;
        case 'evidence': {
          const e = readEvidence(answer);
          if (!e.thought) break;
          lines.push({ label: 'Thought checked', value: e.thought });
          if (e.for.length) lines.push({ label: 'Evidence for', value: e.for.join('; ') });
          if (e.against.length)
            lines.push({ label: 'Evidence against', value: e.against.join('; ') });
          break;
        }
        case 'rate':
          if (typeof answer === 'number') lines.push({ label: step.title, value: `${answer}%` });
          break;
        case 'fields':
          if (Array.isArray(answer)) {
            step.fields.forEach((f, i) => {
              const value = ((answer as string[])[i] ?? '').trim();
              if (value) lines.push({ label: f.label, value });
            });
          }
          break;
        case 'balanced': {
          const sentence = balancedText(step.frame, answer);
          if (sentence) lines.push({ label: 'Balanced thought', value: sentence });
          break;
        }
        case 'activities':
          if (Array.isArray(answer) && answer.length > 0) {
            lines.push({ label: 'Activities picked', value: (answer as string[]).join(', ') });
          }
          break;
        case 'pleasure':
          for (const r of readRatings(answer)) {
            if (r.enjoy === undefined && r.achieve === undefined) continue;
            lines.push({
              label: r.label,
              value: `Enjoyment ${r.enjoy ?? '–'}/10 · achievement ${r.achieve ?? '–'}/10`,
            });
          }
          break;
        case 'ladder':
          if (typeof answer === 'number') {
            lines.push({
              label: 'Broke down a big task',
              value: answer >= step.rungs.length ? 'Reached the first step' : 'Started',
            });
          }
          break;
        case 'planner': {
          const plan = readPlan(answer);
          if (plan.length === 0) break;
          lines.push({
            label: `Planned ${plan.length} ${plan.length === 1 ? 'activity' : 'activities'}`,
            value: plan
              .map(
                (p) =>
                  `${p.label} (${p.date}, ${p.slot}${p.predicted !== undefined ? `, guessed ${p.predicted}/10` : ''})`
              )
              .join('; '),
          });
          break;
        }
        case 'bodyMap':
          if (Array.isArray(answer) && answer.length > 0) {
            lines.push({
              label: 'Where stress shows up',
              value: spotLabels(answer as string[]).join(', '),
            });
          }
          break;
        case 'triggers':
          for (const t of readTriggers(answer)) {
            lines.push({
              label: t.label,
              value: t.level === undefined ? 'Not rated' : `${t.level}/10`,
            });
          }
          break;
        case 'relax':
          if (record?.done.includes(module.id) || answer !== undefined) {
            lines.push({ label: step.title, value: answer === true ? 'Completed' : 'Skipped' });
          }
          break;
        case 'toolkit':
          if (Array.isArray(answer) && answer.length > 0) {
            lines.push({
              label: 'Saved to toolkit',
              value: (answer as string[]).flatMap((id) => copingCard(id)?.title ?? []).join(', '),
            });
          }
          break;
        case 'safety':
          // The plan is private to the student, so the researcher only sees that it was written.
          if (Array.isArray(answer) && answer.length > 0) safetyFilled += 1;
          break;
        case 'arrow': {
          const arrow = readArrow(answer);
          if (!arrow.thought) break;
          lines.push({ label: 'Starting thought', value: arrow.thought });
          if (arrow.levels.length)
            lines.push({ label: 'Went deeper', value: arrow.levels.join(' → ') });
          if (arrow.belief) lines.push({ label: 'Core belief', value: arrow.belief });
          break;
        }
        case 'list':
          if (Array.isArray(answer) && answer.length > 0) {
            lines.push({ label: step.title, value: (answer as string[]).join(', ') });
          }
          break;
        case 'goal': {
          const goal = readGoal(answer);
          if (!goal.goal) break;
          lines.push({ label: `Goal · ${goal.area}`, value: goal.goal });
          if (goal.steps.length) lines.push({ label: 'Steps', value: goal.steps.join('; ') });
          if (goal.date) lines.push({ label: 'First step on', value: goal.date });
          break;
        }
        case 'prompt':
          if (typeof answer === 'string' && answer.trim()) {
            lines.push({ label: step.title, value: answer.trim() });
          }
          break;
      }
    }

    if (safetyFilled > 0) {
      lines.push({
        label: 'Crisis plan',
        value: `Made a plan (${safetyFilled} of 6 parts filled)`,
      });
    }

    if (quizAnswered > 0) {
      const total = module.steps.filter((s) => s.kind === 'choice').length;
      lines.push({ label: 'Score', value: `${quizRight} of ${total} correct` });
    }

    return {
      id: module.id,
      title: module.title,
      done: record?.done.includes(module.id) ?? false,
      lines,
      reflection,
    };
  });
}
