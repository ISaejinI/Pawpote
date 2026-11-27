import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { Button, ConversationList, NewMatchesStrip, SearchField, TabPage } from '@/components/ui'
import { formatChatDate } from '@/features/messaging/message-dates'
import { getChatMatches } from '@/features/messaging/api'
import { useChatQuery } from '@/features/messaging/use-chat-query'
import { colors, spacing, typography } from '@/theme'

const messageTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

export default function MessagesScreen() {
  const [query, setQuery] = useState('')
  const { data, error, refresh } = useChatQuery(getChatMatches)

  const search = query.trim().toLocaleLowerCase('fr')
  const shown = (data ?? []).filter(({ dogName, ownerName }) =>
    `${dogName} ${ownerName}`.toLocaleLowerCase('fr').includes(search),
  )
  const newMatches = shown.filter((match) => match.lastMessage === null)
  const conversations = shown.flatMap((match) => match.lastMessage !== null
    ? [{ ...match, time: formatChatDate(messageTime, match.lastMessageAt), lastMessage: match.lastMessage }]
    : [])

  function openConversation(id: string) {
    router.push({ pathname: '/conversation/[id]', params: { id } })
  }

  return (
    <TabPage title="Messages" contentStyle={styles.content}>
      <SearchField
        accessibilityLabel="Rechercher une discussion"
        placeholder="Rechercher un chien, un maître…"
        value={query}
        onChangeText={setQuery}
      />

      {!data && (error ? (
        <View style={styles.section}>
          <Text accessibilityRole="alert" style={styles.notice}>Impossible de charger tes messages.</Text>
          <Button variant="secondary" onPress={refresh}>Réessayer</Button>
        </View>
      ) : <ActivityIndicator accessibilityLabel="Chargement des messages" color={colors.active} />)}

      {data && (
        <>
          {newMatches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Nouveaux matchs <Text style={styles.sectionHint}>· dis bonjour !</Text>
              </Text>
              <NewMatchesStrip
                matches={newMatches.map((match) => ({ ...match, isNew: true }))}
                onPressMatch={openConversation}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Discussions</Text>
            <ConversationList
              conversations={conversations}
              onPressConversation={openConversation}
              emptyText={search ? 'Aucune discussion ne correspond à ta recherche.' : 'Aucune discussion pour l’instant.'}
            />
          </View>
        </>
      )}
    </TabPage>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.titleMd,
    fontSize: 20,
    lineHeight: 22,
    color: colors.text,
  },
  sectionHint: {
    ...typography.hand,
    fontSize: 18,
  },
  notice: { ...typography.body, color: colors.text },
})
