import { Tabs } from 'expo-router';

import { HomeIcon, JournalIcon, ProgressIcon, SessionsIcon } from '@/components/icons';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 2,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
      screenListeners={{ tabPress: () => haptics.tick() }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="sessions"
        options={{ title: 'Sessions', tabBarIcon: ({ color }) => <SessionsIcon color={color} /> }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Journal', tabBarIcon: ({ color }) => <JournalIcon color={color} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color }) => <ProgressIcon color={color} /> }}
      />
    </Tabs>
  );
}
