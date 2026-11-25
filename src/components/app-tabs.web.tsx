
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
} from 'expo-router/ui';
import { StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '@/theme';

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
          <Text style={styles.label}>Home</Text>
        </TabTrigger>

        <TabTrigger
          name="explore"
          href="/explore"
          style={styles.tab}
        >
          <Text style={styles.label}>Explore</Text>
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
    gap: spacing[6],
    padding: spacing[4],
    backgroundColor: colors.surface,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: spacing[5],
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
});
