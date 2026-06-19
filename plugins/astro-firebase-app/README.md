# astro-firebase-app

Scaffold une app Astro 5 + Firebase Hosting + Google SSO `@techtown.fr`.

## Templates fournis

| Fichier | Rôle |
|---------|------|
| `astro.config.mjs` | Config Astro (output static) |
| `firebase.json` | Hosting config avec headers cache |
| `src/lib/firebase.ts` | Init Firebase + GoogleAuthProvider (`hd=techtown.fr`) |
| `src/lib/auth.ts` | signInWithGoogle, logout, onAuthChange + validation domaine |
| `src/layouts/Layout.astro` | Layout avec auth guard, noindex, Poppins, dark mode |

## Invariant de sécurité

La restriction `@techtown.fr` est doublement appliquée : côté Firebase (`hd: hint`) ET côté client (`email.endsWith`). Ne pas supprimer l'une ou l'autre.
