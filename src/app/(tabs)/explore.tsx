import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SwipeDeck } from '@/components/swipe/swipe-deck'
import { mockDogs } from '@/data/mock-dogs'

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Découvrir</Text>

      <View style={styles.content}>
        <SwipeDeck dogs={mockDogs} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#202020',
    paddingTop: 20,
  },

  content: {
    flex: 1,
  },
})