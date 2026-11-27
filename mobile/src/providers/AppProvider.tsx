import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import QueryProvider from './QueryProvider';

/** Everything the whole app sits inside. */
export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>{children}</QueryProvider>
    </GestureHandlerRootView>
  );
}
