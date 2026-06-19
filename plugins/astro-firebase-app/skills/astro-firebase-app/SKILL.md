---
name: astro-firebase-app
description: Scaffold a TechTown Astro 5 app with Firebase Hosting and Google SSO restricted to @techtown.fr. USE WHEN creating a new internal TechTown web application, nouvelle app Astro TechTown, scaffold application, Astro Firebase setup, nouvelle app interne.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# Astro Firebase App — TechTown

Scaffold une application Astro 5 avec Firebase Hosting et Google SSO restreint à `@techtown.fr`.

## Prérequis

- Node.js 22+
- Firebase CLI (`npm install -g firebase-tools`)
- Projet Firebase créé dans l'org TechTown

## Étapes de scaffold

### 1. Créer le projet Astro

```bash
npm create astro@latest <nom-app> -- --template minimal --typescript strict --no-git
cd <nom-app>
npm install firebase
```

### 2. Copier les fichiers de base

Copier depuis les templates :
- `astro.config.mjs` → `.`
- `firebase.json` → `.` (adapter `public` si besoin)
- `src/lib/firebase.ts` → `src/lib/`
- `src/lib/auth.ts` → `src/lib/`
- `src/layouts/Layout.astro` → `src/layouts/`

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

Ajouter dans GitHub Secrets les mêmes clés (pour le CI Firebase Deploy).

### 4. Initialiser Firebase

```bash
firebase login
firebase use <project-id>
firebase init hosting  # public dir = "dist", SPA rewrites = no
```

### 5. Ajouter le deploy CI (optionnel)

Utiliser le plugin `firebase-deploy` pour configurer GitHub Actions.

## Invariants

- `hd: "techtown.fr"` dans `googleProvider.setCustomParameters()` — jamais supprimer
- Vérification côté client `!email.endsWith('@techtown.fr')` dans `auth.ts` — obligatoire
- `noindex, nofollow` dans `Layout.astro` — les apps internes ne doivent pas être indexées
