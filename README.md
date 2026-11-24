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
| Cloudflare Workers | Hébergement du backend |
| Neon PostgreSQL | Base de données |
| Drizzle ORM | Schéma et migrations SQL |
| Better Auth | Authentification |

## Prérequis

Avant de commencer, installer :

- Node.js et npm
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

## Configuration des variables d'environnement

Les fichiers contenant des identifiants et des secrets ne doivent jamais être envoyés sur GitHub.

### 1. Application Expo

Créer `.env.local` à la racine du projet :

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.20:8787
```

Remplacer `192.168.1.20` par l'adresse IPv4 locale de son ordinateur.

Sur Windows, utiliser `ipconfig` pour retrouver cette adresse.

Le téléphone et l'ordinateur doivent être connectés au même réseau.

### 2. Backend Hono

Créer `server/.dev.vars` :

```dotenv
DATABASE_URL=postgresql://...
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=...
```

- `DATABASE_URL` : chaîne de connexion Neon de développement.
- `BETTER_AUTH_URL` : URL locale du backend.
- `BETTER_AUTH_SECRET` : secret utilisé pour l'authentification.

Pour générer un secret :

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

### 3. Drizzle Kit

Créer également `server/.env` :

```dotenv
DATABASE_URL=postgresql://...
```

Cette variable permet à Drizzle Kit de se connecter à Neon pour gérer les migrations.

**Important :** utiliser la branche Neon `development`, jamais `production` pour les tests locaux.

Les identifiants de connexion sont à demander à un membre de l'équipe disposant des accès.

## Lancer le projet

Deux terminaux sont nécessaires.

### Terminal 1 — Backend

Depuis la racine :

```bash
cd server
npx wrangler dev --ip 0.0.0.0 --port 8787
```

L'API est disponible sur :

- `http://127.0.0.1:8787` depuis l'ordinateur
- `http://ADRESSE_IP_LOCALE:8787` depuis le téléphone

Elle doit retourner :

```json
{
  "name": "Pawpote API",
  "status": "ok"
}
```

### Terminal 2 — Application Expo

Depuis la racine :

```bash
npx expo start --lan
```

Scanner le QR code affiché dans le terminal avec Expo Go.

Pour lancer la version web, utiliser la touche `w` dans le terminal Expo.

En cas de problème de cache :

```bash
npx expo start --clear --lan
```

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
│   ├── constants/        # Constantes et thème
│   └── lib/              # Configuration et utilitaires
│
├── server/
│   ├── src/
│   │   ├── db/           # Schémas Drizzle
│   │   ├── auth.ts       # Better Auth
│   │   └── index.ts      # API Hono
│   ├── drizzle/          # Migrations SQL
│   └── drizzle.config.ts
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