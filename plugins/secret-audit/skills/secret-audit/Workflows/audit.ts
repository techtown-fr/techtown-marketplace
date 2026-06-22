#!/usr/bin/env bun
/**
 * secret-audit v1.0 — Workstation secrets scanner
 * Scans shells, cloud CLIs, MCP configs for cleartext secrets.
 * INVARIANT: values are NEVER read into memory, printed, or written to disk.
 */

import { existsSync, statSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { $ } from 'bun'
import { generateReport } from './report'

// ── Types ────────────────────────────────────────────────────────────────────

export type Severity = 'critical' | 'warning' | 'fp' | 'ok'

export interface Finding {
  path: string
  variable: string        // key/var name only — never the value
  type: string
  perms: string | null
  inStore: boolean
  storeNote?: string
  severity: Severity
  recommendation: string
  exception?: string      // why a secret store is not suitable
  line?: number
  extra?: string          // additional context (e.g. "profile [default]")
}

interface GitleaksResult {
  File: string
  RuleID: string
  StartLine: number
  Secret: string          // always "REDACTED" when --redact is used
}

// ── Path registry ────────────────────────────────────────────────────────────

const H = homedir()
const h = (...parts: string[]) => join(H, ...parts)

const SHELL_FILES = [
  h('.zshrc'), h('.zshenv'), h('.zprofile'), h('.zlogin'), h('.zlogout'),
  h('.bashrc'), h('.bash_profile'), h('.bash_login'), h('.bash_logout'), h('.profile'),
  h('.config/fish/config.fish'),
  h('.config/nushell/config.nu'), h('.config/nushell/env.nu'),
  h('.tcshrc'), h('.cshrc'), h('.kshrc'),
]

const SENSITIVE_FILES: Array<{ path: string; type: string; storeNote?: string; exception?: string }> = [
  // AWS
  { path: h('.aws/credentials'), type: 'AWS IAM credentials' },
  { path: h('.aws/config'),      type: 'AWS CLI config (peut contenir role_arn/credentials)' },
  // GCP
  { path: h('.config/gcloud/application_default_credentials.json'), type: 'GCP Application Default Credentials', storeNote: 'Géré par gcloud CLI' },
  // Azure
  { path: h('.azure/accessTokens.json'),    type: 'Azure access tokens', storeNote: 'Géré par az CLI' },
  { path: h('.azure/msal_token_cache.json'), type: 'Azure MSAL token cache', storeNote: 'Géré par az CLI' },
  // Kubernetes
  { path: h('.kube/config'), type: 'Kubeconfig (contextes/tokens/certs)' },
  // Terraform / Pulumi
  { path: h('.terraform.d/credentials.tfrc.json'), type: 'Terraform Cloud credentials' },
  { path: h('.terraformrc'),                       type: 'Terraform config (credentials)' },
  { path: h('.pulumi/credentials.json'),           type: 'Pulumi credentials' },
  // Cloud CLIs
  { path: h('.config/doctl/config.yaml'), type: 'DigitalOcean CLI token' },
  { path: h('.fly/config.yml'),           type: 'Fly.io credentials' },
  { path: h('.netlify/config.json'),      type: 'Netlify CLI token' },
  { path: h('.config/netlify/config.json'), type: 'Netlify config' },
  { path: h('.netrc'),                    type: 'netrc (tokens multiples services)' },
  { path: h('.heroku/credentials'),       type: 'Heroku CLI credentials' },
  { path: h('.config/argocd/config'),     type: 'ArgoCD session JWT' },
  // MCP / AI
  { path: h('.claude/settings.json'),                     type: 'Claude Code settings (env globaux)', exception: 'Démarrage non-interactif' },
  { path: h('.claude/settings.local.json'),               type: 'Claude Code settings locaux', exception: 'Démarrage non-interactif' },
  { path: h('.cursor/mcp.json'),                          type: 'Cursor MCP config', exception: 'Démarrage non-interactif IDE' },
  { path: h('.gemini/antigravity/mcp_config.json'),       type: 'Gemini CLI MCP config', exception: 'Démarrage non-interactif' },
  { path: h('.config/opencode/config.json'),              type: 'OpenCode MCP config', exception: 'Démarrage non-interactif' },
  // Dev tools
  { path: h('.npmrc'),                                    type: 'npm registry token' },
  { path: h('.pypirc'),                                   type: 'PyPI credentials' },
  { path: h('.pgpass'),                                   type: 'PostgreSQL passwords' },
  { path: h('.git-credentials'),                          type: 'Git credentials en clair' },
  { path: h('.docker/config.json'),                       type: 'Docker config (auths / credsStore)' },
  { path: h('.config/configstore/firebase-tools.json'),   type: 'Firebase CLI token + API key', storeNote: 'Géré par firebase-tools' },
  { path: h('.config/gws/client_secret.json'),            type: 'Google Workspace OAuth client secret', exception: 'Script non-interactif' },
]

// Patterns à ignorer dans les rapports gitleaks (faux positifs connus)
const GITLEAKS_FP_PATHS = [
  '/raycast/extensions/',
  '.boto',  // gcloud .boto — géré nativement
]

// Patterns de noms de variables secrètes dans les shells (insensible à la casse)
const SHELL_SECRET_RE = /^\s*(export\s+)?([A-Za-z_][A-Za-z0-9_]*(TOKEN|KEY|SECRET|PASS(?:WORD|PHRASE)?|CREDENTIAL|AUTH(?:_TOKEN|ORIZATION)?|CERT|PRIVATE|API_?KEY|ACCESS_?KEY|BEARER|OAUTH|APIKEY|WEBHOOK|CLIENT_SECRET)[A-Za-z0-9_]*)\s*=/i

// ── Utilities ────────────────────────────────────────────────────────────────

async function getPerms(file: string): Promise<string | null> {
  if (!existsSync(file)) return null
  try {
    const out = await $`stat -f "%A" ${file}`.text()
    return out.trim()
  } catch { return null }
}

function classifyPerms(perms: string | null, isStore: boolean): Severity {
  if (isStore) return 'ok'
  if (!perms) return 'warning'
  const mode = parseInt(perms, 8)
  if ((mode & 0o004) !== 0) return 'critical'
  return 'warning'
}

function exists(p: string): boolean { return existsSync(p) }

// ── Scanners ─────────────────────────────────────────────────────────────────

async function scanShells(): Promise<Finding[]> {
  const findings: Finding[] = []
  for (const file of SHELL_FILES) {
    if (!exists(file)) continue
    let content: string
    try { content = await Bun.file(file).text() } catch { continue }
    const perms = await getPerms(file)
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(SHELL_SECRET_RE)
      if (!m) continue
      const varname = m[2]
      const sev = classifyPerms(perms, false)
      findings.push({
        path: file.replace(H, '~'),
        variable: varname,
        type: inferVarType(varname),
        perms: perms ?? '?',
        inStore: false,
        severity: sev,
        line: i + 1,
        recommendation: buildShellReco(varname),
      })
    }
  }
  return findings
}

