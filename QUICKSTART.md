# Quickstart — TechTown Marketplace

## Prérequis

1. Claude Code installé (`claude --version`)
2. Connecté sous l'org **TechTown** (`/login` → sélectionner TechTown)

## Installation en 2 minutes

### Étape 1 — Ajouter le marketplace

Dans le terminal :
```bash
claude plugin marketplace add techtown-fr/techtown-marketplace
```

> Si l'org TechTown a déployé les *managed settings*, le marketplace est déjà
> déclaré (`strictKnownMarketplaces`) — cette étape est alors facultative.

### Étape 2 — Installer les plugins souhaités

```bash
claude plugin install brand-guidelines@techtown-marketplace   # projets UI
claude plugin install firebase-deploy@techtown-marketplace    # Firebase Hosting
claude plugin install project-setup@techtown-marketplace      # nouveau projet TechTown
```

Lister les plugins disponibles / installés :
```bash
claude plugin list
```

### Étape 3 — Utiliser un plugin

Les plugins s'activent automatiquement selon le contexte. Exemples :

- "Crée un rapport client en HTML" → active `reporting`
- "Setup Firebase deploy avec WIF" → active `firebase-deploy`
- "Quelles sont les couleurs TechTown ?" → active `brand-guidelines`

## Mettre à jour les plugins

```bash
claude plugin marketplace update techtown-marketplace   # rafraîchit le catalogue
claude plugin update <nom>@techtown-marketplace          # met à jour un plugin
```
