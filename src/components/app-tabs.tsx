import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { Tapbar, TapbarTab } from '@/components/ui';
import { colors } from '@/theme';

/**
 * Navigation principale : onglets « headless » d'Expo Router,
 * rendus avec la Tapbar du design system sur toutes les plateformes.
 */
export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot />

      <TabList asChild>
        <Tapbar>
          <TabTrigger name="profile" href="/profile" asChild>
            <TapbarTab icon="tab-profile" label="Profil" />
          </TabTrigger>

          <TabTrigger name="index" href="/" asChild>
            <TapbarTab icon="tab-match" label="Match" />
          </TabTrigger>

          <TabTrigger name="messages" href="/messages" asChild>
            <TapbarTab icon="tab-messages" label="Messages" />
          </TabTrigger>
        </Tapbar>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
