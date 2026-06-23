# secret-audit

Audit lecture seule du poste pour détecter les secrets stockés en clair.
Génère un rapport HTML local redacté — **aucune valeur n'est jamais affichée ni transmise**.

## Périmètre du scan

| Domaine | Ce qui est scanné |
|---------|------------------|
| 🐚 **Shells** | zsh, bash, fish, nushell, tcsh, csh, ksh (16 fichiers) |
| ☁️ **Cloud** | AWS, GCP (ADC + legacy SA keys), Azure, Kubernetes, Terraform, Pulumi, Fly.io, DigitalOcean, Netlify, Heroku, ArgoCD |
| 🔧 **MCP/AI** | Claude Code settings, Cursor, Gemini CLI, OpenCode |
| 🛠 **Dev** | npmrc, pypirc, pgpass, git-credentials, Docker, Firebase, Google Workspace |
| 🔍 **Gitleaks** | Scan `~/.config` et `~/.aws` avec `--redact --no-git` (mode full) |

## Utilisation

```bash
# Scan complet (recommandé)
/secret-audit

# Scan rapide sans gitleaks (< 15s)
/secret-audit --quick

# Rapport vers un chemin spécifique
/secret-audit --output /tmp/audit.html
```

## Prérequis

- **Bun** — `brew install bun` ou `curl -fsSL https://bun.sh/install | bash`
- **gitleaks** (optionnel, scan deep) — `brew install gitleaks`

## Règles de sécurité

- ✅ Lecture seule — aucun fichier modifié
- ✅ Valeurs masquées — seuls chemin, nom de variable, type, permissions et état du coffre sont rapportés
- ✅ Rapport local uniquement — rien n'est transmis à l'extérieur
- ✅ Recommandations uniquement — la remédiation est à exécuter manuellement par le collaborateur

## Sévérités

| Icône | Signification |
|-------|--------------|
| 🔴 **CRITIQUE** | Fichier 644 (world-readable) + secret en clair = considéré comme leaké |
| 🟠 **ATTENTION** | Fichier 600 + secret en clair = risque si disque non chiffré |
| ⚪ **Faux positif** | OAuth app credentials, variables sans valeur sensible |
| ✅ **Conforme** | Coffre natif (Keychain, credsStore, gcloud CLI) |