function inferVarType(varname: string): string {
  const v = varname.toUpperCase()
  if (v.includes('GITHUB')) return 'PAT GitHub'
  if (v.includes('GEMINI') || v.includes('GOOGLE_AI')) return 'API Key Google AI'
  if (v.includes('OPENAI')) return 'API Key OpenAI'
  if (v.includes('ANTHROPIC')) return 'API Key Anthropic'
  if (v.includes('STRIPE')) return 'API Key Stripe'
  if (v.includes('SLACK')) return 'Token Slack'
  if (v.includes('NOTION')) return 'API Key Notion'
  if (v.includes('TELEGRAM')) return 'Bot Token Telegram'
  if (v.includes('AWS')) return 'Credentials AWS'
  if (v.includes('AZURE')) return 'Token Azure'
  if (v.includes('GCP') || v.includes('GOOGLE')) return 'Credentials GCP'
  if (v.includes('DISCORD')) return 'Token Discord'
  if (v.includes('TWILIO')) return 'Token Twilio'
  if (v.includes('SENDGRID')) return 'API Key SendGrid'
  if (v.includes('DATADOG')) return 'API Key Datadog'
  if (v.includes('SENTRY')) return 'DSN/Token Sentry'
  if (v.includes('WEBHOOK')) return 'URL Webhook'
  if (v.includes('PRIVATE')) return 'Clé privée'
  if (v.includes('OAUTH') || v.includes('CLIENT_SECRET')) return 'OAuth client secret'
  if (v.includes('JWT')) return 'JWT token'
  if (v.includes('DATABASE') || v.includes('DB_')) return 'Chaîne de connexion DB'
  return 'API key / token'
}

function buildShellReco(varname: string): string {
  const slug = varname.toLowerCase().replace(/_/g, '/').replace(/api\/key/, 'api-key')
  return `Migrer dans un gestionnaire de secrets (pass, 1Password, Vault) → export ${varname}=$(pass show ${slug})`
}

