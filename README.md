# Pawpote 🐾

### Des papattes, des potes, des balades

Projet développé par **Ethan Barlet et Lou-Anne Biet** dans le cadre de notre formation à l'ECV.

## Présentation

Pawpote est une application mobile qui permet aux propriétaires de chiens de rencontrer d'autres propriétaires et d'organiser des rencontres entre leurs compagnons.

Chaque utilisateur peut créer son profil et celui de son chien, découvrir d'autres chiens à proximité et interagir avec eux.

## Stack technique

| Technologie | Utilisation |
|---|---|
| React Native + Expo | Application mobile |
| TypeScript | Langage principal |
| Expo Router | Navigation |
| Hono | API backend |
| Neon Functions | Hébergement du backend sur la branche Neon |
| Neon PostgreSQL | Base de données |
| Drizzle ORM | Schéma et migrations SQL |
| Better Auth | Authentification |

## Prérequis

Avant de commencer, installer :

- Node.js 24 et npm, pour utiliser la même version de Node.js qu’en déploiement
- Git
- Expo Go sur un téléphone, ou un émulateur Android/iOS
- Un éditeur de code comme VS Code

Il faut également disposer des accès à la base de données Neon de développement.

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ISaejinI/Pawpote.git
cd Pawpote
```

### 2. Installer les dépendances

À la racine du projet :

```bash
npm install
```

Puis dans le backend :

```bash
cd server
npm install
cd ..
```

## Configuration locale

1. Copier [`server/.env.example`](server/.env.example) vers `server/.env` si ce fichier n’existe pas. Renseigner la chaîne poolée de la branche Neon `development`. Dans la console, ouvrir le projet Pawpote, cliquer sur **Connect**, choisir la branche, la base et le rôle de développement, puis copier la chaîne avec **Connection pooling** activé. Une chaîne directe de la même branche peut être renseignée dans `DATABASE_URL_UNPOOLED` pour Drizzle Kit.
2. Renseigner `BETTER_AUTH_SECRET` avec le secret existant de développement. Pour un environnement neuf, générer un secret avec `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Pour reprendre une configuration Wrangler locale, reporter le secret de `server/.dev.vars` dans `server/.env.local` en conservant le fichier d’origine.
3. Copier [`.env.example`](.env.example) vers `.env.local` à la racine, ou mettre à jour le fichier existant. `EXPO_PUBLIC_API_URL` doit contenir l’URL de base de l’API, sans `/api/auth`. Cette URL est publique dans le bundle Expo. Après un changement, recharger entièrement l’application.

Le backend charge `server/.env` puis `server/.env.local`. Pour les tests Web, ajouter l’origine exacte de l’application, port compris, dans `BETTER_AUTH_WEB_ORIGINS` (liste séparée par des virgules). Utiliser le même nom d’hôte pour Expo Web et l’API locale, par exemple `localhost` des deux côtés, pour que le navigateur accepte les cookies.

Expo lit `.env.development.local` en priorité pendant le développement. Ce fichier permet de pointer Expo Go vers la fonction Neon de test tout en gardant l’URL LAN dans `.env.local`.

## Lancer le projet

Dans `server/`, lancer `npm run dev`. Neon CLI charge `neon.ts` et sert l’API sur `http://localhost:8787`. Une requête sur `/` doit renvoyer `{"name":"Pawpote API","status":"ok"}`.

Pour tester sur un téléphone sur le même réseau, lancer `npm run dev:lan` à la place. Neon CLI écoute sur la boucle locale. Le script LAN sert le même handler via l’adaptateur Node de Hono. Utiliser `http://ADRESSE_IP_LOCALE:8787` dans `EXPO_PUBLIC_API_URL` et comme `BETTER_AUTH_URL` pour cette session. Sur Windows, `ipconfig` permet de trouver l’adresse IPv4. Si le port est occupé, définir `PAWPOTE_LAN_PORT` et reporter ce port dans les deux URL. On peut aussi utiliser directement l’URL HTTPS de la fonction de développement.

Dans un second terminal, lancer `npx expo start --lan` à la racine. Scanner le QR code dans Expo Go, ou appuyer sur `w` pour ouvrir Expo Web. `BETTER_AUTH_EXPO_GO=true` autorise le schéma `exp://` en développement. Les builds Pawpote utilisent `pawpote://`.

Si `.env.development.local` pointe vers Neon et que tu veux tester Expo Web avec l’API locale, lancer le backend local puis démarrer Expo Web avec l’URL locale dans le terminal.

```powershell
$env:EXPO_PUBLIC_API_URL = 'http://localhost:8787'
npx expo start --web
```

