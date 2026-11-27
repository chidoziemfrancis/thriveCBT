import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import {
  ACTIVITIES,
  SLOTS,
  dayKey,
  dayName,
  predictionGap,
  toPlanned,
  weekDays,
} from '@/features/activities/activities';
import {
  addPlans,
  completeActivity,
  removeActivity,
  usePlannedActivities,
} from '@/features/activities/activityStore';
import PlanForm from '@/features/activities/components/PlanForm';
import PlanRow from '@/features/activities/components/PlanRow';
import ScoreRow from '@/features/activities/components/ScoreRow';
import WeekStrip, { type DayMark } from '@/features/activities/components/WeekStrip';
import { useSessionProgress } from '@/features/sessions/store/progressStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function range(days: Date[]) {
  const first = days[0];
  const last = days[days.length - 1];
  const month = (d: Date) => d.toLocaleDateString(undefined, { month: 'short' });
  return first.getMonth() === last.getMonth()
    ? `${first.getDate()} – ${last.getDate()} ${month(last)}`
    : `${first.getDate()} ${month(first)} – ${last.getDate()} ${month(last)}`;
}

/** The activities planned for each day: tick them off and rate how they actually felt. */
export default function MyWeekScreen() {
  const plans = usePlannedActivities();
  const progress = useSessionProgress();
  const [today] = useState(() => new Date());
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(dayKey(today));
  const [rating, setRating] = useState<{ id: string; enjoy?: number; achieve?: number } | null>(
    null
  );
  const [adding, setAdding] = useState(false);

  const days = weekDays(today, offset);
  const keys = days.map(dayKey);
  const inWeek = plans.filter((p) => keys.includes(p.date));
  const doneInWeek = inWeek.filter((p) => p.doneAt).length;
  const selectedDate = days.find((d) => dayKey(d) === selected) ?? days[0];
  const onDay = plans.filter((p) => p.date === selected);
  const gap = predictionGap(plans);

  const marks: Record<string, DayMark> = {};
  for (const key of keys) {
    const items = plans.filter((p) => p.date === key);
    if (items.length > 0) marks[key] = items.every((p) => p.doneAt) ? 'done' : 'planned';
  }

  const picks = progress[5]?.answers?.pick;
  const suggestions = [
    ...new Set([
      ...(Array.isArray(picks) ? (picks as string[]) : []),
      ...plans.map((p) => p.label),
    ]),
  ];

  function moveWeek(by: number) {
    haptics.tick();
    const next = offset + by;
    setOffset(next);
    setSelected(dayKey(next === 0 ? today : weekDays(today, next)[0]));
    setRating(null);
  }

  return (
    <Screen
      footer={
        <Button
          variant={adding ? 'secondary' : 'primary'}
          onPress={() => {
            setAdding((a) => !a);
            setRating(null);
          }}
        >
          {adding ? 'Close' : 'Plan an activity'}
        </Button>
      }
    >
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>My week</Text>
        <Text style={styles.meta}>
          {inWeek.length > 0
            ? `${doneInWeek} of ${inWeek.length} done ${offset === 0 ? 'this week' : 'that week'}`
            : 'Small things, planned ahead, lift your mood.'}
        </Text>
      </View>

      {gap && (
        <Animated.View entering={FadeInDown.duration(320)} style={styles.insight}>
          <Text style={styles.insightLabel}>
            Expected vs actual · {gap.count} {gap.count === 1 ? 'activity' : 'activities'}
          </Text>
          {[
            { label: 'You expected', value: gap.expected, color: colors.inkFaint },
            { label: 'It felt like', value: gap.actual, color: colors.primary },
          ].map((bar) => (
            <View key={bar.label} style={styles.bar}>
              <Text style={styles.barLabel}>{bar.label}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.max(4, bar.value * 10)}%`, backgroundColor: bar.color },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{bar.value}</Text>
            </View>
          ))}
          <Text style={styles.insightText}>
            {gap.actual > gap.expected
              ? 'Doing things felt better than you guessed. Low mood tends to underestimate.'
              : 'Not every activity lifts you, and that’s fine. Keep trying small things.'}
          </Text>
        </Animated.View>
      )}

      <View style={styles.weekNav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          hitSlop={10}
          onPress={() => moveWeek(-1)}
          style={styles.navButton}
        >
          <ChevronLeftIcon size={18} color={colors.ink} />
        </Pressable>
        <Text style={styles.weekLabel}>
          {offset === 0 ? 'This week' : offset === 1 ? 'Next week' : range(days)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next week"
          hitSlop={10}
          onPress={() => moveWeek(1)}
          style={styles.navButton}
        >
          <ChevronRightIcon size={18} color={colors.ink} />
        </Pressable>
      </View>
      <WeekStrip
        days={days}
        selected={selected}
        marks={marks}
        onSelect={(key) => {
          setSelected(key);
          setRating(null);
        }}
        today={today}
      />

      <View style={styles.day}>
        <Text style={styles.dayTitle}>{dayName(selectedDate, today)}</Text>
        {onDay.length === 0 ? (
          <Text style={styles.empty}>Nothing planned for this day.</Text>
        ) : (
          SLOTS.map((slot) => {
            const items = onDay.filter((p) => p.slot === slot.id);
            if (items.length === 0) return null;
            return (
              <View key={slot.id} style={styles.slot}>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                {items.map((item) => {
                  const open = rating?.id === item.id;
                  const meta = item.doneAt
                    ? `Enjoyed ${item.enjoy}/10 · achievement ${item.achieve}/10${item.predicted !== undefined ? ` · you guessed ${item.predicted}` : ''}`
                    : item.predicted !== undefined
                      ? `You guess ${item.predicted}/10 enjoyment`
                      : undefined;
                  return (
                    <View key={item.id}>
                      <PlanRow
                        label={item.label}
                        meta={meta}
                        done={Boolean(item.doneAt)}
                        open={open}
                        onCheck={() => {
                          setAdding(false);
                          setRating(open ? null : { id: item.id });
                        }}
                        onRemove={() => removeActivity(item.id)}
                      />
                      {open && rating && (
                        <Animated.View entering={FadeIn.duration(250)} style={styles.rate}>
                          <ScoreRow
                            label="How much did you enjoy it?"
                            value={rating.enjoy}
                            onChange={(enjoy) => setRating({ ...rating, enjoy })}
                            color={colors.butterInk}
                          />
                          <ScoreRow
                            label="How much did you get done?"
                            value={rating.achieve}
                            onChange={(achieve) => setRating({ ...rating, achieve })}
                            color={colors.mintInk}
                          />
                          <Button
                            disabled={rating.enjoy === undefined || rating.achieve === undefined}
                            onPress={() => {
                              if (rating.enjoy === undefined || rating.achieve === undefined)
                                return;
                              completeActivity(item.id, rating.enjoy, rating.achieve);
                              haptics.success();
                              setRating(null);
                            }}
                          >
                            Mark as done
                          </Button>
                        </Animated.View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </View>

      {adding && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.form}>
          <PlanForm
            suggestions={suggestions.length > 0 ? suggestions : ACTIVITIES.map((a) => a.label)}
            day={dayName(selectedDate, today)}
            onAdd={(plan) => {
              addPlans([toPlanned({ ...plan, date: selected })]);
              haptics.success();
              setAdding(false);
            }}
          />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  insight: {
    gap: 10,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.butter,
  },
  insightLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.butterInk,
  },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 92, fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  barValue: {
    width: 28,
    textAlign: 'right',
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
  },
  insightText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  navButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  day: { gap: 10, marginTop: 20 },
  dayTitle: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  empty: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkFaint },
  slot: { gap: 4, paddingTop: 4 },
  slotLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  rate: {
    gap: 14,
    marginTop: 6,
    marginBottom: 10,
    marginLeft: 38,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primarySoft,
  },
  form: { marginTop: 20 },
});