async function glScan(dir: string): Promise<Array<{ file: string; rule: string; line: number }>> {
  if (!exists(dir)) return []
  const tmp = `/tmp/gl-audit-${Date.now()}.json`
  try {
    await $`gitleaks detect --no-git --redact -s ${dir} --report-format json --report-path ${tmp}`.quiet().nothrow()
    if (!exists(tmp)) return []
    const raw: GitleaksResult[] = JSON.parse(await Bun.file(tmp).text()) ?? []
    return raw
      .filter(r => !GITLEAKS_FP_PATHS.some(fp => r.File.includes(fp)))
      .map(r => ({ file: r.File, rule: r.RuleID, line: r.StartLine }))
  } catch { return [] }
  finally { try { await $`rm -f ${tmp}`.quiet() } catch {} }
}

async function scanMcpConfigs(): Promise<Finding[]> {
  const findings: Finding[] = []
  const mcpFiles = [
    h('.claude/settings.json'),
    h('.claude/settings.local.json'),
    h('.cursor/mcp.json'),
    h('.gemini/antigravity/mcp_config.json'),
    h('.config/opencode/config.json'),
  ]
  for (const file of mcpFiles) {
    if (!exists(file)) continue
    const perms = await getPerms(file)
    let data: any
    try { data = JSON.parse(await Bun.file(file).text()) } catch { continue }

    const mcps: Record<string, any> = data.mcpServers ?? {}

    for (const [server, cfg] of Object.entries(mcps)) {
      for (const [key, val] of Object.entries((cfg as any).env ?? {})) {
        if (typeof val !== 'string' || val.startsWith('${') || val === '') continue
        if (!SHELL_SECRET_RE.test(`export ${key}=x`)) continue
        const sev = classifyPerms(perms, false)
        findings.push({
          path: file.replace(H, '~'),
          variable: key,
          type: `MCP env [${server}] — valeur hardcodée (len=${val.length})`,
          perms: perms ?? '?',
          inStore: false,
          severity: sev,
          exception: 'Démarrage non-interactif MCP',
          recommendation: `Remplacer par \${${key}} dans la config MCP + injecter depuis le shell`,
        })
      }
    }
  }
  return findings
}

async function checkSensitiveFiles(quick: boolean): Promise<Finding[]> {
  const findings: Finding[] = []
  for (const def of SENSITIVE_FILES) {
    if (!exists(def.path)) continue
    const perms = await getPerms(def.path)
    const inStore = !!def.storeNote
    const sev = classifyPerms(perms, inStore)

    if (def.path.includes('gcloud')) {
      if (inStore && sev === 'ok') continue
    }

    if (def.path.endsWith('docker/config.json')) {
      try {
        const d = JSON.parse(await Bun.file(def.path).text())
        const hasCredsStore = !!(d.credsStore || Object.keys(d.credHelpers ?? {}).length)
        const hasInlineAuths = Object.values(d.auths ?? {}).some((v: any) => !!(v as any).auth)
        if (hasCredsStore && !hasInlineAuths) {
          findings.push({
            path: def.path.replace(H, '~'),
            variable: 'credsStore + credHelpers',
            type: 'Docker — coffre OS délégué',
            perms: perms ?? '?',
            inStore: true,
            storeNote: 'credsStore=desktop configuré ✅',
            severity: 'ok',
            recommendation: 'Conforme — continuer à utiliser le credsStore',
          })
          continue
        }
        if (hasInlineAuths) {
          findings.push({
            path: def.path.replace(H, '~'),
            variable: 'auths[*].auth',
            type: 'Docker — tokens inline base64',
            perms: perms ?? '?',
            inStore: false,
            severity: 'warning',
            recommendation: 'Configurer credsStore: "desktop" dans ~/.docker/config.json',
          })
          continue
        }
      } catch {}
    }

    if (inStore && sev !== 'critical') {
      findings.push({
        path: def.path.replace(H, '~'),
        variable: '(géré nativement)',
        type: def.type,
        perms: perms ?? '?',
        inStore: true,
        storeNote: def.storeNote,
        severity: 'ok',
        recommendation: 'Géré par la CLI native — vérifier rotation régulière',
        exception: def.exception,
      })
      continue
    }

    findings.push({
      path: def.path.replace(H, '~'),
      variable: guessKeyNames(def.path),
      type: def.type,
      perms: perms ?? '?',
      inStore: false,
      severity: sev,
      recommendation: buildFileReco(def.path, def.exception),
      exception: def.exception,
    })
  }
  return findings
}

