# Quickstart — TechTown Marketplace

## Prérequis

1. Claude Code installé (`claude --version`)
2. Connecté sous l'org **TechTown** (`/login` → sélectionner TechTown)

## Installation en 2 minutes

### Étape 1 — Ajouter le marketplace

Dans Claude Code :
```
/add-plugin techtown-marketplace
```

### Étape 2 — Sélectionner les plugins

Dans le menu, activer les plugins souhaités :
- ✅ `brand-guidelines` — toujours recommandé pour les projets UI
- ✅ `firebase-deploy` — pour tous les projets avec Firebase Hosting
- ✅ `project-setup` — pour initialiser un nouveau projet TechTown

### Étape 3 — Utiliser un plugin

Les plugins s'activent automatiquement selon le contexte. Exemples :

- "Crée un rapport client en HTML" → active `reporting`
- "Setup Firebase deploy avec WIF" → active `firebase-deploy`
- "Quelles sont les couleurs TechTown ?" → active `brand-guidelines`

## Mettre à jour les plugins

```
/update-plugin techtown-marketplace
```
