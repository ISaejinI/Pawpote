import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  Button,
  DogRow,
  MenuRow,
  MenuSection,
  ProfileSummaryCard,
  TabPage,
} from '@/components/ui';
import { dogDetails, MOCK_OWNER, MOCK_PARK_COUNT, MOCK_PROFILE_DOGS } from '@/data/mock-profile';
import { authClient } from '@/lib/auth-client';
import { colors, shadows, typography } from '@/theme';

/**
 * Onglet Profil : aperçu, mes chiens, mon profil, paramètres et sécurité.
 * Les chiens et les parcs sont fictifs ; le prénom, l'e-mail et la déconnexion sont réels.
 */
export default function ProfileScreen() {
  const { data: session } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const firstName = session?.user.name.trim().split(/\s+/)[0] || MOCK_OWNER.firstName;
  const owner = { ...MOCK_OWNER, firstName };
  const dogs = MOCK_PROFILE_DOGS;

  async function handleSignOut() {
    if (loading) return;

    setLoading(true);
    setSignOutError('');

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setSignOutError(result.error.message ?? 'Impossible de se déconnecter.');
      }
    } catch (error) {
      console.error('Better Auth sign-out error:', error);
      setSignOutError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <TabPage title="Mon profil">
      <ProfileSummaryCard
        owner={owner}
        dogs={dogs.map((dog) => ({ ...dog, details: dogDetails(dog) }))}
      />

      <MenuSection title="Mes chiens">
        {dogs.map((dog) => (
          <DogRow
            key={dog.id}
            name={dog.name}
            details={dogDetails(dog)}
            photoUri={dog.photoUri}
            color={dog.color}
            completion={dog.completion}
          />
        ))}
        <MenuRow icon="plus" iconColor="lime" title="Ajouter un chien" />
      </MenuSection>

      <MenuSection title="Mon profil">
        <MenuRow
          icon="user"
          iconColor="lavender"
          title="Infos personnelles"
          subtitle="Nom, prénom, date de naissance, photo"
        />
        <MenuRow icon="pin" iconColor="pink" title="Adresse" subtitle="Pour calculer les distances" />
        <MenuRow
          icon="park"
          iconColor="lime"
          title="Mes parcs"
          subtitle={`${MOCK_PARK_COUNT} parc${MOCK_PARK_COUNT > 1 ? 's' : ''} ajouté${MOCK_PARK_COUNT > 1 ? 's' : ''}`}
        />
      </MenuSection>

      <MenuSection title="Paramètres">
        <MenuRow icon="bell" iconColor="peach" title="Notifications" />
        <MenuRow icon="eye" iconColor="pink" title="Confidentialité" />
        <MenuRow icon="help" iconColor="lime" title="Aide et contact" />
      </MenuSection>

      <MenuSection title="Sécurité">
        <MenuRow
          icon="mail"
          iconColor="lavender"
          title="Adresse e-mail"
          subtitle={session?.user.email}
        />
        <MenuRow icon="key" iconColor="lime" title="Mot de passe" />
        <MenuRow icon="trash" iconColor="pink" title="Supprimer mon compte" danger />
      </MenuSection>

      <Button
        variant="secondary"
        background="cream"
        icon="log-out"
        onPress={handleSignOut}
        loading={loading}
        style={styles.signOut}
      >
        Se déconnecter
      </Button>

      {signOutError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {signOutError}
        </Text>
      ) : null}
    </TabPage>
  );
}

const styles = StyleSheet.create({
  signOut: {
    ...shadows.md,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
});
