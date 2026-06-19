# TechTown Claude Code Marketplace

Marketplace Claude Code interne pour les collaborateurs TechTown.
Regroupe les plugins pour les workflows récurrents de l'équipe.

## Plugins disponibles

| Plugin | Description | Use case |
|--------|-------------|----------|
| `brand-guidelines` | Palette, typo, CSS vars, composants Astro/Vue | UI, styling, marketing |
| `firebase-deploy` | Firebase Hosting + WIF CI/CD GitHub Actions | Déploiement web |
| `gcp-terraform` | Cloud Run + Cloud SQL + Secret Manager | Infrastructure GCP |
| `project-setup` | CLAUDE.md, README, pre-commit, GitHub Actions | Init projet |
| `reporting` | Rapports HTML brandés TechTown (Chart.js, PDF) | Livrables clients |
| `astro-firebase-app` | Scaffold Astro 5 + Firebase + Google SSO | Nouvelles apps |

## Installation

> Prérequis : être connecté sous l'org TechTown dans Claude Code.

```bash
# 1. Ajouter le marketplace (facultatif si déployé via managed settings)
claude plugin marketplace add techtown-fr/techtown-marketplace

# 2. Installer un plugin
claude plugin install brand-guidelines@techtown-marketplace
```

Lister les plugins disponibles : `claude plugin list`.

Voir [QUICKSTART.md](QUICKSTART.md) pour le guide complet.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md).
