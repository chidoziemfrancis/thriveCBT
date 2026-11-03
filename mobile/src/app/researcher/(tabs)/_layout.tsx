import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatIcon, HomeIcon, UsersIcon } from '@/components/icons';
import { inboxRows } from '@/features/researcher/messagesLogic';
import { useResearcherChat } from '@/features/researcher/researcherChatStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

// The same bar as the student side, so both halves of the app feel like one product.
const TAB_BAR_HEIGHT = 60;

export default function ResearcherTabsLayout() {
  const insets = useSafeAreaInsets();
  const { students } = useResearcher();
  const chat = useResearcherChat();
  const unread = inboxRows(students, chat).reduce((sum, row) => sum + row.unread, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom || 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 2,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
      screenListeners={{ tabPress: () => haptics.tick() }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="students"
        options={{ title: 'Students', tabBarIcon: ({ color }) => <UsersIcon color={color} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <ChatIcon size={24} color={color} />,
          tabBarBadge: unread || undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            fontFamily: fonts.bold,
            fontSize: 11,
          },
        }}
      />
    </Tabs>
  );
}
