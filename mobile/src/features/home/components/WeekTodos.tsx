import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { colors, fonts, radius } from '@/theme';

export type Todo = { label: string; done: boolean };

export default function WeekTodos({ todos }: { todos: Todo[] }) {
  const doneCount = todos.filter((todo) => todo.done).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>This week</Text>
        <Text style={styles.meta}>
          {doneCount} of {todos.length}
        </Text>
      </View>
      {todos.map(({ label, done }) => (
        <View
          key={label}
          style={styles.row}
          accessibilityLabel={`${label}, ${done ? 'done' : 'to do'}`}
        >
          <View style={[styles.dot, done && styles.dotDone]}>
            {done && <CheckIcon size={12} color={colors.onPrimary} />}
          </View>
          <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { borderColor: colors.primary, backgroundColor: colors.primary },
  label: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  labelDone: { color: colors.inkFaint, textDecorationLine: 'line-through' },
});
