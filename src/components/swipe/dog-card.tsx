import { Image } from 'expo-image'
import { StyleSheet, Text, View } from 'react-native'

import type { MockDog } from '@/data/mock-dogs'

type DogCardProps = {
  dog: MockDog
}

export function DogCard({ dog }: DogCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: dog.image }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      <View style={styles.information}>
        <Text style={styles.name}>
          {dog.name}, {dog.age} ans
        </Text>

        <Text style={styles.breed}>
          {dog.breed}
        </Text>

        <Text style={styles.description}>
          {dog.description}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },

  image: {
    width: '100%',
    height: '72%',
  },

  information: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202020',
  },

  breed: {
    fontSize: 13,
    color: '#777777',
    marginTop: 2,
  },

  description: {
    fontSize: 12,
    color: '#444444',
    marginTop: 6,
  },
})