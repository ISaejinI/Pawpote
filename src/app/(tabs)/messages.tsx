import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { ConversationList, NewMatchesStrip, SearchField, TabPage } from '@/components/ui'
import { MOCK_CONVERSATIONS, MOCK_NEW_MATCHES } from '@/data/mock-messages'
import { colors, spacing, typography } from '@/theme'

/** Onglet Messages : nouveaux matchs à saluer et discussions en cours (données fictives). */
export default function MessagesScreen() {
  const [query, setQuery] = useState('')

  const search = query.trim().toLocaleLowerCase('fr')
  const conversations = search
    ? MOCK_CONVERSATIONS.filter(({ dogName, ownerName }) =>
        `${dogName} ${ownerName}`.toLocaleLowerCase('fr').includes(search),
      )
    : MOCK_CONVERSATIONS

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

      {!search && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Nouveaux matchs <Text style={styles.sectionHint}>· dis bonjour !</Text>
          </Text>
          <NewMatchesStrip
            matches={MOCK_NEW_MATCHES}
            onPressMatch={() => openConversation(MOCK_CONVERSATIONS[0].id)}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Discussions
        </Text>
        <ConversationList
          conversations={conversations}
          onPressConversation={openConversation}
          emptyText="Aucune discussion ne correspond à ta recherche."
        />
      </View>
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
})
