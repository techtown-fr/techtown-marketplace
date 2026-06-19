#!/usr/bin/env bun
/**
 * Génère la page vitrine du Marketplace depuis .claude-plugin/marketplace.json.
 * Source de vérité unique : marketplace.json. Sortie : dist/index.html.
 *
 * Usage : bun scripts/build-site.ts [--out dist]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKETPLACE_JSON = join(ROOT, ".claude-plugin", "marketplace.json");

interface Plugin {
  name: string;
  description: string;
  version: string;
  keywords?: string[];
}
interface Marketplace {
  name: string;
  owner: { name: string; email: string };
  plugins: Plugin[];
}

/** Échappe les caractères HTML sensibles dans une valeur dynamique. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function loadMarketplace(): Marketplace {
  let raw: string;
  try {
    raw = readFileSync(MARKETPLACE_JSON, "utf-8");
  } catch {
    throw new Error(`marketplace.json introuvable : ${MARKETPLACE_JSON}`);
  }
  let data: Marketplace;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`marketplace.json invalide : ${(e as Error).message}`);
  }
  if (!Array.isArray(data.plugins) || data.plugins.length === 0) {
    throw new Error("marketplace.json ne contient aucun plugin");
  }
  data.plugins.forEach((p, i) => {
    for (const field of ["name", "description", "version"] as const) {
      if (typeof p?.[field] !== "string" || p[field].length === 0) {
        throw new Error(
          `plugin #${i} (${p?.name ?? "?"}) : champ "${field}" manquant ou invalide`,
        );
      }
    }
  });
  return data;
}

function renderCard(plugin: Plugin, marketplaceName: string): string {
  const installCmd = `claude plugin install ${plugin.name}@${marketplaceName}`;
  const chips = (plugin.keywords ?? [])
    .map((k) => `<span class="chip">${esc(k)}</span>`)
    .join("");
  return `
      <article class="card">
        <div class="card__head">
          <h3 class="card__name">${esc(plugin.name)}</h3>
          <span class="badge">v${esc(plugin.version)}</span>
        </div>
        <p class="card__desc">${esc(plugin.description)}</p>
        <div class="chips">${chips}</div>
        <div class="install">
          <code class="install__cmd">${esc(installCmd)}</code>
          <button class="install__copy" type="button" data-copy="${esc(installCmd)}" aria-label="Copier la commande">Copier</button>
        </div>
      </article>`;
}

function renderHtml(mkt: Marketplace): string {
  const addCmd = `claude plugin marketplace add techtown-fr/${mkt.name}`;
  const cards = mkt.plugins.map((p) => renderCard(p, mkt.name)).join("\n");
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TechTown Claude Code Marketplace</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 183 183'%3E%3Crect width='183' height='183' rx='32' fill='white'/%3E%3Cg transform='translate(33.25 0)'%3E%3Cpath d='M48.6 78.6H32.3V45.5c9 0 16.3-7.3 16.3-16.3V11.4h40.9v34.2h26.8v33.1H89.5v59.7c0 7.7 3.4 10.9 12.4 10.9h14.6v33.8H95.7c-27.8 0-47.1-11.4-47.1-45.2z' fill='%231d1d1b'/%3E%3Ccircle cx='16.8' cy='16.8' r='16.8' fill='%231c63ed'/%3E%3C/g%3E%3C/svg%3E" />
  <meta name="description" content="Catalogue des plugins Claude Code internes TechTown — ${mkt.plugins.length} plugins pour les workflows de l'équipe." />
  <meta property="og:title" content="TechTown Claude Code Marketplace" />
  <meta property="og:description" content="${mkt.plugins.length} plugins Claude Code pour les collaborateurs TechTown." />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --color-primary: #1C62ED;
      --color-primary-dark: #1557D6;
      --color-accent: #3B7EFF;
      --color-bg: #FFFFFF;
      --color-bg-alt: #F9FAFB;
      --color-text: #1F2937;
      --color-text-light: #6B7280;
      --color-border: #E5E7EB;
      --radius: 0.5rem;
      --radius-lg: 1rem;
      --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --max-width: 1200px;
      --font: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-primary: #3B7EFF;
        --color-bg: #0F172A;
        --color-bg-alt: #1E293B;
        --color-text: #F1F5F9;
        --color-text-light: #94A3B8;
        --color-border: #334155;
      }
      .tt-fg { fill: #F1F5F9; }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: var(--font);
      font-weight: 400;
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-bg);
    }
    .container { max-width: var(--max-width); margin: 0 auto; padding: 0 1.5rem; }
    .topbar { background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
    .topbar .container { display: flex; align-items: center; padding-top: 1rem; padding-bottom: 1rem; }
    .brand-logo { height: 30px; width: auto; display: block; }
    .tt-fg { fill: #1d1d1b; }
    .tt-dot { fill: #1c63ed; }
    header.hero {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: #fff;
      padding: 4rem 0 3rem;
    }
    .hero h1 { font-size: clamp(1.875rem, 5vw, 3rem); font-weight: 700; margin: 0 0 0.5rem; }
    .hero p { font-size: 1.125rem; opacity: 0.92; margin: 0 0 2rem; max-width: 46rem; }
    .hero .add {
      display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;
      background: rgb(255 255 255 / 0.12); border: 1px solid rgb(255 255 255 / 0.25);
      border-radius: var(--radius); padding: 0.75rem 1rem; max-width: 100%;
    }
    .hero .add code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.95rem; word-break: break-all; color: #fff;
    }
    .hero .add button {
      margin-left: auto; background: #fff; color: var(--color-primary);
      border: none; border-radius: var(--radius); padding: 0.4rem 0.9rem;
      font-family: var(--font); font-weight: 500; cursor: pointer; transition: opacity 0.2s ease;
    }
    .hero .add button:hover { opacity: 0.85; }
    main { padding: 3rem 0 4rem; }
    .section-title { font-size: 1.875rem; font-weight: 600; margin: 0 0 2rem; }
    .grid {
      display: grid; gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    .card {
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow);
      display: flex; flex-direction: column; gap: 0.75rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .card__head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .card__name { font-size: 1.25rem; font-weight: 600; margin: 0; color: var(--color-primary); }
    .badge {
      font-size: 0.75rem; font-weight: 500; color: var(--color-text-light);
      border: 1px solid var(--color-border); border-radius: 999px; padding: 0.1rem 0.6rem; white-space: nowrap;
    }
    .card__desc { margin: 0; color: var(--color-text-light); font-size: 0.95rem; flex: 1; }
    .chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .chip {
      font-size: 0.72rem; color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      border-radius: 999px; padding: 0.15rem 0.55rem;
    }
    .install { display: flex; align-items: stretch; gap: 0.5rem; margin-top: 0.25rem; }
    .install__cmd {
      flex: 1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.82rem; background: var(--color-bg); border: 1px solid var(--color-border);
      border-radius: var(--radius); padding: 0.5rem 0.7rem; color: var(--color-text);
      overflow-x: auto; white-space: nowrap;
    }
    .install__copy {
      background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius);
      padding: 0 0.9rem; font-family: var(--font); font-weight: 500; font-size: 0.82rem;
      cursor: pointer; white-space: nowrap; transition: background-color 0.2s ease;
    }
    .install__copy:hover { background: var(--color-primary-dark); }
    .install__copy.copied { background: #10B981; }
    footer {
      border-top: 1px solid var(--color-border); padding: 2rem 0;
      color: var(--color-text-light); font-size: 0.85rem; text-align: center;
    }
    footer a { color: var(--color-primary); text-decoration: none; }
  </style>
</head>
<body>
  <nav class="topbar">
    <div class="container">
      <!-- Logo officiel TechTown (source publique techtown.fr) -->
      <svg class="brand-logo" role="img" aria-label="TechTown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430.5 73.7"><path class="tt-fg" d="M19.1 31h-6.5V17.7c3.6 0 6.5-2.9 6.5-6.5V4h16.2v13.7h10.6V31H35.3v24c0 3.1 1.3 4.4 4.9 4.4H46V73h-8.3C26.7 73 19 68.4 19 54.8V31Zm59.2 42.7c-15.6 0-26.8-10.3-26.8-26.9s11-26.9 26.8-26.9 26.4 10.1 26.4 26 0 3.1-.3 4.7H67.7c.6 6.8 4.8 10 10.1 10s7.1-2.2 8.4-5.1h17.3c-2.6 10.2-12 18.1-25.1 18.1ZM67.8 41.8h20.3c0-5.7-4.6-9-10-9s-9.4 3.2-10.3 9m69-21.8c13.3 0 22.7 7.2 25.4 19.7h-17.3c-1.3-3.6-4-6-8.4-6s-9.8 4.5-9.8 13.2 4 13.2 9.8 13.2 7-2.2 8.4-6h17.3c-2.8 12.1-12.1 19.7-25.4 19.7s-26.6-10.3-26.6-26.9 11-26.9 26.6-26.9m31-16.3H184v24.1c3.2-4.5 9-7.6 16.3-7.6 12.1 0 20.1 8.2 20.1 22.3V73h-16.1V44.6c0-7.1-4-11-10.2-11s-10.2 3.9-10.2 11V73h-16.2V3.7ZM232.4 31h-6.5V17.7c3.6 0 6.5-2.9 6.5-6.5V4h16.2v13.7h10.6V31h-10.6v24c0 3.1 1.3 4.4 4.9 4.4h5.8V73H251c-11 0-18.7-4.6-18.7-18.2V31Zm59.8 42.7c-15.6 0-27.3-10.3-27.3-26.9s12.1-26.9 27.5-26.9 27.5 10.3 27.5 26.9-12.1 26.9-27.7 26.9m0-13.8c5.8 0 11.2-4.2 11.2-13s-5.3-13-11-13-11 4.1-11 13 4.9 13 10.8 13m119.9-37.7c-7.1 0-10.8 3.1-14 7.5l.5-2.4 1.4-6.5h-15.3L377.3 58l-9-37.2h-17.2l-8.9 37.3-7.5-37.3h-15.2L330.9 73h19.8l8.6-33.9 8.4 33.9h20.9c0-.1 6.2-25.3 6.2-25.3 2.2-5.5 5-8.4 10.3-8.4s10.2 3.9 10.2 11V73h15.2V44.5c0-14-6.2-22.3-18.4-22.3" /><ellipse class="tt-dot" cx="6.7" cy="6.8" rx="6.7" ry="6.8" /></svg>
    </div>
  </nav>
  <header class="hero">
    <div class="container">
      <h1>TechTown Claude Code Marketplace</h1>
      <p>Catalogue des plugins Claude Code internes TechTown — ${mkt.plugins.length} plugins pour les workflows récurrents de l'équipe.</p>
      <div class="add">
        <code>${esc(addCmd)}</code>
        <button type="button" data-copy="${esc(addCmd)}" aria-label="Copier la commande">Copier</button>
      </div>
    </div>
  </header>
  <main>
    <div class="container">
      <h2 class="section-title">${mkt.plugins.length} plugins disponibles</h2>
      <div class="grid">
${cards}
      </div>
    </div>
  </main>
  <footer>
    <div class="container">
      Généré depuis <code>marketplace.json</code> — TechTown ·
      <a href="https://github.com/techtown-fr/techtown-marketplace">github.com/techtown-fr/techtown-marketplace</a>
    </div>
  </footer>
  <script>
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
          const original = btn.textContent;
          btn.textContent = "Copié ✓";
          btn.classList.add("copied");
          setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 1500);
        } catch { /* clipboard indisponible — no-op */ }
      });
    });
  </script>
</body>
</html>
`;
}

function main(): void {
  const outArgIdx = process.argv.indexOf("--out");
  if (outArgIdx > -1 && !process.argv[outArgIdx + 1]) {
    throw new Error("--out requiert un répertoire (ex. --out dist)");
  }
  const outDir = join(ROOT, outArgIdx > -1 ? process.argv[outArgIdx + 1] : "dist");
  const mkt = loadMarketplace();
  const html = renderHtml(mkt);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "index.html");
  writeFileSync(outFile, html, "utf-8");
  console.log(`✅ Page générée : ${outFile} (${mkt.plugins.length} plugins)`);
}

try {
  main();
} catch (e) {
  console.error(`❌ ${(e as Error).message}`);
  process.exit(1);
}
