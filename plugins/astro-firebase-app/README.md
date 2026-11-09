# astro-firebase-app

Scaffold une app Astro 7.4 (Node `>=22.23.4`) + Firebase Hosting + Google SSO `@techtown.fr`.

Avant d'adapter le layout, lancer `modern-web-guidance`. Le déploiement CI passe par `firebase-deploy` (Node 22.23.4, `firebase.json` statique de ce plugin).

## Templates fournis

| Fichier | Rôle |
|---------|------|
| `astro.config.mjs` | Config Astro (output static, Poppins via `fontProviders.google()`) |
| `firebase.json` | Hosting multi-pages, sans rewrite SPA, cache assets / HTML |
| `src/lib/firebase.ts` | Init Firebase + GoogleAuthProvider (`hd=techtown.fr`) |
| `src/lib/auth.ts` | signInWithGoogle, logout, onAuthChange + validation domaine |
| `src/layouts/Layout.astro` | Layout avec auth guard, noindex, Poppins (`<Font />`), schéma système |

## Invariant de sécurité

La restriction `@techtown.fr` est doublement appliquée : côté Firebase (`hd: hint`) ET côté client (`email.endsWith`). Ne pas supprimer l'une ou l'autre.
