# API Pawpote

`neon.ts` déclare la Neon Function `pawpote`. Hono expose `GET /`, `GET /api/breeds` et les routes Better Auth sous `/api/auth`.

Pour le développement sur ordinateur, utiliser `npm run dev`. Pour un appareil sur le réseau local, utiliser `npm run dev:lan`.

Le [README principal](../README.md) décrit les variables, la sélection de la branche Neon, le déploiement et les vérifications Expo.

## Découverte et jeu de démonstration

`/api/discovery` requiert une session Better Auth. La route renvoie les chiens des autres comptes par lots de 24. Un chien déjà liké ou passé sort de la liste. Les deux chiens ciblés par des likes réciproques entre deux comptes sont enregistrés dans `matches`. Recommencer en fin de liste ouvre un nouveau passage et conserve les matchs déjà créés.

Appliquer les migrations Drizzle sur la base de développement prévue pour la démo. Dans `server/.env`, vérifier `DATABASE_URL` et renseigner `PAWPOTE_DEMO_DB_HOST` avec le nom d’hôte de cette base. Depuis `server/`, lancer `npm run seed:discovery`. Le script est relançable et ajoute 24 chiens et 22 propriétaires fictifs. Les photos et leurs crédits Wikimedia sont définis dans `server/data/demo-photos.json`.

## Catalogue des races

[`data/breeds.json`](data/breeds.json) réunit les races reconnues à titre définitif ou provisoire dans la [nomenclature FCI](https://www.fci.be/fr/nomenclature/Default.aspx), avec quelques variétés courantes. Le champ `fci` identifie le standard de référence. Les noms reprennent la nomenclature française ou un nom courant qui facilite la recherche.

Le gabarit correspond à la hauteur typique au garrot à l’âge adulte. Les seuils Pawpote sont `small` sous 35 cm, `medium` de 35 cm à moins de 55 cm et `large` à partir de 55 cm. Les mesures proviennent des standards FCI et de [Dog API v2](https://dogapi.dog/docs/api-v2). Pour les quelques standards sans hauteur, le gabarit usuel sert de référence. « Croisé » et « Autre race » sont des choix du formulaire sans identifiant de race.

Depuis `server/`, avec `DATABASE_URL` pointant sur la branche Neon voulue et le schéma Drizzle déjà appliqué, lancer `npm run seed:breeds`. Le script ajoute les races manquantes et met à jour les gabarits par nom unique en conservant les IDs existants. `GET /api/breeds` lit le catalogue depuis PostgreSQL.