## Tests

Tout se lance depuis la racine. Les tests n’utilisent que des données créées pour l’occasion et ne touchent à aucune base Neon.

| Commande | Ce qu’elle vérifie |
| --- | --- |
| `npm run check` | Tout ce qui suit. À lancer avant d’ouvrir une PR. |
| `npm test` | Tests unitaires et de composants de l’app (Jest + React Native Testing Library). |
| `npm run test:api` | Tests d’intégration de l’API (Vitest). |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript, pour l’app et pour le serveur. |

### Tests unitaires et de composants

Ils sont placés à côté du code testé, dans des dossiers `__tests__` (`shared/`, `src/lib/`, `src/components/ui/`). Les tests d’écrans vont dans `src/__tests__/` : tout fichier placé dans `src/app/` deviendrait une route d’Expo Router.

- **Logique métier** : complétion de la fiche d’un chien, dates de naissance, coordonnées et arrondi de l’adresse, client de l’API de découverte (dont les erreurs HTTP).
- **Composants** : boutons, boutons J’aime / Passer, champ mot de passe, formulaire de connexion (champs invalides, erreur de l’API, serveur injoignable). Seul le client d’authentification est simulé ; on teste ce que l’utilisateur voit et fait, sans snapshots.

### Tests d’intégration de l’API

