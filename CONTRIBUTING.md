# Contribuer au TechTown Marketplace

## Structure d'un plugin

```
plugins/<name>/
├── .claude-plugin/
│   └── plugin.json          # Manifest (name, version, description, keywords)
├── skills/
│   └── <name>/
│       └── SKILL.md         # Instructions agent (frontmatter YAML + contenu)
├── templates/               # Fichiers à copier dans les projets (optionnel)
└── README.md                # Documentation du plugin
```

## Règle de synchronisation (CRITIQUE)

Ces 3 champs doivent être identiques dans les 3 fichiers :

| Champ | `plugin.json` | `marketplace.json` | `SKILL.md` frontmatter |
|-------|--------------|-------------------|----------------------|
| `name` | ✅ | ✅ (dans `plugins[]`) | ✅ |
| `version` | ✅ | ✅ | — |
| `description` | ✅ | ✅ | ✅ |

## Créer un nouveau plugin

1. Créer `plugins/<name>/` avec la structure ci-dessus
2. Écrire `plugin.json` :
   ```json
   {
     "name": "<name>",
     "version": "1.0.0",
     "description": "Description courte du plugin. Inclure les triggers d'activation.",
     "keywords": ["keyword1", "keyword2"],
     "author": { "name": "TechTown", "email": "team@techtown.fr" }
   }
   ```
3. Écrire `skills/<name>/SKILL.md` avec frontmatter YAML :
   ```yaml
   ---
   name: <name>
   description: Même description que plugin.json. USE WHEN ...
   allowed-tools: Read, Write, Bash, Edit, AskUserQuestion
   ---
   ```
4. Ajouter l'entrée dans `.claude-plugin/marketplace.json` → tableau `plugins`
5. Valider : `jq . .claude-plugin/marketplace.json`
6. Créer une PR avec label `new-plugin`

## Versioning

- `1.0.0` → release initiale
- `1.x.0` → nouvelles fonctionnalités
- `1.0.x` → correctifs

## Checklist PR

- [ ] `plugin.json`, `marketplace.json` et `SKILL.md` synchronisés (name, description)
- [ ] `jq . .claude-plugin/marketplace.json` → pas d'erreur JSON
- [ ] `README.md` du plugin rédigé
- [ ] Templates présents si le plugin en génère
