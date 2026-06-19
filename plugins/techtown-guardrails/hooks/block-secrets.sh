#!/usr/bin/env bash
# TechTown guardrail — bloque l'écriture/édition de fichiers de secrets.
# PreToolUse (Write|Edit) : lit le JSON sur stdin, refuse si le chemin cible
# est un fichier sensible (.env réel, service-account, credentials).
set -euo pipefail

input=$(cat)
fp=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$fp" ] && exit 0

base=$(basename "$fp")

deny() {
  reason=$(jq -Rn --arg m "$1" '$m')
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}\n' "$reason"
  exit 0
}

# Autorise explicitement les fichiers d'exemple / template
case "$base" in
  *.example|*.sample|*.template|*.dist) exit 0 ;;
esac

# Bloque les fichiers d'environnement réels
case "$base" in
  .env|.env.*) deny "TechTown guardrail : écriture d'un fichier .env bloquée (risque de secret). Utilise .env.example pour les valeurs partagées." ;;
esac

# Bloque les fichiers de credentials / service accounts
case "$base" in
  *service-account*.json|*serviceaccount*.json|*credentials*.json|*-sa.json|gha-creds-*.json)
    deny "TechTown guardrail : écriture d'un fichier de credentials/service-account bloquée." ;;
esac

exit 0
