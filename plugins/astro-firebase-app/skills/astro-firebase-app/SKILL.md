---
name: astro-firebase-app
description: >-
  Scaffold a TechTown Astro 7.4 app (Node >=22.23.4) with Firebase Hosting and
  Google SSO restricted to @techtown.fr. Before adapting the layout, CSS, or
  client scripts, run modern-web-guidance (dark mode, web fonts). Deploy with
  the firebase-deploy plugin and this skill's static firebase.json (no SPA
  rewrite, Node 22.23.4 in CI). USE WHEN creating a new internal TechTown web
  application, nouvelle app Astro TechTown, scaffold application, Astro
  Firebase setup, nouvelle app interne.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# Astro Firebase App — TechTown

Scaffold une application Astro 7.4 avec Firebase Hosting et Google SSO restreint à `@techtown.fr`.

Avant de modifier le layout, le CSS ou le JavaScript client, suivre la skill `modern-web-guidance` (requêtes courtes : `dark mode`, `stable font fallbacks`). Le template `Layout.astro` suit déjà ces guides. Ne pas l'utiliser pour GitHub Actions : le déploiement passe par le plugin `firebase-deploy`.

## Prérequis

- Node.js `>=22.23.4` (version paire ; Astro 7.4 refuse une version plus ancienne)
- Firebase CLI (`npm install -g firebase-tools`)
- Projet Firebase créé dans l'org TechTown

## Étapes de scaffold

### 1. Créer le projet Astro

Astro 5+ n'accepte plus `--typescript` : le preset strict est le défaut.

```bash
npm create astro@latest <nom-app> -- --template minimal --no-git
cd <nom-app>
npm install firebase
```

Puis épingler le moteur dans `package.json` :

```json
"engines": { "node": ">=22.23.4" }
```

### 2. Copier les fichiers de base

Copier depuis les templates :

- `astro.config.mjs` → `.` (sortie statique + Poppins via `fontProviders.google()`)
- `firebase.json` → `.` (site multi-pages, pas de rewrite SPA)
- `src/lib/firebase.ts` → `src/lib/`
- `src/lib/auth.ts` → `src/lib/`
- `src/layouts/Layout.astro` → `src/layouts/`

`Layout.astro` charge Poppins avec `<Font />` (`astro:assets`), précharge seulement les graisses 400 et 600, et suit le schéma clair/sombre du système (`color-scheme: light dark`, repli `prefers-color-scheme`). Ne pas réintroduire de feuille Google Fonts ni un `data-theme` qui fige le thème. Un interrupteur manuel n'est ajouté que si on le demande : retrieve `dark-mode-toggle`.

### 3. Configurer les variables d'environnement

Créer `.env.local` :

```
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
```

Ces clés sont publiques dans le bundle client. Pour le CI, les déclarer comme variables GitHub Actions et les passer au step Build (Astro les inline au build). Le plugin `firebase-deploy` ne les crée pas.

### 4. Sélectionner le projet Firebase

Le `firebase.json` du template est déjà la config Hosting. Ne pas lancer `firebase init hosting` : l'assistant peut l'écraser.

```bash
firebase login
firebase use <project-id>
```

S'il n'y a pas encore de site Hosting : `firebase hosting:sites:create <project-id> --project <project-id>`.

### 5. Ajouter le deploy CI

Utiliser le plugin `firebase-deploy`. En adaptant son workflow :

- `node-version: "22.23.4"` (le template dit `22`, ce qui ne garantit pas le plancher Astro 7.4)
- garder le `firebase.json` de cette skill (clean URLs, pas de rewrite SPA, HTML `must-revalidate`, assets hashés `immutable`)
- injecter les `PUBLIC_FIREBASE_*` dans le step Build

## Invariants

- `hd: "techtown.fr"` dans `googleProvider.setCustomParameters()` — jamais supprimer
- Vérification côté client `!email.endsWith('@techtown.fr')` dans `auth.ts` — obligatoire
- `noindex, nofollow` dans `Layout.astro` — les apps internes ne doivent pas être indexées
