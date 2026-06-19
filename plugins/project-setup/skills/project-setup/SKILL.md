---
name: project-setup
description: Initialize a new TechTown project with CLAUDE.md, README, .gitignore, pre-commit hooks (markdownlint + gitleaks), and GitHub Actions CI skeleton. USE WHEN starting a new TechTown repo, init projet TechTown, setup repo, nouveau projet, conventions TechTown, initialiser un projet.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# Project Setup — TechTown

Initialise les fondations d'un projet TechTown : conventions, documentation, qualité et CI.

## Ce que génère ce plugin

1. **`CLAUDE.md`** — context pour Claude Code (identité projet, archi, commandes, règles)
2. **`README.md`** — documentation projet standard
3. **`.gitignore`** — ignore patterns communs TechTown
4. **`.pre-commit-config.yaml`** — markdownlint + gitleaks
5. **`.github/workflows/ci.yml`** — lint + build sur PR et push main

## Étapes

### 1. Demander le contexte du projet

Avant de générer quoi que ce soit, demander :
- Nom du projet
- Description courte (1 phrase)
- Stack technique principale (Next.js, Astro, Python, Terraform, etc.)
- URL de production si connue

### 2. Générer `CLAUDE.md`

Adapter le template `templates/CLAUDE.md.template` avec les infos collectées.

### 3. Générer `README.md`

Adapter le template `templates/README.md.template`.

### 4. Copier les fichiers de qualité

```bash
# Depuis templates/
cp .gitignore <projet>/.gitignore
cp .pre-commit-config.yaml <projet>/.pre-commit-config.yaml
mkdir -p <projet>/.github/workflows
cp ci.yml <projet>/.github/workflows/ci.yml
```

### 5. Installer pre-commit

```bash
pip install pre-commit  # ou brew install pre-commit
pre-commit install
pre-commit run --all-files  # vérifier que ça passe
```

### 6. Premier commit

```bash
git add .
git commit -m "chore: init projet TechTown — CLAUDE.md, README, pre-commit, CI"
```
