import { Link, router, useLocalSearchParams } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  Button,
  DogProfile,
  IconButton,
  PhotoCarousel,
  PullToClose,
  SwipeActions,
} from '@/components/ui'
import { announceMatches, formatDiscoveryDistance, getDogDetails, sendSwipe } from '@/lib/discovery-api'
import { setSwipeIntent, type SwipeDirection } from '@/lib/swipe-intent'
import { useDiscoveryQuery } from '@/lib/use-discovery-query'
import { borderWidth, colors, spacing, typography } from '@/theme'

const PHOTO_HEIGHT = 470
/** La feuille du profil remonte sur la photo. */
const SHEET_OVERLAP = 40
const SHEET_RADIUS = 30
const SHEET_SHADOW_OFFSET = 4
const ACTION_BAR_PADDING = 18
/** Hauteur des boutons Passer / J'aime. */
const ACTION_BUTTON_SIZE = 64

/** Détail d'un chien ouvert depuis l'écran de match : photos pleine largeur et tout son profil. */
export default function DogDetailScreen() {
  const { id, nearby } = useLocalSearchParams<{ id: string; nearby?: string }>()
  return <DogDetail key={id} id={id} nearby={nearby === '1'} />
}

function closeDetail() {
  if (router.canGoBack()) router.back()
  else router.replace('/')
}

function DogDetail({ id, nearby }: { id: string; nearby: boolean }) {
  const insets = useSafeAreaInsets()
  const load = useCallback((signal: AbortSignal) => getDogDetails(id, signal, nearby), [id, nearby])
  const { data: dog, error, retry } = useDiscoveryQuery(load)
  const saving = useRef(false)
  const [pending, setPending] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const actionBarHeight = ACTION_BAR_PADDING * 2 + ACTION_BUTTON_SIZE + insets.bottom

  if (!dog) {
    const missing = error instanceof Error && error.cause === 404
    return (
      <View style={[styles.root, styles.missing, { paddingTop: insets.top }]}>
        {error ? (
          <>
            <Text style={styles.missingText} accessibilityRole="alert">
              {missing ? 'Ce chien n’est plus disponible.' : 'Impossible de charger ce profil.'}
            </Text>
            {!missing && <Button onPress={retry}>Réessayer</Button>}
          </>
        ) : <ActivityIndicator color={colors.active} accessibilityLabel="Chargement du profil" />}
        <Button variant="secondary" onPress={closeDetail}>
          Revenir aux cartes
        </Button>
      </View>
    )
  }

  async function decide(direction: SwipeDirection) {
    if (saving.current) return
    saving.current = true
    setPending(true)
    setSaveError(false)
    try {
      const result = await sendSwipe(id, direction === 1 ? 'like' : 'dislike')
      setSwipeIntent(id, direction)
      closeDetail()
      announceMatches(result)
    } catch {
      saving.current = false
      setPending(false)
      setSaveError(true)
    }
  }

  return (
    // Tirer vers le bas depuis le haut de la page referme le profil
    <PullToClose
      onClose={closeDetail}
      style={styles.root}
      contentContainerStyle={{ paddingBottom: actionBarHeight + spacing[5] }}
      overlay={
        <View style={[styles.actionBar, { paddingBottom: ACTION_BAR_PADDING + insets.bottom }]}>
          {saveError && <Text accessibilityRole="alert">Choix non enregistré. Réessaie.</Text>}
          <SwipeActions dogName={dog.name} disabled={pending}
            onPass={() => { void decide(-1) }} onLike={() => { void decide(1) }} />
        </View>
      }
    >
      <View>
        <PhotoCarousel
          photos={dog.photos}
          height={PHOTO_HEIGHT}
          dotsOffset={SHEET_OVERLAP + 16}
          accessibilityLabel={`Photo de ${dog.name}`}
        />

        <View style={[styles.topBar, { top: insets.top + spacing[2] }]}>
          <IconButton
            icon="back"
            variant="surface"
            accessibilityLabel="Revenir à la carte"
            onPress={closeDetail}
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

      <View style={styles.sheetFrame}>
        <View pointerEvents="none" style={styles.sheetShadow} />
        <View style={styles.sheet}>
          <DogProfile
            name={dog.name}
            sex={dog.sex ?? undefined}
            age={dog.age ?? undefined}
            breed={dog.breed ?? undefined}
            distance={formatDiscoveryDistance(dog.distanceKm, dog.distanceApproximate)}
            activities={dog.activities}
            traits={dog.traits}
            favoriteToy={dog.favoriteToy ?? undefined}
            quirk={dog.quirk ?? undefined}
            description={dog.description ?? undefined}
            ownerName={dog.owner.firstName}
            ownerPhoto={dog.owner.photo}
          />
          {dog.photoCredits.map(({ file, author, license }) => (
            <Link key={file} href={file as `https://${string}`} style={styles.credit}>
              Photo : {author} · {license}
            </Link>
          ))}
        </View>
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
  sheetFrame: {
    marginTop: -(SHEET_OVERLAP + SHEET_SHADOW_OFFSET),
    paddingTop: SHEET_SHADOW_OFFSET,
  },
  sheetShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SHEET_RADIUS + SHEET_SHADOW_OFFSET,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    backgroundColor: colors.border,
  },
  sheet: {
    paddingTop: 22,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
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
  credit: { ...typography.small, color: colors.text, textDecorationLine: 'underline' },
})
