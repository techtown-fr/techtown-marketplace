---
name: firebase-deploy
description: Setup Firebase Hosting with WIF-based GitHub Actions CI/CD for TechTown projects. USE WHEN deploying a web app to Firebase, setting up hosting CI/CD, configuring GitHub Actions deploy, setup hosting, CI Firebase, WIF deploy.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# Firebase Deploy — TechTown

Configure Firebase Hosting avec un pipeline GitHub Actions utilisant Workload Identity Federation (WIF). Zéro SA key en clair.

## Prérequis

- Projet GCP créé dans l'org TechTown
- Firebase activé sur le projet (`firebase.google.com`)
- WIF configuré (pool `github`, provider `github`) — voir la section Setup WIF

## Étape 1 — `firebase.json`

Copier depuis `templates/firebase.json` et adapter le répertoire `public` :

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false,
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.@(css|js)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.@(html)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=0, must-revalidate" }]
      }
    ]
  }
}
```

Valeurs à adapter :
- `"public"`: répertoire de build (`dist` pour Astro, `public` pour vanilla, `out` pour Next.js)
- `"projectId"` dans `.firebaserc`

## Étape 2 — `.firebaserc`

```json
{
  "projects": {
    "default": "<PROJECT_ID>"
  }
}
```

Remplacer `<PROJECT_ID>` par l'ID du projet GCP (ex: `techtown-apps`).

## Étape 3 — GitHub Actions avec WIF

Copier depuis `templates/deploy.yml` dans `.github/workflows/deploy.yml`.

**Variables à remplacer :**
- `<WIF_PROVIDER>`: `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/github`
- `<SERVICE_ACCOUNT>`: `github-actions@<PROJECT_ID>.iam.gserviceaccount.com`
- `<PROJECT_ID>`: ID du projet Firebase
- `<BUILD_COMMAND>`: `npm run build` ou `bun run build`
- Secrets GitHub à ajouter : variables d'env Firebase (`PUBLIC_FIREBASE_*`)

## Setup WIF (à faire une fois par projet GCP)

```bash
PROJECT_ID="<project-id>"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Créer le pool WIF
gcloud iam workload-identity-pools create github \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions"

# Créer le provider
gcloud iam workload-identity-pools providers create-oidc github \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github \
  --display-name="GitHub" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Autoriser le repo GitHub
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@$PROJECT_ID.iam.gserviceaccount.com \
  --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/techtown-fr/<REPO_NAME>"
```

## Invariants

- **Jamais de SA key en clair** dans le repo ou les secrets GitHub
- **WIF obligatoire** — la clé de service account transitoire est exposée via `credentials_file_path`
- Région Firebase Functions : `europe-west1` uniquement
