# techtown-guardrails

Plugin de garde-fous de sécurité pour les projets TechTown. **Plugin hooks-only** (pas de skill).

## Hooks

| Hook | Event | Effet |
|------|-------|-------|
| `block-secrets.sh` | `PreToolUse` `Write\|Edit` | **Bloque** l'écriture/édition de `.env` (réel), `*service-account*.json`, `*credentials*.json`, `*-sa.json`, `gha-creds-*.json`. Autorise `*.example`, `*.sample`, `*.template`, `*.dist`. |
| `terraform-fmt.sh` | `PostToolUse` `Write\|Edit` | Applique `terraform fmt` après édition d'un `.tf`/`.tfvars`. No-op silencieux sinon ou si `terraform` absent. Ne bloque jamais. |

## Dépendances

- `jq` (parsing du payload hook sur stdin)
- `terraform` (optionnel — le hook fmt est no-op s'il est absent)

## Installation

```
claude plugin marketplace add techtown-fr/techtown-marketplace
claude plugin install techtown-guardrails@techtown-marketplace
```

## Déploiement org (managed settings)

```json
{
  "enabledPlugins": { "techtown-guardrails@techtown-marketplace": true }
}
```

Un plugin force-activé via `enabledPlugins` managé voit ses hooks chargés même sous `allowManagedHooksOnly` — canal officiel de distribution de hooks vettés à l'échelle de l'org.
