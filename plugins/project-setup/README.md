# project-setup

Amorce un repo TechTown : conventions, suivi de dépendances, qualité et CI.

Remplace le template GitHub `techtown-fr/repo-template`, dont la checklist de bootstrap vivait
en prose dans un `AGENTS.md` et supposait qu'un agent la lise et l'applique correctement.

## Templates fournis

| Fichier | Rôle |
|---------|------|
| `AGENTS.md.template` | Conventions permanentes : Gitmoji, workflow PR, commentaires, infra |
| `CLAUDE.md.template` | Une ligne — `@AGENTS.md`, pour éviter deux sources de vérité |
| `README.md.template` | Documentation projet |
| `dependabot.yml` | 5 écosystèmes (npm, terraform, docker, pip, github-actions) à élaguer |
| `CODEOWNERS` | Propriétaire du repo |
| `.gitignore` | Node, Terraform, Python, Firebase |
| `.pre-commit-config.yaml` | markdownlint + gitleaks |
| `ci.yml` | lint + format + test + build, via `npm run --if-present` |

## Ce qu'il ne génère pas

`CONTRIBUTING.md`, `SECURITY.md` et les templates d'issue et de PR sont hérités du repo
d'organisation `techtown-fr/.github`. Les dupliquer par repo crée deux sources qui divergent.

La config spécifique à un stack est déléguée aux autres plugins : `astro-firebase-app`,
`firebase-deploy`, `gcp-terraform`, `brand-guidelines`.

## Pourquoi `dependabot.yml` est l'étape qui compte

Les security updates sont désactivées au niveau de l'organisation : leurs PRs ignorent
`open-pull-requests-limit` et beaucoup de repos n'ont aucune CI pour les valider. Ce fichier est
donc le seul mécanisme de suivi de versions d'un repo. Sans lui, aucune montée de version
n'arrive jamais — et l'absence ne produit aucune erreur.

## Rappel infra

Comptes de service, bindings IAM, bindings Workload Identity et accès au bucket
`techtown-tfstate` sont déclarés dans `techtown-fr/techtown-infra`, jamais créés à la main.

Le pool Workload Identity est scopé par repo : un repo dont la CI s'authentifie à GCP doit
figurer dans `github_actions_repo` côté `techtown-infra`, sinon l'étape `auth` échoue.
