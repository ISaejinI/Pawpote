
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
} from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.content} />

      <TabList style={styles.tabList}>
        <TabTrigger
          name="index"
          href="/"
          style={styles.tab}
        >
          <ThemedText type="smallBold">
            Home
          </ThemedText>
        </TabTrigger>

        <TabTrigger
          name="explore"
          href="/explore"
          style={styles.tab}
        >
          <ThemedText type="smallBold">
            Explore
          </ThemedText>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
