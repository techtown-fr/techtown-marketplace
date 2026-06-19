# firebase-deploy

Setup Firebase Hosting avec CI/CD GitHub Actions via Workload Identity Federation (WIF). Zéro SA key stockée en clair.

## Activation

S'active quand tu mentionnes Firebase, hosting, deploy, CI/CD, GitHub Actions deploy.

## Templates fournis

| Fichier | Usage |
|---------|-------|
| `templates/firebase.json` | Config hosting avec headers cache optimaux |
| `templates/deploy.yml` | Workflow GitHub Actions WIF complet |
| `templates/.firebaserc` | Mapping projet Firebase |

## Invariant de sécurité

WIF obligatoire. Aucune SA key permanente dans les secrets GitHub.
