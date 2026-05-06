#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

[ -z "$FILE" ] && exit 0

detect_by_path() {
  local f="$1"
  if echo "$f" | grep -qE "\.(component|service|pipe|directive|guard|resolver)\.ts$"; then
    echo "dev"
  elif echo "$f" | grep -qE "test_.*\.py$|_test\.py$"; then
    echo "python-backend-tester"
  elif echo "$f" | grep -qE "(routers|schemas|models|crud|api)/.*\.py$"; then
    echo "python-backend-dev"
  elif echo "$f" | grep -qE "\.py$"; then
    echo "python-backend-dev"
  elif echo "$f" | grep -qE "\.spec\.ts$"; then
    echo "tester"
  elif echo "$f" | grep -qE "(\.github/workflows|sonar-project\.properties|Dockerfile|docker-compose|vercel\.json)"; then
    echo "devops"
  elif echo "$f" | grep -qE "\.(scss|html)$|src/app/layout/|shared/spartan/"; then
    echo "ui"
  elif echo "$f" | grep -qE "public/i18n/"; then
    echo "web-quality-enhancer"
  else
    echo ""
  fi
}

AGENT=$(detect_by_path "$FILE")
[ -z "$AGENT" ] && exit 0

python3 - "$AGENT" <<'PYEOF'
import json, sys

agent = sys.argv[1]
labels = {
  "dev": "dev (Angular 21)",
  "tester": "tester (Jest/Playwright)",
  "devops": "devops (CI/CD)",
  "ui": "ui (Tailwind/SCSS)",
  "python-backend-dev": "python-backend-dev (FastAPI/Pydantic)",
  "python-backend-tester": "python-backend-tester (pytest)",
  "python-backend-reviewer": "python-backend-reviewer",
  "web-quality-enhancer": "web-quality-enhancer (i18n/SEO)",
}
label = labels.get(agent, agent)
print(json.dumps({"systemMessage": f"File context: apply {label} MCP agent expertise for this file."}))
PYEOF
