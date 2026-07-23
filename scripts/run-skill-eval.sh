#!/bin/sh
# Run trigger evals for a published skill.
# Usage: npm run skills:eval -- <skill-name> [extra run_eval flags]
# Example: npm run skills:eval -- singpass --runs-per-query 3
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: npm run skills:eval -- <skill-name> [run_eval flags]" >&2
  echo "" >&2
  echo "Skills with eval sets:" >&2
  for d in skills/*/evals/evals.json; do
    [ -f "$d" ] && echo "  ${d#skills/}" | sed 's|/evals/evals.json||' >&2
  done
  exit 1
fi

skill="$1"
shift

root="$(pwd)"
eval_set="$root/skills/$skill/evals/evals.json"

if [ ! -f "$eval_set" ]; then
  echo "No eval set found at skills/$skill/evals/evals.json" >&2
  exit 1
fi

cd .agents/skills/skill-creator
exec python3 -m scripts.run_eval \
  --eval-set "$eval_set" \
  --skill-path "$root/skills/$skill" \
  --verbose \
  "$@"
