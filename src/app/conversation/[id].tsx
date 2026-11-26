import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { StyleSheet } from 'react-native'

import {
  Badge,
  ConversationHeader,
  ConversationPage,
  MatchBanner,
  MessageBubble,
  MessageComposer,
  WalkProposalCard,
} from '@/components/ui'
import { findMockConversation, mockMessages, type MockMessage } from '@/data/mock-messages'

/** Une conversation entre deux maîtres (données fictives, rien n'est envoyé). */
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const conversation = findMockConversation(id)

  // Les messages envoyés s'ajoutent au fil localement, pour juger du rendu
  const [messages, setMessages] = useState(() => mockMessages(conversation))

  function send(text: string) {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages((current) => [
      ...current,
      { id: `local-${current.length}`, kind: 'text', from: 'me', text, time },
    ])
  }

  return (
    <ConversationPage
      header={
        <ConversationHeader
          dogName={conversation.dogName}
          ownerName={conversation.ownerName}
          distance={conversation.distance}
          dogColor={conversation.color}
          ownerColor={conversation.ownerColor}
          onBack={() => router.back()}
        />
      }
      composer={<MessageComposer onSend={send} />}
    >
      {messages.map((message) => (
        <ThreadItem key={message.id} message={message} />
      ))}
    </ConversationPage>
  )
}

function ThreadItem({ message }: { message: MockMessage }) {
  switch (message.kind) {
    case 'date':
      return (
        <Badge variant="date" style={styles.date}>
          {message.label}
        </Badge>
      )
    case 'match':
      return <MatchBanner ownDog={message.ownDog} otherDog={message.otherDog} />
    case 'walk':
      return (
        <WalkProposalCard
          from={message.from}
          date={message.date}
          place={message.place}
          duration={message.duration}
        />
      )
    case 'text':
      return (
        <MessageBubble from={message.from} time={message.time} read={message.read}>
          {message.text}
        </MessageBubble>
      )
  }
}

const styles = StyleSheet.create({
  date: {
    alignSelf: 'center',
  },
})
