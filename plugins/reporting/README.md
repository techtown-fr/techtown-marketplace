# reporting

Génère des rapports HTML standalone TechTown-brandés avec Chart.js et export PDF via Puppeteer.

## Templates fournis

| Fichier | Rôle |
|---------|------|
| `report.html` | Template de rapport complet (KPIs, tableaux, graphiques, dark mode) |
| `chart-helpers.js` | Helpers Chart.js TechTown (bar, line, doughnut) |
| `puppeteer-export.ts` | Export PDF A4 via Puppeteer (`bun puppeteer-export.ts report.html out.pdf`) |
