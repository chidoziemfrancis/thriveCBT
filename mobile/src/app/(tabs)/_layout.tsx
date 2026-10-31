import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon, JournalIcon, ProgressIcon, SessionsIcon } from '@/components/icons';
import ChatButton from '@/features/chat/components/ChatButton';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

// An explicit height lets the floating chat button sit a fixed distance above the bar.
const TAB_BAR_HEIGHT = 60;

export default function StudentTabsLayout() {
  const insets = useSafeAreaInsets();
  const barHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.inkFaint,
          tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
          tabBarStyle: {
            height: barHeight,
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
          name="dashboard"
          options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: 'Sessions',
            tabBarIcon: ({ color }) => <SessionsIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{ title: 'Journal', tabBarIcon: ({ color }) => <JournalIcon color={color} /> }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color }) => <ProgressIcon color={color} />,
          }}
        />
      </Tabs>
      <ChatButton bottom={barHeight + 16} />
    </View>
  );
}
