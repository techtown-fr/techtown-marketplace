---
name: project-setup
description: Bootstrap a TechTown repository with its conventions — AGENTS.md, dependabot.yml trimmed to the real stack, CODEOWNERS, .gitignore, pre-commit hooks and CI. USE WHEN starting a new TechTown repo, init projet TechTown, nouveau projet, bootstrap repo, setup conventions TechTown, or adding Dependabot to a repo that has none.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# Project Setup — TechTown

Amorce un repo TechTown : conventions, suivi de dépendances, qualité et CI.

Remplace l'ancien template GitHub `techtown-fr/repo-template`, dont la checklist de bootstrap
vivait en prose dans un `AGENTS.md`. Elle est ici, exécutable.

## Ce que ce plugin génère

| Fichier | Rôle |
|---------|------|
| `AGENTS.md` | Conventions permanentes (Conventional Commits, PR, commentaires, infra) |
| `CLAUDE.md` | Une ligne : `@AGENTS.md` — source unique, pas de duplication |
| `README.md` | Documentation projet |
| `.github/dependabot.yml` | **Élagué au stack réel** — voir étape 4 |
| `.github/CODEOWNERS` | Propriétaire du repo |
| `.gitignore` | Patterns communs TechTown |
| `.pre-commit-config.yaml` | markdownlint + gitleaks |
| `.github/workflows/ci.yml` | lint + format + test + build |

## Ce qu'il ne génère PAS

`CONTRIBUTING.md`, `SECURITY.md`, les templates d'issue et de PR sont **hérités** du repo
d'organisation `techtown-fr/.github`. Les recréer par repo crée deux sources de vérité qui
divergent. Ne pas les écrire.

## Étapes

### 1. Identifier le stack réel

Demander si ce n'est pas déductible du repo, avec `AskUserQuestion` :

- Nom du projet, description en une phrase, URL de prod si connue
- Stack : npm/Node, Astro, Python, Terraform, Docker, ou une combinaison
- Propriétaire GitHub du repo (pour `CODEOWNERS`)

Ne rien générer avant d'avoir ces réponses. Le stack détermine l'étape 4, qui est la seule
irréversible en pratique : un `dependabot.yml` faux reste faux en silence.

### 2. Générer `AGENTS.md` et `CLAUDE.md`

Adapter `templates/AGENTS.md.template` avec les infos collectées, puis copier
`templates/CLAUDE.md.template` tel quel — il ne contient que `@AGENTS.md`.

Remplacer tous les placeholders : `<PROJECT_DESCRIPTION>`, `<REPO_NAME>`, `<PRODUCTION_URL>`,
`<LAYER>`, `<TECH>`, `<DEV_COMMAND>`, `<BUILD_COMMAND>`, `<TEST_COMMAND>`. Supprimer les lignes
dont la valeur est inconnue plutôt que de laisser un placeholder.

### 3. Générer `README.md`

Adapter `templates/README.md.template`.

### 4. Élaguer `dependabot.yml` — l'étape qui compte

```bash
mkdir -p <projet>/.github
cp templates/dependabot.yml <projet>/.github/dependabot.yml
```

Le fichier déclare cinq écosystèmes : `npm`, `terraform`, `docker`, `pip`, `github-actions`.
**Supprimer chaque bloc dont le manifeste est absent du repo :**

| Bloc | À garder seulement si |
|------|----------------------|
| `npm` | `package.json` existe |
| `terraform` | des fichiers `*.tf` existent |
| `docker` | un `Dockerfile` existe |
| `pip` | `requirements.txt` ou `pyproject.toml` existe |
| `github-actions` | `.github/workflows/` existe — donc quasiment toujours |

Vérifier par la présence réelle du fichier, pas par la déclaration de l'utilisateur :

```bash
ls package.json requirements.txt pyproject.toml Dockerfile 2>/dev/null; ls *.tf 2>/dev/null
```

Pourquoi cette étape est critique : les **security updates sont désactivées au niveau de
l'organisation** (leurs PRs ignorent `open-pull-requests-limit` et beaucoup de repos n'ont
aucune CI pour les valider). Ce fichier est donc le **seul** mécanisme de suivi de versions du
repo. Sans lui, aucune montée de version n'arrive jamais.

Les labels référencés (`dependencies`, `ci/cd`, `terraform`) font partie des labels par défaut
de l'organisation, appliqués automatiquement aux nouveaux repos. Ne pas les créer à la main.

### 5. Copier les fichiers de qualité

```bash
cp templates/.gitignore <projet>/.gitignore
cp templates/.pre-commit-config.yaml <projet>/.pre-commit-config.yaml
cp templates/CODEOWNERS <projet>/.github/CODEOWNERS
```

Remplacer `@<github-username>` dans `CODEOWNERS` par le propriétaire réel. Un `CODEOWNERS`
laissé avec son placeholder n'assigne aucun relecteur et ne produit aucune erreur.

Sur un projet Terraform, ne pas ajouter `.terraform.lock.hcl` au `.gitignore` : il épingle les
hashes des providers, donc le committer est ce qui rend un plan reproductible.

### 6. CI

```bash
mkdir -p <projet>/.github/workflows
cp templates/ci.yml <projet>/.github/workflows/ci.yml
```

Le workflow utilise `npm run --if-present`, donc il reste valide quel que soit le sous-ensemble
de scripts défini par le projet. Sur un projet non-npm, le remplacer entièrement.

Valider avant de committer :

```bash
actionlint   # depuis la racine du repo git
```

### 7. Router l'infra par `techtown-infra`

À rappeler à l'utilisateur, et à ne jamais faire à la main :

Tout ce qui accorde un accès GCP — compte de service, binding IAM, binding Workload Identity,
accès au bucket `techtown-tfstate` partagé — est déclaré dans `techtown-fr/techtown-infra`,
jamais créé avec `gcloud`.

Le pool Workload Identity est **scopé par repo**. Un repo dont la CI s'authentifie à GCP doit
figurer dans `github_actions_repo` côté `techtown-infra`, sinon l'étape `auth` échoue sans
principal correspondant. C'est un `terraform apply` dans un autre repo, pas une case à cocher :
le prévoir avant d'annoncer que la CI fonctionne.

### 8. Config spécifique au stack : déléguer

Ne pas réimplémenter ici ce que d'autres plugins du marketplace font déjà :

| Besoin | Plugin |
|--------|--------|
| App Astro 5 + Firebase + SSO Google | `astro-firebase-app` |
| CI/CD Firebase Hosting via WIF | `firebase-deploy` |
| Terraform GCP (Cloud Run, Cloud SQL, Secret Manager) | `gcp-terraform` |
| Palette, typo, composants TechTown | `brand-guidelines` |

### 9. Vérifier

```bash
pre-commit install && pre-commit run --all-files
actionlint
```

Confirmer que les placeholders ont tous disparu :

```bash
grep -rn "<[A-Z_]*>\|@<github-username>" --include="*.md" --include="*.yml" . || echo "aucun placeholder restant"
```

### 10. Committer

Branche + PR, jamais directement sur `main` :

```bash
git checkout -b chore/bootstrap
git add .
git commit -m "chore: bootstrap TechTown conventions"
gh pr create --fill
```
