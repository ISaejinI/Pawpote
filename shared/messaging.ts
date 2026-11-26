export const MAX_MESSAGE_LENGTH = 1000
export const MAX_WALK_PLACE_LENGTH = 120
export const CHAT_PROTOCOL = 'pawpote-messaging'

export type WalkStatus = 'pending' | 'accepted' | 'superseded'

export type ChatMessage = {
  id: string
  own: boolean
  body: string
  createdAt: string
  walk: { startsAt: string; minutes: number; status: WalkStatus } | null
}

export type ChatMatch = {
  id: string
  ownDog: string
  dogName: string
  ownerName: string
  photoUri: string | null
  ownerPhotoUri: string | null
  createdAt: string
  lastMessage: string | null
  lastMessageAt: string | null
}

export type ChatThread = { match: ChatMatch; messages: ChatMessage[]; olderCursor: string | null }
export type WalkDraft = { startsAt: string; place: string; minutes: number }
