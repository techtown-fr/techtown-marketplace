---
name: reporting
description: Generate TechTown-branded standalone HTML reports with Chart.js visualizations, dark/light mode toggle, and Puppeteer PDF export (A4). USE WHEN creating client deliverables, rapport client, livrable HTML, audit report, reporting TechTown, tableau de bord, dashboard, or any branded HTML report.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# Reporting — TechTown

Génère des rapports HTML standalone brandés TechTown, exportables en PDF via Puppeteer.

## Structure d'un rapport

Copier `templates/report.html` et adapter :

1. **`<title>`** — Titre du rapport
2. **`.report-header`** — Titre, sous-titre, date, client
3. **Sections** — Ajouter des `<section class="report-section">` avec du contenu
4. **Graphiques** — Utiliser les helpers Chart.js de `chart-helpers.js`
5. **Export PDF** — Lancer `puppeteer-export.ts`

## Conventions de contenu

- Titre court et précis (ex: "Audit SEO — Acme Corp — Juin 2026")
- Date au format `DD/MM/YYYY`
- Sections numérotées (Synthèse → Détails → Recommandations)
- Graphiques pour les métriques clés (max 2 par section)
- Page de synthèse en premier, détails ensuite

## Export PDF

```bash
# Installer puppeteer si absent
npm install puppeteer

# Exporter (fichier HTML doit être accessible par chemin absolu)
bun puppeteer-export.ts report.html rapport-client.pdf
```

## Invariants

- `printBackground: true` et `preferCSSPageSize: true` — toujours
- CSS `-webkit-print-color-adjust: exact` présent dans le HTML
- Rapport auto-contenu (zero dépendance externe, CDN inclus inline si possible)
- Police : Poppins via Google Fonts (seule exception réseau autorisée)
