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
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%231C62ED'/%3E%3Ctext x='50' y='72' text-anchor='middle' font-size='62' font-family='sans-serif' font-weight='700' fill='white'%3ET%3C/text%3E%3C/svg%3E" />
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