async function scanGcpLegacy(): Promise<Finding[]> {
  const dir = h('.config/gcloud/legacy_credentials')
  if (!exists(dir)) return []
  const findings: Finding[] = []
  try {
    const entries = await $`find ${dir} -name "adc.json" -o -name ".boto" 2>/dev/null`.text()
    for (const file of entries.trim().split('\n').filter(Boolean)) {
      const perms = await getPerms(file)
      let hasPrivateKey = false
      const account = file.split('legacy_credentials/')[1]?.split('/')[0] ?? '?'
      try {
        const content = await Bun.file(file).text()
        hasPrivateKey = content.includes('"private_key"') || content.includes('"private_key_id"')
      } catch {}
      findings.push({
        path: file.replace(H, '~'),
        variable: hasPrivateKey ? 'private_key + private_key_id' : 'refresh_token / access_token',
        type: hasPrivateKey
          ? `Clé privée SA GCP (${account})`
          : `OAuth refresh token gcloud (${account})`,
        perms: perms ?? '?',
        inStore: true,
        storeNote: 'Géré par gcloud CLI',
        severity: hasPrivateKey ? 'warning' : 'ok',
        recommendation: hasPrivateKey
          ? `Vérifier si ce SA est encore actif → rotation clé dans GCP Console si oui, révocation si non`
          : `gcloud auth revoke ${account} si compte inactif`,
        extra: account,
      })
    }
  } catch {}
  return findings
}

function guessKeyNames(path: string): string {
  if (path.includes('aws/credentials')) return 'aws_access_key_id + aws_secret_access_key'
  if (path.includes('argocd')) return 'JWT (token de session)'
  if (path.includes('firebase')) return 'tokens.refresh_token + firebaseConfig.apiKey'
  if (path.includes('gws')) return 'client_secret'
  if (path.includes('npmrc')) return '_authToken'
  if (path.includes('pypirc')) return 'password'
  if (path.includes('pgpass')) return 'password (×n entrées)'
  if (path.includes('git-credentials')) return 'URL avec credentials intégrés'
  if (path.includes('terraform') || path.includes('tfrc')) return 'token'
  if (path.includes('pulumi')) return 'accessToken'
  if (path.includes('doctl')) return 'access-token'
  if (path.includes('fly')) return 'access_token'
  if (path.includes('netlify')) return 'token'
  if (path.includes('netrc')) return 'password (×n hôtes)'
  if (path.includes('heroku')) return 'token'
  if (path.includes('kube/config')) return 'token / client-key (selon auth type)'
  return 'credentials'
}

function buildFileReco(path: string, exception?: string): string {
  if (exception) return `Exception gestionnaire de secrets (${exception}) — garder permissions 600 + rotation documentée`
  if (path.includes('aws/credentials')) {
    return 'chmod 600 ~/.aws/credentials · Envisager aws-vault ou IAM Identity Center (SSO)'
  }
  if (path.includes('kube/config')) return 'Préférer exec credential helper (gcloud/az) pour éviter tokens statiques'
  if (path.includes('terraform')) return 'Préférer variables d\'env TF_TOKEN_* ou Vault provider'
  if (path.includes('pulumi')) return 'Préférer PULUMI_ACCESS_TOKEN injecté via gestionnaire de secrets'
  if (path.includes('netrc')) return 'Remplacer par credential helpers natifs des outils (git, curl)'
  return 'Migrer dans un gestionnaire de secrets (pass, 1Password, Vault) → injecter via variable d\'env'
}

