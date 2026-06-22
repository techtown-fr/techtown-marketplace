/**
 * report.ts — HTML report generator for secret-audit
 * INVARIANT: no secret values are ever rendered — only names, paths, permissions.
 */

import type { Finding, Severity } from './audit'

interface ReportMeta {
  host: string
  os: string
  date: string
  gitleaksVersion: string
  passInstalled: boolean
  mode: 'full' | 'quick'
}

interface ReportInput {
  findings: Finding[]
  meta: ReportMeta
}

const SEV_LABELS: Record<Severity, string> = {
  critical: '🔴 CRITIQUE',
  warning:  '🟠 ATTENTION',
  fp:       '⚪ Faux positif',
  ok:       '✅ Conforme',
}

const SEV_CLASS: Record<Severity, string> = {
  critical: 'crit',
  warning:  'warn',
  fp:       'gray',
  ok:       'green',
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function permsClass(p: string | null): string {
  if (!p) return 'link'
  const mode = parseInt(p, 8)
  return (mode & 0o004) ? 'bad' : 'ok'
}

function renderRows(findings: Finding[]): string {
  return findings.map((f, i) => `
    <tr class="${SEV_CLASS[f.severity]}">
      <td>${i + 1}</td>
      <td>
        <span class="path">${esc(f.path)}</span>
        ${f.line ? `<br><span class="line">ligne ${f.line}</span>` : ''}
        ${f.extra ? `<br><span class="line">${esc(f.extra)}</span>` : ''}
      </td>
      <td><span class="varname">${esc(f.variable)}</span></td>
      <td>${esc(f.type)}</td>
      <td><span class="perm ${permsClass(f.perms)}">${esc(f.perms ?? '?')}</span></td>
      <td>
        ${f.inStore
          ? `<span class="coffre native">○ ${esc(f.storeNote ?? 'Coffre natif')}</span>`
          : `<span class="coffre non">✗ En clair</span>`}
      </td>
      <td><span class="sev ${SEV_CLASS[f.severity]}">${SEV_LABELS[f.severity].replace(/[🔴🟠⚪✅] /, '')}</span></td>
      <td class="reco">
        <p>${esc(f.recommendation).replace(/·/g, '<br>·')}</p>
        ${f.exception ? `<p class="exc">⚠ Exception : ${esc(f.exception)}</p>` : ''}
      </td>
    </tr>`).join('')
}

function renderSection(title: string, cls: string, findings: Finding[]): string {
  if (!findings.length) return ''
  return `
    <div class="section-title ${cls}">${esc(title)}</div>
    <div class="tbl-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th><th>Emplacement</th><th>Variable / Clé</th><th>Type</th>
          <th>Perms</th><th>Dans coffre</th><th>Sévérité</th><th>Recommandation</th>
        </tr>
      </thead>
      <tbody>${renderRows(findings)}</tbody>
    </table>
    </div>`
}

function renderActions(findings: Finding[]): string {
  const critical = findings.filter(f => f.severity === 'critical')
  const warning  = findings.filter(f => f.severity === 'warning')
  const items = [
    ...critical.map((f, i) => ({ n: `A${i + 1}`, cls: 'crit', label: `${f.path} — ${f.variable}`, body: f.recommendation })),
    ...warning.slice(0, 4).map((f, i) => ({ n: `B${i + 1}`, cls: 'warn', label: `${f.path} — ${f.variable}`, body: f.recommendation })),
  ]
  return items.map(a => `
    <div class="action-item">
      <div class="action-num ${a.cls}">${esc(a.n)}</div>
      <div class="action-body">
        <strong>${esc(a.label)}</strong>
        <div class="action-sub">${esc(a.body)}</div>
      </div>
    </div>`).join('')
}

export function generateReport({ findings, meta }: ReportInput): string {
  const critical = findings.filter(f => f.severity === 'critical')
  const warning  = findings.filter(f => f.severity === 'warning')
  const fp       = findings.filter(f => f.severity === 'fp')
  const ok       = findings.filter(f => f.severity === 'ok')
  const dateStr  = new Date(meta.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Audit Sécurité Secrets — ${esc(meta.host)} — ${dateStr}</title>
<style>
:root {
  --ground:#F2EAD3;--ground-2:#E8DFC0;--text:#1A1818;--text-dim:#5A5450;
  --ink:#0F1E3C;--accent:#B91C1C;--orange:#C26A0D;--safe:#1E6643;--gray:#888078;
  --rule:#C8BDA0;--mono:'Courier New',Courier,monospace;--serif:Georgia,'Times New Roman',serif;
  --sans:'Helvetica Neue',Arial,sans-serif;--radius:2px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:14px;background:var(--ground);color:var(--text)}
body{font-family:var(--serif);line-height:1.55;max-width:1200px;margin:0 auto;padding:0 1.5rem 4rem}
@keyframes fadein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:no-preference){body{animation:fadein .3s ease both}}
.classif-bar{background:var(--ink);color:#fff;font-family:var(--sans);font-size:.7rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;padding:.4rem 1.5rem;display:flex;align-items:center;gap:1rem;margin:0 -1.5rem}
.classif-bar .redact{display:inline-block;background:#fff;color:#fff;height:.7em;width:3.5rem;border-radius:1px}
.classif-bar span{opacity:.5}
.doc-header{border-bottom:2px solid var(--ink);padding:2rem 0 1.6rem;display:grid;grid-template-columns:1fr auto;gap:1.5rem;align-items:start}
.doc-header h1{font-family:var(--sans);font-size:1.65rem;font-weight:700;letter-spacing:-.02em;color:var(--ink);line-height:1.15}
.doc-header h1 em{display:block;font-style:normal;font-size:.85rem;font-weight:400;color:var(--text-dim);letter-spacing:.04em;margin-top:.3rem;font-family:var(--sans)}
.doc-meta{font-family:var(--sans);font-size:.73rem;color:var(--text-dim);line-height:1.8;text-align:right}
.doc-meta strong{color:var(--text)}
.stamp{display:inline-block;border:3px solid var(--accent);color:var(--accent);font-family:var(--sans);font-size:.62rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;padding:.2rem .55rem;transform:rotate(-4deg);opacity:.85;margin-top:.7rem;border-radius:var(--radius)}
.notice{background:var(--ground-2);border-left:4px solid var(--ink);padding:.65rem 1rem;font-family:var(--sans);font-size:.76rem;color:var(--text-dim);margin:1.4rem 0;display:flex;align-items:center;gap:.8rem}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:.7rem;margin:1.4rem 0 2rem}
.card{background:var(--ground-2);border:1px solid var(--rule);padding:.9rem;border-radius:var(--radius);text-align:center;font-family:var(--sans)}
.card .count{font-size:2.1rem;font-weight:800;line-height:1;margin-bottom:.2rem}
.card .label{font-size:.65rem;letter-spacing:.09em;text-transform:uppercase;color:var(--text-dim)}
.card.crit{border-top:3px solid var(--accent)}.card.crit .count{color:var(--accent)}
.card.warn{border-top:3px solid var(--orange)}.card.warn .count{color:var(--orange)}
.card.safe{border-top:3px solid var(--safe)}.card.safe .count{color:var(--safe)}
.card.gray{border-top:3px solid var(--gray)}.card.gray .count{color:var(--gray)}
.section-title{display:flex;align-items:center;gap:.7rem;margin:2rem 0 .8rem;font-family:var(--sans);font-size:.7rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim)}
.section-title::before{content:'';display:block;height:1px;width:2rem;background:currentColor;flex-shrink:0}
.section-title::after{content:'';flex:1;height:1px;background:var(--rule)}
.section-title.crit{color:var(--accent)}.section-title.warn{color:var(--orange)}.section-title.safe{color:var(--safe)}
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.8rem;min-width:860px}
thead th{font-family:var(--sans);font-size:.63rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--text-dim);padding:.42rem .65rem;background:var(--ground-2);border-bottom:2px solid var(--rule);text-align:left;white-space:nowrap}
tbody tr{border-bottom:1px solid var(--rule)}
tbody tr:last-child{border-bottom:none}
tbody td{padding:.55rem .65rem;vertical-align:top;line-height:1.42}
tbody tr.crit td:first-child{border-left:3px solid var(--accent)}
tbody tr.warn td:first-child{border-left:3px solid var(--orange)}
tbody tr.gray td:first-child{border-left:3px solid var(--gray)}
tbody tr.green td:first-child{border-left:3px solid var(--safe)}
tbody tr:hover{background:rgba(0,0,0,.02)}
.path{font-family:var(--mono);font-size:.76rem;color:var(--ink);word-break:break-all}
.line{color:var(--text-dim);font-size:.7rem}
.varname{font-family:var(--mono);font-size:.78rem;font-weight:700;color:var(--ink)}
.perm{font-family:var(--mono);font-size:.73rem;display:inline-block;padding:.08rem .3rem;border-radius:var(--radius);font-weight:700;white-space:nowrap}
.perm.bad{background:#fce8e8;color:var(--accent)}.perm.ok{background:#e6f0eb;color:var(--safe)}.perm.link{background:#eee8d8;color:var(--text-dim);font-weight:400}
.sev{display:inline-block;font-family:var(--sans);font-size:.62rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:.12rem .35rem;border-radius:var(--radius);white-space:nowrap}
.sev.crit{background:var(--accent);color:#fff}.sev.warn{background:var(--orange);color:#fff}.sev.fp,.sev.gray{background:var(--gray);color:#fff}.sev.ok,.sev.green{background:var(--safe);color:#fff}
.coffre{font-family:var(--sans);font-size:.7rem;white-space:nowrap}
.coffre.non{color:var(--accent);font-weight:700}.coffre.native{color:var(--gray)}
.reco code{font-family:var(--mono);font-size:.74rem;background:var(--ground-2);padding:.08rem .28rem;border-radius:2px;border:1px solid var(--rule);white-space:nowrap;display:inline-block;margin:.08rem 0}
.reco p{margin-top:.28rem}.reco p:first-child{margin-top:0}
.exc{font-size:.7rem;color:var(--text-dim);font-style:italic}
.actions{margin:2rem 0;font-family:var(--sans);font-size:.81rem}
.actions h3{font-size:.7rem;letter-spacing:.11em;text-transform:uppercase;color:var(--text-dim);margin-bottom:.8rem;font-weight:700}
.action-item{display:grid;grid-template-columns:auto 1fr;gap:0 1rem;border-bottom:1px solid var(--rule);padding:.6rem 0;align-items:start}
.action-item:last-child{border-bottom:none}
.action-num{font-weight:800;width:2rem;font-size:.68rem;letter-spacing:.07em;text-transform:uppercase;padding-top:.1rem}
.action-num.crit{color:var(--accent)}.action-num.warn{color:var(--orange)}
.action-sub{font-size:.72rem;color:var(--text-dim);margin-top:.18rem}
details{margin:1.1rem 0}
summary{cursor:pointer;font-family:var(--sans);font-size:.76rem;font-weight:700;letter-spacing:.07em;color:var(--text-dim);padding:.45rem .65rem;background:var(--ground-2);border:1px solid var(--rule);border-radius:var(--radius);list-style:none;user-select:none}
summary::-webkit-details-marker{display:none}
summary::before{content:'▶ ';font-size:.68em}
details[open] summary::before{content:'▼ '}
details>*:not(summary){margin-top:.7rem}
.doc-footer{margin-top:2.2rem;border-top:1px solid var(--rule);padding-top:.7rem;font-family:var(--sans);font-size:.68rem;color:var(--text-dim);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.4rem}
@media(max-width:640px){.doc-header{grid-template-columns:1fr}.doc-meta{text-align:left}.summary{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>

<div class="classif-bar" role="banner">
  <span class="redact" aria-hidden="true"></span>
  CONFIDENTIEL — USAGE INTERNE TechTown EXCLUSIVEMENT
  <span>secret-audit v1.0</span>
  <span class="redact" aria-hidden="true"></span>
</div>

<header class="doc-header">
  <div>
    <h1>
      Audit sécurité — Secrets stockés en clair
      <em>Poste : ${esc(meta.host)} · ${esc(meta.os)} · ${esc(dateStr)} · Mode : ${meta.mode}</em>
    </h1>
    <div class="stamp">Confidentiel</div>
  </div>
  <div class="doc-meta">
    <strong>Outil</strong> gitleaks ${esc(meta.gitleaksVersion || '(absent)')}<br>
    <strong>Mode</strong> --no-git --redact<br>
    <strong>Périmètre</strong> shells · cloud · MCP · dev
  </div>
</header>

<div class="notice" role="note">
  <strong>Valeurs masquées partout dans ce rapport.</strong>&nbsp;
  Seuls le chemin, le nom de la variable, le type, les permissions et l'état du coffre sont affichés.
  Aucune valeur n'a été lue, transmise ou journalisée. Toute remédiation est à exécuter manuellement.
</div>

<div class="summary">
  <div class="card crit"><div class="count">${critical.length}</div><div class="label">Critique<br>644 = world-readable</div></div>
  <div class="card warn"><div class="count">${warning.length}</div><div class="label">Attention<br>600 + secret en clair</div></div>
  <div class="card safe"><div class="count">${ok.length}</div><div class="label">Conformes<br>coffre ou natif</div></div>
  <div class="card gray"><div class="count">${fp.length}</div><div class="label">Faux positifs<br>probables</div></div>
</div>

${renderSection('Critique — 644 · lisible par le groupe / tous', 'crit', critical)}
${renderSection('Attention — 600 · restreint mais secret en clair', 'warn', warning)}

${fp.length ? `<details><summary>Faux positifs probables (${fp.length})</summary>${renderSection('', 'gray', fp)}</details>` : ''}
${ok.length ? `<details><summary>Conformes — déjà dans un coffre ou mécanisme natif (${ok.length})</summary>${renderSection('', 'safe', ok)}</details>` : ''}

<div class="actions">
  <h3>Actions prioritaires · du 🔴 au 🟠</h3>
  ${renderActions(findings)}
</div>

<footer class="doc-footer">
  <div>Audit lecture seule · Aucune valeur exposée · Aucune modification effectuée · secret-audit v1.0 · TechTown</div>
  <div>gitleaks ${esc(meta.gitleaksVersion || 'absent')} · ${esc(meta.os)} · ${esc(dateStr)}</div>
</footer>

<div class="classif-bar" style="margin-top:2rem">
  <span class="redact" aria-hidden="true"></span>
  FIN DU RAPPORT — CONFIDENTIEL — USAGE INTERNE TechTown
  <span class="redact" aria-hidden="true"></span>
</div>

</body>
</html>`
}
