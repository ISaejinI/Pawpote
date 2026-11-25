import { router, useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  Button,
  DogProfile,
  IconButton,
  PhotoCarousel,
  PullToClose,
  SwipeActions,
} from '@/components/ui'
import { findMockDog } from '@/data/mock-dogs'
import { setSwipeIntent, type SwipeDirection } from '@/lib/swipe-intent'
import { borderWidth, colors, spacing, typography } from '@/theme'

const PHOTO_HEIGHT = 470
/** La feuille du profil remonte sur la photo. */
const SHEET_OVERLAP = 40
const ACTION_BAR_PADDING = 18
/** Hauteur des boutons Passer / J'aime. */
const ACTION_BUTTON_SIZE = 64

/** Détail d'un chien ouvert depuis l'écran de match : photos pleine largeur et tout son profil. */
export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const dog = findMockDog(id)

  const actionBarHeight = ACTION_BAR_PADDING * 2 + ACTION_BUTTON_SIZE + insets.bottom

  if (!dog) {
    return (
      <View style={[styles.root, styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.missingText}>Ce chien n’est plus disponible.</Text>
        <Button variant="secondary" onPress={() => router.back()}>
          Revenir aux cartes
        </Button>
      </View>
    )
  }

  // Le choix est rejoué par la pile de swipe, qui anime la carte à son retour
  function decide(direction: SwipeDirection) {
    setSwipeIntent(dog!.id, direction)
    router.back()
  }

  return (
    // Tirer vers le bas depuis le haut de la page referme le profil
    <PullToClose
      onClose={() => router.back()}
      style={styles.root}
      contentContainerStyle={{ paddingBottom: actionBarHeight + spacing[5] }}
      overlay={
        <View style={[styles.actionBar, { paddingBottom: ACTION_BAR_PADDING + insets.bottom }]}>
          <SwipeActions dogName={dog.name} onPass={() => decide(-1)} onLike={() => decide(1)} />
        </View>
      }
    >
      <View>
        <PhotoCarousel
          photos={[dog.image, ...(dog.photos ?? [])]}
          height={PHOTO_HEIGHT}
          dotsOffset={SHEET_OVERLAP + 16}
          accessibilityLabel={`Photo de ${dog.name}`}
        />

        <View style={[styles.topBar, { top: insets.top + spacing[2] }]}>
          <IconButton
            icon="back"
            variant="surface"
            accessibilityLabel="Revenir à la carte"
            onPress={() => router.back()}
          />
          <View style={styles.titlePill}>
            <Text style={styles.title} accessibilityRole="header">
              Son profil
            </Text>
          </View>
          {/* Garde le titre centré */}
          <View style={styles.topBarSpacer} />
        </View>
      </View>

      <View style={styles.sheet}>
        <DogProfile
          name={dog.name}
          distance={dog.distance}
          sex={dog.sex}
          age={dog.age}
          breed={dog.breed}
          activities={dog.activities}
          traits={dog.traits}
          favoriteToy={dog.favoriteToy}
          quirk={dog.quirk}
          description={dog.description}
          parks={dog.parks}
          ownerName={dog.owner.firstName}
          ownerPhoto={dog.owner.photo}
        />
      </View>
    </PullToClose>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topBar: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titlePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: 999,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 17,
    lineHeight: 21,
    color: colors.text,
  },
  topBarSpacer: {
    width: 46,
  },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    paddingTop: 22,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderTopWidth: borderWidth.regular,
    borderColor: colors.border,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: ACTION_BAR_PADDING,
    backgroundColor: colors.surface,
    borderTopWidth: borderWidth.regular,
    borderColor: colors.border,
  },
  missing: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    padding: spacing[4],
  },
  missingText: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'center',
  },
})
