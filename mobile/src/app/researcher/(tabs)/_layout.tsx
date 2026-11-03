import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon, UsersIcon } from '@/components/icons';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

// The same bar as the student side, so both halves of the app feel like one product.
const TAB_BAR_HEIGHT = 60;

export default function ResearcherTabsLayout() {
  const insets = useSafeAreaInsets();

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
    </Tabs>
  );
}
