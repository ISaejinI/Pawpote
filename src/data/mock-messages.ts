import { colors } from '@/theme';

/**
 * Données fictives de la messagerie, reprises de la maquette.
 * À remplacer par l'API quand la messagerie sera branchée.
 */

export type MockNewMatch = {
  id: string;
  dogName: string;
  /** Fond de l'avatar sans photo. */
  color: string;
  /** Match tout juste arrivé : anneau mandarin autour de l'avatar. */
  isNew?: boolean;
};

export type MockConversation = {
  id: string;
  dogName: string;
  ownerName: string;
  color: string;
  ownerColor: string;
  /** Distance affichée dans l'en-tête de la conversation. */
  distance: string;
  time: string;
  lastMessage: string;
  unread: number;
  /** Le dernier message est le mien et a été lu. */
  lastMessageRead?: boolean;
};

export type MockMessage =
  | { id: string; kind: 'date'; label: string }
  | { id: string; kind: 'match'; ownDog: string; otherDog: string }
  | { id: string; kind: 'text'; from: 'me' | 'them'; text: string; time: string; read?: boolean }
  | {
      id: string;
      kind: 'walk';
      from: 'me' | 'them';
      date: string;
      place: string;
      duration: string;
    };

export const MOCK_NEW_MATCHES: MockNewMatch[] = [
  { id: 'choupette', dogName: 'Choupette', color: colors.pink300, isNew: true },
  { id: 'rocky', dogName: 'Rocky', color: colors.lime500 },
  { id: 'lune', dogName: 'Lune', color: colors.lavender200 },
  { id: 'filou', dogName: 'Filou', color: colors.peach300 },
  { id: 'praline', dogName: 'Praline', color: colors.pink300 },
];

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'pistou',
    dogName: 'Pistou',
    ownerName: 'Léa',
    color: colors.peach300,
    ownerColor: colors.lime500,
    distance: 'à 800 m',
    time: '10:08',
    lastMessage: 'Top, à samedi !',
    unread: 0,
    lastMessageRead: true,
  },
  {
    id: 'moka',
    dogName: 'Moka',
    ownerName: 'Hugo',
    color: colors.lavender200,
    ownerColor: colors.pink300,
    distance: 'à 1,2 km',
    time: '09:41',
    lastMessage: 'Moka a encore volé une chaussette…',
    unread: 2,
  },
  {
    id: 'nala',
    dogName: 'Nala',
    ownerName: 'Inès',
    color: colors.lime500,
    ownerColor: colors.peach300,
    distance: 'à 2 km',
    time: 'Hier',
    lastMessage: 'On peut décaler à 18 h ?',
    unread: 1,
  },
  {
    id: 'gaston',
    dogName: 'Gaston',
    ownerName: 'Paul',
    color: colors.pink300,
    ownerColor: colors.lavender200,
    distance: 'à 3,5 km',
    time: 'Hier',
    lastMessage: 'Proposition de balade · dim. 30 nov.',
    unread: 0,
  },
  {
    id: 'ziggy',
    dogName: 'Ziggy',
    ownerName: 'Sarah',
    color: colors.peach300,
    ownerColor: colors.lime500,
    distance: 'à 600 m',
    time: 'Lun.',
    lastMessage: 'Merci pour la balade, à bientôt !',
    unread: 0,
  },
];

/** Nom de mon chien, affiché dans le sticker du match. */
export const MOCK_OWN_DOG = 'Biscotte';

/** Même fil pour toutes les conversations tant que rien n'est branché. */
export function mockMessages(conversation: MockConversation): MockMessage[] {
  return [
    { id: 'm0', kind: 'date', label: 'Aujourd’hui' },
    { id: 'm1', kind: 'match', ownDog: MOCK_OWN_DOG, otherDog: conversation.dogName },
    {
      id: 'm2',
      kind: 'text',
      from: 'them',
      text: `Coucou ! ${conversation.dogName} a adoré le profil de ${MOCK_OWN_DOG}, on dirait qu’il a trouvé sa copine de jeu de balle.`,
      time: '10:02',
    },
    {
      id: 'm3',
      kind: 'text',
      from: 'me',
      text: `Haha, ${MOCK_OWN_DOG} est partante ! Vous allez souvent au parc des Berges ?`,
      time: '10:05',
      read: true,
    },
    {
      id: 'm4',
      kind: 'text',
      from: 'them',
      text: 'Tous les matins vers 9 h. On s’y retrouve samedi ?',
      time: '10:06',
    },
    {
      id: 'm5',
      kind: 'walk',
      from: 'them',
      date: 'Samedi 29 nov. · 9 h 30',
      place: 'Parc des Berges',
      duration: 'Environ 1 h',
    },
    { id: 'm6', kind: 'text', from: 'me', text: 'Top, à samedi !', time: '10:08', read: true },
  ];
}

export function findMockConversation(id: string | undefined) {
  return MOCK_CONVERSATIONS.find((conversation) => conversation.id === id) ?? MOCK_CONVERSATIONS[0];
}
