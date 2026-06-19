# CLAUDE.md — techtown-fr/techtown-marketplace

Marketplace Claude Code pour les collaborateurs TechTown.

## Structure

```
.claude-plugin/marketplace.json   # Registre central de tous les plugins
plugins/<name>/
  .claude-plugin/plugin.json      # Manifest du plugin
  skills/<name>/SKILL.md          # Instructions agent
  templates/                      # Fichiers générables (optionnel)
  README.md
```

## Règle des 3 fichiers synchronisés

`plugin.json`, `marketplace.json` (entrée dans `plugins[]`), et `SKILL.md` (frontmatter)
doivent avoir le même `name` et la même `description`. Ne modifier l'un sans mettre à jour les deux autres.

## Commandes

```bash
# Valider le JSON du registre
jq . .claude-plugin/marketplace.json

# Valider la structure d'un plugin
claude plugin validate ./plugins/<name>

# Lister les plugins
ls plugins/
```

## Plugins présents

| Plugin | Rôle |
|--------|------|
| `brand-guidelines` | Palette TechTown, typo, CSS vars, composants |
| `firebase-deploy` | Firebase Hosting + WIF CI/CD |
| `gcp-terraform` | Cloud Run + Cloud SQL + Secret Manager |
| `project-setup` | Init projet TechTown (CLAUDE.md, pre-commit, CI) |
| `reporting` | Rapports HTML brandés TechTown |
| `astro-firebase-app` | Scaffold Astro 5 + Firebase + Google SSO |

## Ajouter un plugin

Voir CONTRIBUTING.md.
