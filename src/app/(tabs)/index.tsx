import { StyleSheet, View } from 'react-native'

import { SwipeDeck } from '@/components/swipe/swipe-deck'
import { TabPage } from '@/components/ui'
import { mockDogs } from '@/data/mock-dogs'

export default function MatchScreen() {
  return (
    <TabPage title="Découvrir" scroll={false}>
      <View style={styles.content}>
        <SwipeDeck dogs={mockDogs} />
      </View>
    </TabPage>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
})
