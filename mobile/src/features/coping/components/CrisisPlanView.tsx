import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PhoneIcon } from '@/components/icons';
import { type CrisisPlan, HELPLINES, SAFETY_SECTIONS, readContact } from '@/features/coping/coping';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

function Contact({ name, phone }: { name: string; phone?: string }) {
  return (
    <View style={styles.contact}>
      <Text style={styles.item}>{name}</Text>
      {phone && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${name}, ${phone}`}
          onPress={() => {
            haptics.tap();
            Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {});
          }}
          style={({ pressed }) => [styles.call, pressed && { opacity: 0.7 }]}
        >
          <PhoneIcon size={14} color={colors.onPrimary} />
          <Text style={styles.callText}>Call</Text>
        </Pressable>
      )}
    </View>
  );
}

/** The six steps of the plan, numbered, with a Call button on every contact that has a number. */
export default function CrisisPlanView({ plan }: { plan: CrisisPlan }) {
  return (
    <View>
      {SAFETY_SECTIONS.map((section, i) => {
        const items = plan[section.id] ?? [];
        const contacts = section.id === 'people' || section.id === 'pros';
        return (
          <View key={section.id} style={[styles.section, i > 0 && styles.divider]}>
            <View style={styles.number}>
              <Text style={styles.numberText}>{i + 1}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{section.title}</Text>
              {section.id === 'pros' &&
                HELPLINES.map((h) => <Contact key={h.name} name={h.name} phone={h.phone} />)}
              {items.map((item) =>
                contacts ? (
                  <Contact key={item} {...readContact(item)} />
                ) : (
                  <Text key={item} style={styles.item}>
                    {item}
                  </Text>
                )
              )}
              {items.length === 0 && section.id !== 'pros' && (
                <Text style={styles.empty}>Nothing added yet</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  number: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.lavenderInk },
  body: { flex: 1, gap: 6 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  item: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  empty: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  call: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  callText: { fontFamily: fonts.bold, fontSize: 13, color: colors.onPrimary },
});