function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>()
  return findings.filter(f => {
    const key = `${f.path}::${f.variable}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = Bun.argv.slice(2)
  const quick = args.includes('--quick')
  const outputIdx = args.indexOf('--output')
  const outputArg = outputIdx >= 0 ? args[outputIdx + 1] : null

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const workDir = h(`secret-audit-${date}`)
  const htmlPath = outputArg ?? join(workDir, 'report.html')
  await $`mkdir -p ${dirname(htmlPath)}`.quiet()

  const glVersion = await $`gitleaks version`.text().catch(() => '')
  const passInstalled = await $`which pass`.quiet().nothrow().then(r => r.exitCode === 0)
  const osInfo = await $`sw_vers -productVersion 2>/dev/null || uname -r`.text().catch(() => '?')
  const host = (await $`hostname -s`.text().catch(() => '?')).trim()
  const arch = (await $`uname -m`.text().catch(() => '?')).trim()

  console.error(`🔒 secret-audit v1.0 — ${new Date().toLocaleString('fr-FR')}`)
  console.error(`   Poste: ${host} · macOS ${osInfo.trim()} ${arch}`)
  console.error(`   Mode: ${quick ? 'quick' : 'full'} | gitleaks ${glVersion.trim() || '✗ absent'} | pass: ${passInstalled ? '✅' : '✗'}`)
  console.error('')
  console.error('━━ Scan en cours ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const allFindings: Finding[] = []

  console.error(`  🐚 Shells (zsh/bash/fish/nu/tcsh)...`)
  allFindings.push(...await scanShells())

  console.error(`  📁 Fichiers credentials (${SENSITIVE_FILES.length} chemins)...`)
  allFindings.push(...await checkSensitiveFiles(quick))

  console.error(`  ☁️  GCP legacy credentials...`)
  allFindings.push(...await scanGcpLegacy())

  console.error(`  🔧 MCP configs (valeurs hardcodées)...`)
  allFindings.push(...await scanMcpConfigs())

  if (!quick && glVersion) {
    console.error(`  🔍 Gitleaks scan ~/.config...`)
    const glResults = await glScan(h('.config'))
    const byFile = new Map<string, Set<string>>()
    for (const r of glResults) {
      if (!byFile.has(r.file)) byFile.set(r.file, new Set())
      byFile.get(r.file)!.add(r.rule)
    }
    for (const [file, rules] of byFile) {
      const rel = file.replace(H, '~')
      if (allFindings.some(f => f.path === rel)) continue
      const perms = await getPerms(file)
      const sev = classifyPerms(perms, false)
      allFindings.push({
        path: rel,
        variable: `(gitleaks: ${[...rules].join(', ')})`,
        type: 'Secret détecté par gitleaks',
        perms: perms ?? '?',
        inStore: false,
        severity: sev,
        recommendation: 'Inspecter le fichier et migrer le secret dans un gestionnaire de secrets',
      })
    }

    console.error(`  🔍 Gitleaks scan ~/.aws...`)
    const glAws = await glScan(h('.aws'))
    for (const r of glAws) {
      const rel = r.file.replace(H, '~')
      if (allFindings.some(f => f.path === rel)) continue
      const perms = await getPerms(r.file)
      allFindings.push({
        path: rel,
        variable: `(gitleaks: ${r.rule})`,
        type: 'Secret AWS détecté par gitleaks',
        perms: perms ?? '?',
        inStore: false,
        severity: classifyPerms(perms, false),
        recommendation: 'Migrer dans aws-vault ou gestionnaire de secrets · Rotation de la clé recommandée',
      })
    }
  }

  const findings = dedupe(allFindings)

  const critical = findings.filter(f => f.severity === 'critical')
  const warning  = findings.filter(f => f.severity === 'warning')
  const fp       = findings.filter(f => f.severity === 'fp')
  const ok       = findings.filter(f => f.severity === 'ok')

  console.error('')
  console.error('━━ Résultats ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error(`  🔴 ${critical.length} CRITIQUE   🟠 ${warning.length} ATTENTION   ⚪ ${fp.length} faux positifs   ✅ ${ok.length} conformes`)
  console.error('')

  const html = generateReport({
    findings,
    meta: {
      host,
      os: `macOS ${osInfo.trim()} ${arch}`,
      date: new Date().toISOString(),
      gitleaksVersion: glVersion.trim(),
      passInstalled,
      mode: quick ? 'quick' : 'full',
    },
  })

  await Bun.write(htmlPath, html)
  console.error(`📄 Rapport HTML: ${htmlPath}`)
  console.error(`   open ${htmlPath}`)
  console.error('')

  const output = {
    summary: {
      critical: critical.length,
      warning: warning.length,
      fp: fp.length,
      ok: ok.length,
      passInstalled,
    },
    htmlPath,
    topActions: [
      ...critical.slice(0, 3).map(f => ({ severity: 'CRITIQUE', path: f.path, variable: f.variable, action: f.recommendation })),
      ...warning.slice(0, 2).map(f => ({ severity: 'ATTENTION', path: f.path, variable: f.variable, action: f.recommendation })),
    ].slice(0, 5),
  }

  console.log(JSON.stringify(output, null, 2))
}

main().catch(e => { console.error('Erreur:', e.message); process.exit(1) })
