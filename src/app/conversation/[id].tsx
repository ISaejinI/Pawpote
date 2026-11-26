import { randomUUID } from 'expo-crypto'
import { router, useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { WalkSheet } from '@/components/messaging/walk-sheet'
import {
  Badge, Button, ConversationHeader, ConversationPage, MatchBanner, MessageBubble, MessageComposer, WalkProposalCard,
} from '@/components/ui'
import { getChatThread, respondToWalk, sendChatMessage } from '@/lib/messaging-api'
import { formatChatDate, readChatTimestamp } from '@/lib/message-dates'
import { useChatQuery } from '@/lib/use-chat-query'
import { colors, spacing, typography } from '@/theme'
import type { ChatMessage, ChatThread, WalkDraft } from '../../../shared/messaging'

const dayFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' })
const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function mergeThread(previous: ChatThread | undefined, latest: ChatThread): ChatThread {
  if (!previous) return latest
  const messages = new Map(previous.messages.map((message) => [message.id, message]))
  for (const message of latest.messages) messages.set(message.id, message)
  return { ...latest, messages: [...messages.values()], olderCursor: previous.olderCursor }
}

function goBack() {
  if (router.canGoBack()) router.back()
  else router.replace('/messages')
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <Thread key={id} id={id} />
}

function Thread({ id }: { id: string }) {
  const load = useCallback((signal: AbortSignal) => getChatThread(id, signal), [id])
  const { data, error, refresh } = useChatQuery(load, mergeThread)
  const [history, setHistory] = useState<{ messages: ChatMessage[]; cursor: string | null }>()
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [actionError, setActionError] = useState('')
  const [responding, setResponding] = useState(false)
  const [sheet, setSheet] = useState<{ key: number; visible: boolean; alternative?: ChatMessage }>()
  const pendingText = useRef<{ body: string; id: string } | undefined>(undefined)
  const pendingWalkId = useRef<string | undefined>(undefined)
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(clock)
  }, [])

  if (!data) return (
    <View style={styles.center}>
      {error ? (
        <>
          <Text style={styles.notice} accessibilityRole="alert">
            {error instanceof Error && error.cause === 404
              ? 'Cette conversation est introuvable.' : 'Impossible de charger la conversation.'}
          </Text>
          <Button variant="secondary" onPress={refresh}>Réessayer</Button>
          <Button variant="secondary" onPress={goBack}>Retour aux messages</Button>
        </>
      ) : <ActivityIndicator accessibilityLabel="Chargement de la conversation" color={colors.active} />}
    </View>
  )

  const { match } = data
  const cursor = history ? history.cursor : data.olderCursor
  const combined = [...new Map([
    ...(history?.messages ?? []), ...data.messages,
  ].map((message) => [message.id, message])).values()]

  function openWalk(alternative?: ChatMessage) {
    pendingWalkId.current = randomUUID()
    setSheet((current) => ({ key: (current?.key ?? 0) + 1, visible: true, alternative }))
  }

  function closeWalk() {
    setSheet((current) => current && { ...current, visible: false })
  }

  async function sendText(body: string) {
    const outgoing = pendingText.current?.body === body ? pendingText.current : { body, id: randomUUID() }
    pendingText.current = outgoing
    await sendChatMessage(id, { kind: 'text', ...outgoing })
    pendingText.current = undefined
    refresh()
  }

  async function sendWalk(walk: WalkDraft) {
    if (sheet?.alternative) {
      await respondToWalk(id, sheet.alternative.id, { action: 'reschedule', ...walk })
      updateHistoricalWalk(sheet.alternative.id, 'superseded')
    } else {
      await sendChatMessage(id, { kind: 'walk', id: pendingWalkId.current ?? randomUUID(), ...walk })
    }
    closeWalk()
    refresh()
  }

  function updateHistoricalWalk(messageId: string, status: 'accepted' | 'superseded') {
    setHistory((current) => current && ({
      ...current,
      messages: current.messages.map((message) => message.id === messageId && message.walk
        ? { ...message, walk: { ...message.walk, status } } : message),
    }))
  }

  async function acceptWalk(messageId: string) {
    if (responding) return
    setResponding(true)
    setActionError('')
    try {
      await respondToWalk(id, messageId, { action: 'accept' })
      updateHistoricalWalk(messageId, 'accepted')
    } catch {
      setActionError('Impossible de confirmer la balade. Vérifie si la proposition est toujours disponible.')
    } finally {
      setResponding(false)
      refresh()
    }
  }

  async function loadOlder() {
    if (!cursor || loadingOlder) return
    setLoadingOlder(true)
    setActionError('')
    try {
      const older = await getChatThread(id, undefined, cursor)
      setHistory((current) => ({
        messages: [...older.messages, ...(current?.messages ?? [])],
        cursor: older.olderCursor,
      }))
    } catch {
      setActionError('Impossible de charger les messages précédents.')
    } finally {
      setLoadingOlder(false)
    }
  }

  return (
    <ConversationPage
      header={<ConversationHeader
        dogName={match.dogName}
        ownerName={match.ownerName}
        dogPhotoUri={match.photoUri}
        ownerPhotoUri={match.ownerPhotoUri}
        onBack={goBack}
        onProposeWalk={() => openWalk()}
      />}
      composer={<>
        {!!actionError && <Text style={styles.error} accessibilityRole="alert">{actionError}</Text>}
        <MessageComposer onSend={sendText} />
        {sheet && <WalkSheet key={sheet.key} visible={sheet.visible} onClose={closeWalk} onSubmit={sendWalk}
          initial={sheet.alternative?.walk ? {
            place: sheet.alternative.body, minutes: sheet.alternative.walk.minutes,
          } : undefined} />}
      </>}
    >
      {cursor ? (
        <Button size="sm" variant="secondary" loading={loadingOlder} onPress={() => { void loadOlder() }}>
          Voir les messages précédents
        </Button>
      ) : <MatchBanner ownDog={match.ownDog} otherDog={match.dogName} />}

      {combined.map((message, index) => {
        const day = formatChatDate(dayFormat, message.createdAt)
        const previous = combined[index - 1]
        const showDay = !!day && (!previous || formatChatDate(dayFormat, previous.createdAt) !== day)
        const from = message.own ? 'me' : 'them'
        const walk = message.walk
        const canRespond = !!walk && !message.own && walk.status === 'pending' &&
          (readChatTimestamp(walk.startsAt) ?? 0) > now && !responding
        return (
          <Fragment key={message.id}>
            {showDay && <Badge variant="date" style={styles.date}>{day}</Badge>}
            {walk ? (
              <WalkProposalCard
                from={from}
                status={walk.status}
                date={[
                  formatChatDate(dayFormat, walk.startsAt), formatChatDate(timeFormat, walk.startsAt),
                ].filter(Boolean).join(' · ') || 'Date indisponible'}
                place={message.body}
                duration={`${walk.minutes} min`}
                onAccept={canRespond ? () => { void acceptWalk(message.id) } : undefined}
                onSuggestOtherDate={canRespond ? () => openWalk(message) : undefined}
              />
            ) : <MessageBubble from={from} time={formatChatDate(timeFormat, message.createdAt)}>{message.body}</MessageBubble>}
          </Fragment>
        )
      })}
    </ConversationPage>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[4], gap: spacing[3], backgroundColor: colors.surface },
  notice: { ...typography.bodyStrong, textAlign: 'center', color: colors.text },
  error: { ...typography.small, color: colors.danger, marginBottom: spacing[2] },
  date: { alignSelf: 'center' },
})
