#!/usr/bin/env bash
# TechTown guardrail — applique `terraform fmt` après édition d'un fichier Terraform.
# PostToolUse (Write|Edit) : no-op silencieux si ce n'est pas un .tf/.tfvars
# ou si terraform n'est pas installé. Ne bloque jamais.
set -euo pipefail

input=$(cat)
fp=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -z "$fp" ] && exit 0

case "$fp" in
  *.tf|*.tfvars) ;;
  *) exit 0 ;;
esac

command -v terraform >/dev/null 2>&1 || exit 0
terraform fmt "$fp" >/dev/null 2>&1 || true
exit 0
