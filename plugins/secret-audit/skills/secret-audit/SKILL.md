---
name: secret-audit
description: Scan the local workstation for plaintext secrets across all shells (zsh/bash/fish/nu/tcsh), cloud CLIs (AWS/GCP/Azure/k8s/Terraform/Pulumi/Fly/DigitalOcean), MCP configs (Claude/Cursor/Gemini/OpenCode), and dev tools. Generates a local redacted HTML report — values are NEVER displayed. USE WHEN audit secrets, scan secrets, secrets en clair, audit sécurité poste, check credentials, find plaintext secrets, scanner les tokens, audit workstation security.
allowed-tools: Bash, Read
---

# /secret-audit

Audit lecture seule du poste pour détecter les secrets stockés en clair.
Aucune valeur n'est jamais affichée ni transmise.

## Prérequis

- **Bun** installé (`brew install bun` ou `curl -fsSL https://bun.sh/install | bash`)
- **gitleaks** recommandé pour le scan complet (`brew install gitleaks`) — optionnel, contournable avec `--quick`

## Arguments

| Arg | Comportement |
|-----|-------------|
| (aucun) | Scan complet — tous les chemins + gitleaks |
| `--quick` | Shells + cloud credentials seulement (< 15s, sans gitleaks) |
| `--output <path>` | Chemin HTML de sortie (défaut: ~/secret-audit-YYYYMMDD/report.html) |

## Exécution

```bash
bun ~/.claude/skills/secret-audit/Workflows/audit.ts [--quick] [--output <path>]
```

## Ce que l'agent doit faire

1. Exécuter la commande ci-dessus avec les args passés au skill
2. Lire le JSON sur stdout (résumé des findings)
3. Reporter à l'utilisateur :
   - Le comptage par sévérité (critique / attention / faux positifs / conformes)
   - Le chemin du rapport HTML
   - Les 3 actions les plus urgentes (🔴 en premier)
4. Proposer d'ouvrir le rapport : `open <chemin>`

## Règles de sécurité (ZERO exceptions)

- Ne JAMAIS afficher de valeur de secret, même tronquée
- Ne JAMAIS modifier, déplacer ou supprimer de fichier
- Ne JAMAIS exécuter les commandes de remédiation (chmod, rotation de clé, etc.)
- Seuls chemin, nom de variable, type, permissions et état coffre sont rapportables

## Périmètre du scan

| Domaine | Chemins couverts |
|---------|-----------------|
| Shells | zsh (5), bash (5), fish, nushell (2), tcsh, csh, ksh |
| Cloud | AWS (~/.aws), GCP (ADC, legacy SA keys, .boto), Azure, Kubernetes, Terraform, Pulumi, Fly.io, DigitalOcean, Netlify, Heroku, ArgoCD |
| MCP/AI | Claude settings.json, Cursor mcp.json, Gemini mcp_config.json, OpenCode |
| Dev | npmrc, pypirc, pgpass, git-credentials, Docker config, Firebase, GWS |
| Gitleaks | Scan `~/.config` et `~/.aws` avec `--redact --no-git` (mode full) |