Dans `server/test/`. Chaque fichier crée une base Postgres en mémoire ([PGlite](https://pglite.dev)) à partir des vraies migrations de `server/drizzle/`. Les requêtes passent par l’application Hono et Better Auth complètes, sans serveur ni réseau. Ils couvrent :

- **Authentification** : inscription, connexion refusée, données invalides, routes protégées sans session, origine inconnue, suppression du compte.
- **Swipe et match** : contenu du fil, swipes invalides, match uniquement réciproque.
- **Permissions** : la messagerie et les fiches des chiens restent invisibles pour quelqu’un d’extérieur.

Vitest est utilisé ici plutôt que Jest parce que le serveur est en modules ES (comme Better Auth et PGlite), que Jest ne gère pas sans configuration lourde. L’écriture des tests est la même (`describe`, `it`, `expect`).

## Déployer sur Neon Functions

Les commandes Neon ci-dessous se lancent depuis `server/` avec la CLI fournie par le projet.

Pour garder le profil CLI dans Pawpote sous Windows, définir `$env:NEON_CONFIG_DIR = Join-Path (Split-Path (Get-Location).Path -Parent) '.expo/neon-cli'` dans le terminal avant la connexion. Le dossier `.expo/` est ignoré par Git.

1. Dans la [console Neon](https://console.neon.tech/), ouvrir le projet Pawpote et vérifier que `development` existe et que la région prend en charge [Neon Functions](https://neon.com/docs/compute/functions/get-started). Dans le terminal, lancer `npx neon login`, se connecter dans le navigateur et autoriser la CLI. Lancer ensuite `npx neon link --branch development --no-env-pull --no-config` et choisir l’organisation puis le projet existant. Le contexte local `.neon` est ignoré par Git.
2. Créer `server/.env.neon-development` avec `BETTER_AUTH_SECRET` pour cette branche. Ajouter `BETTER_AUTH_WEB_ORIGINS` si un frontend Web doit appeler cette fonction et `BETTER_AUTH_EXPO_GO=true` pour tester depuis Expo Go. Neon injecte `DATABASE_URL` depuis la branche cible. Better Auth utilise l’URL HTTPS de la fonction par défaut. Renseigner `BETTER_AUTH_URL` seulement pour une URL canonique différente, par exemple un domaine personnalisé.
3. Une fois le déploiement de développement validé par l’équipe, publier la fonction et récupérer son URL.

   ```bash
   npm run deploy -- --branch development --env .env.neon-development
   npx neon functions get pawpote --branch development
   ```

   Vérifier que le déploiement est terminé et copier l’URL d’invocation. Dans la console, ouvrir la branche `development` puis **Functions**, sélectionner **Pawpote API** et utiliser **View logs** en cas d’erreur. Tester `/`, puis renseigner `EXPO_PUBLIC_API_URL` pour la build de développement.
4. Pour la production, préparer un fichier de secrets distinct et cibler explicitement la branche existante `production` après validation du déploiement de développement. Réutiliser le secret de production et vérifier que la base et le rôle injectés accèdent aux tables Better Auth existantes. Laisser `BETTER_AUTH_EXPO_GO` désactivé. Vérifier le changement d’URL avec le parcours d’authentification avant de basculer les builds Expo. Les cookies sont propres au domaine. Les comptes existants pourront se reconnecter avec leur mot de passe si le domaine d’API change.

Pour un frontend Web en production, utiliser des origines HTTPS sur le même site, par exemple des sous-domaines du même domaine. Cela conserve le fonctionnement des cookies dans les navigateurs qui bloquent les cookies tiers. Garder les secrets et les chaînes PostgreSQL dans les fichiers locaux ignorés par Git.

### Garder une branche de développement durable

La branche partagée `development` doit rester sans expiration pour conserver ses données et l’URL de sa fonction. Dans la console Neon, ouvrir **Branches**, choisir **Update expiration** sur `development`, décocher **Automatically delete branch after**, puis enregistrer. Réserver les dates d’expiration aux branches temporaires de test et de preview. [Documentation Neon sur l’expiration des branches](https://neon.com/docs/guides/branch-expiration)

### Vérifier l’authentification

Avec une build Expo pointée sur la fonction de développement, ouvrir l’application déconnectée et essayer d’accéder à Profil. Vérifier que la connexion s’affiche. Créer un compte de test, vérifier l’arrivée sur l’onboarding, puis terminer le parcours et ouvrir Profil. Fermer et rouvrir l’application pour vérifier la session. Se déconnecter, vérifier le retour à la connexion, puis se reconnecter avec le même e-mail.

Ressources officielles pour [le développement local](https://neon.com/docs/cli/dev), [le déploiement](https://neon.com/docs/compute/functions/deploy) et [les variables Neon Functions](https://neon.com/docs/compute/functions/environment-variables).

## Base de données

Le schéma PostgreSQL est défini dans :

- `server/src/db/schema.ts` : données Pawpote
- `server/src/db/auth-schema.ts` : données Better Auth

Les migrations SQL sont conservées dans `server/drizzle/`.

### Générer une migration

Après avoir modifié le schéma, depuis `server/` :

```bash
npx drizzle-kit generate --name=description_du_changement
```

### Appliquer les migrations

```bash
npx drizzle-kit migrate
```

**Attention :** relire le SQL généré et vérifier la branche Neon avant d'appliquer une migration. Les migrations sont versionnées et partagées via Git.

Ne pas modifier une ancienne migration déjà appliquée.

## Organisation du projet

```text
Pawpote/
├── src/
│   ├── app/              # Écrans et navigation Expo Router
│   ├── components/       # Composants React Native
│   ├── theme/            # Design system
│   └── lib/              # Configuration et utilitaires
│
├── server/
│   ├── src/
│   │   ├── db/           # Schémas Drizzle
│   │   ├── auth.ts       # Better Auth
│   │   └── index.ts      # API Hono
│   ├── drizzle/          # Migrations SQL
│   ├── drizzle.config.ts
│   └── neon.ts           # Déclaration de la fonction Neon
│
├── docs/
│   └── adr/              # Décisions d'architecture
│
└── README.md
```

## Git et collaboration

Le développement se fait avec des branches dédiées aux fonctionnalités.

Exemples :

- `feature/authentication`
- `feature/database-schema`
- `feature/onboarding`

### Créer une branche

Avant de commencer une nouvelle fonctionnalité :

```bash
git checkout main
git pull origin main
git checkout -b feature/nom-fonctionnalite
```

### Faire un commit

Nous utilisons les Conventional Commits :

```bash
git commit -m "feat(auth): add login screen"
```

Préfixes courants :

- `feat` : nouvelle fonctionnalité
- `fix` : correction d'un bug
- `refactor` : modification interne sans nouvelle fonctionnalité
- `docs` : documentation
- `chore` : maintenance ou configuration

### Pull Requests

Chaque fonctionnalité est développée sur une branche séparée, puis intégrée à `main` via une Pull Request.

Avant de créer une PR :

1. Vérifier que le projet fonctionne.
2. Vérifier TypeScript avec `npx tsc --noEmit`.
3. Vérifier les migrations si le schéma a changé.
4. Documenter les décisions d'architecture importantes dans `docs/adr/`.
5. Vérifier qu'aucun secret n'est inclus dans les commits.
6. Créer une PR vers `main`.

## Documentation technique

Les décisions d'architecture sont disponibles dans `docs/adr/`.

Elles permettent de comprendre les choix techniques du projet et leur évolution.

## État du projet

Pawpote est actuellement en cours de développement.

Les fonctionnalités sont ajoutées progressivement, à travers différentes Pull Requests.

---

**Pawpote — Des papattes, des potes, des balades 🐾**
