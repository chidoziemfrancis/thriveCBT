import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChevronRightIcon, CloseIcon, SearchIcon } from '@/components/icons';
import Screen from '@/components/ui/Screen';
import MoodFace from '@/features/mood/components/MoodFace';
import type { CaseloadStudent } from '@/features/researcher/caseload';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import {
  StudentFilter,
  activeLabel,
  filterStudents,
  rowMark,
} from '@/features/researcher/studentsLogic';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function Mark({ student, now }: { student: CaseloadStudent; now: Date }) {
  const mark = rowMark(student, now);
  if (mark.kind === 'urgent') {
    return (
      <View style={styles.urgent}>
        <View style={styles.urgentDot} />
        <Text style={styles.urgentText}>Urgent</Text>
      </View>
    );
  }
  if (mark.kind === 'quiet') return <Text style={styles.quiet}>{mark.days} days quiet</Text>;
  if (mark.kind === 'mood') return <MoodFace mood={mark.mood} size={26} />;
  return null;
}

export default function StudentsScreen() {
  const { researcher, students, now } = useResearcher();
  const [filter, setFilter] = useState<StudentFilter>('all');
  const [query, setQuery] = useState('');

  const counts = {
    all: students.length,
    needs: filterStudents(students, 'needs', '', now).length,
    quiet: filterStudents(students, 'quiet', '', now).length,
  };
  const chips: { key: StudentFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'needs', label: `Needs you ${counts.needs}` },
    { key: 'quiet', label: `Quiet ${counts.quiet}` },
  ];
  const shown = filterStudents(students, filter, query, now);

  return (
    <Screen insideTabs>
      <View style={styles.header}>
        <Text style={type.title}>Students</Text>
        {researcher && (
          <Text style={styles.capacity}>
            {students.length} / {researcher.capacity}
          </Text>
        )}
      </View>

      <View style={styles.search}>
        <SearchIcon color={colors.inkFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search students"
          placeholderTextColor={colors.inkFaint}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search students"
          style={styles.searchInput}
        />
        {query !== '' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
            hitSlop={10}
          >
            <CloseIcon size={14} color={colors.inkFaint} />
          </Pressable>
        )}
      </View>

      <View style={styles.chips} accessibilityRole="tablist">
        {chips.map((chip) => {
          const on = chip.key === filter;
          return (
            <Pressable
              key={chip.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tick();
                setFilter(chip.key);
              }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {shown.length === 0 ? (
        <Text style={styles.empty}>
          {query ? 'No students match that name.' : 'Nobody here right now.'}
        </Text>
      ) : (
        <View style={styles.list}>
          {shown.map((student, i) => (
            <Pressable
              key={student.id}
              accessibilityRole="button"
              accessibilityLabel={`${student.name}, week ${student.week}, ${activeLabel(student.lastActiveAt, now)}`}
              onPress={() => {
                haptics.tick();
                router.push({ pathname: '/researcher/student/[id]', params: { id: student.id } });
              }}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            >
              <StudentAvatar id={student.id} name={student.name} size={46} />
              <View style={[styles.rowBody, i > 0 && styles.divider]}>
                <View style={styles.rowText}>
                  <Text style={styles.name}>{student.name}</Text>
                  <Text style={styles.meta}>
                    Week {student.week} · {activeLabel(student.lastActiveAt, now)}
                  </Text>
                </View>
                <Mark student={student} now={now} />
                <ChevronRightIcon size={16} color={colors.inkFaint} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  capacity: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkMuted },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  chipTextOn: { color: colors.onPrimary },
  list: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  // The line starts after the avatar, like a messaging app's list.
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  rowText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  urgentText: { fontFamily: fonts.bold, fontSize: 13, color: colors.danger },
  quiet: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  empty: { marginTop: 24, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
});
