import { router } from 'expo-router';
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
import { MOCK_PARK_COUNT } from '@/data/mock-profile';
import { authClient } from '@/lib/auth-client';
import { dogDetails, useProfileSummary } from '@/lib/profile-api';
import { colors, shadows, typography } from '@/theme';

/** Fonds des photos manquantes, attribués aux chiens dans l'ordre. */
const DOG_COLORS = [colors.peach300, colors.lime500, colors.pink300, colors.lavender200];

/**
 * Onglet Profil : aperçu, mes chiens, mon profil, paramètres et sécurité.
 * L'aperçu, mes chiens, l'e-mail et la déconnexion sont réels ; les parcs sont fictifs.
 */
export default function ProfileScreen() {
  const { data: session } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const summary = useProfileSummary();
  // Même couleur de fond pour un chien sans photo, dans l'en-tête et dans la liste
  const dogs = (summary.data?.dogs ?? []).map((dog, index) => ({
    ...dog,
    details: dogDetails(dog),
    color: DOG_COLORS[index % DOG_COLORS.length],
  }));

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
        status={summary.data ? 'ready' : summary.error ? 'error' : 'loading'}
        onRetry={summary.retry}
        owner={{
          firstName: summary.data?.owner.firstName ?? '',
          photoUri: summary.data?.owner.photo,
          color: colors.lavender200,
        }}
        dogs={dogs.map((dog) => ({ ...dog, photoUri: dog.photo }))}
      />

      <MenuSection title="Mes chiens">
        {dogs.map((dog) => (
          <DogRow
            key={dog.id}
            name={dog.name}
            details={dog.details}
            photoUri={dog.photo}
            color={dog.color}
            completion={dog.completion}
            onPress={() => router.push({ pathname: '/my-dog/[id]', params: { id: dog.id } })}
          />
        ))}
        <MenuRow
          icon="plus"
          iconColor="lime"
          title="Ajouter un chien"
          onPress={() => router.push('/add-dog/dog')}
        />
      </MenuSection>

      <MenuSection title="Mon profil">
        <MenuRow
          icon="user"
          iconColor="lavender"
          title="Infos personnelles"
          subtitle="Nom, prénom, date de naissance, photo"
          onPress={() => router.push('/account/identity')}
        />
        <MenuRow
          icon="pin"
          iconColor="pink"
          title="Adresse"
          subtitle="Pour calculer les distances"
          onPress={() => router.push('/account/address')}
        />
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
