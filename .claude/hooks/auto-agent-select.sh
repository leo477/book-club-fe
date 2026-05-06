#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('prompt','').lower())" 2>/dev/null || echo "")

detect_agent() {
  local text="$1"
  if echo "$text" | grep -qiE "angular|component|service|signal|rxresource|standalone|template|pipe|directive"; then
    echo "dev"
  elif echo "$text" | grep -qiE "sonar|ci[/ ]?cd|github action|docker|deploy|workflow|pipeline|build|vercel"; then
    echo "devops"
  elif echo "$text" | grep -qiE "pytest|python test|backend test"; then
    echo "python-backend-tester"
  elif echo "$text" | grep -qiE "python review|fastapi review|backend review"; then
    echo "python-backend-reviewer"
  elif echo "$text" | grep -qiE "python|fastapi|django|pydantic|sqlalchemy|alembic|celery|uvicorn"; then
    echo "python-backend-dev"
  elif echo "$text" | grep -qiE "java|spring|springboot|maven|gradle|jpa|hibernate|kotlin"; then
    echo "java-backend-dev"
  elif echo "$text" | grep -qiE "spec|test|coverage|jest|playwright|e2e|unit test"; then
    echo "tester"
  elif echo "$text" | grep -qiE "security|xss|injection|auth|csrf|vulnerability|owasp|sanitize"; then
    echo "security"
  elif echo "$text" | grep -qiE "commit|review|pull request|\bpr\b|before push|code review"; then
    echo "reviewer"
  elif echo "$text" | grep -qiE "ui|design|tailwind|scss|accessible|layout|style|spartan"; then
    echo "ui"
  elif echo "$text" | grep -qiE "seo|content|copy|i18n|translation|meta|sitemap|documentation"; then
    echo "web-quality-enhancer"
  else
    echo ""
  fi
}

AGENT=$(detect_agent "$PROMPT")
[ -z "$AGENT" ] && exit 0

python3 - "$AGENT" <<'PYEOF'
import json, sys

agent = sys.argv[1]
messages = {
  "dev": "Angular 21 expert context active: focus on signals (resource/rxResource/linkedSignal), standalone components, input()/output() APIs, TypeScript strict mode, SCSS/Tailwind. Apply the dev MCP agent expertise.",
  "devops": "DevOps/CI context active: focus on GitHub Actions, SonarCloud, Docker, Vercel deployment pipelines, build optimization, security scanning. Apply the devops MCP agent expertise.",
  "tester": "Testing expert context active: focus on Jest unit tests, Angular TestBed, fixture patterns, Playwright E2E, coverage thresholds. Apply the tester MCP agent expertise.",
  "security": "Security expert context active: focus on OWASP Top 10, Angular security (XSS, CSRF), auth flows, dependency vulnerabilities. Apply the security MCP agent expertise.",
  "reviewer": "Code reviewer context active: focus on correctness, readability, Angular patterns, test coverage, commit quality. Apply the reviewer MCP agent expertise.",
  "ui": "UI/UX expert context active: focus on Tailwind, SCSS, accessibility (a11y), responsive design, Spartan UI components. Apply the ui MCP agent expertise.",
  "web-quality-enhancer": "Web quality expert context active: focus on SEO, i18n/translations, meta tags, content copy quality, API documentation. Apply the web-quality-enhancer MCP agent expertise.",
  "java-backend-dev": "Java backend expert context active: focus on Spring Boot, JPA/Hibernate, Maven/Gradle, REST API design, Java 21 features. Apply the java-backend-dev MCP agent expertise.",
  "python-backend-dev": "Python backend expert context active: focus on FastAPI, Pydantic v2, SQLAlchemy, Alembic migrations, Celery/ARQ tasks, pytest. Apply the python-backend-dev MCP agent expertise.",
  "python-backend-tester": "Python testing expert context active: focus on pytest, FastAPI TestClient, fixtures, mocking, coverage for Python backend. Apply the python-backend-tester MCP agent expertise.",
  "python-backend-reviewer": "Python code reviewer context active: focus on FastAPI patterns, Pydantic validation, security, performance, correctness. Apply the python-backend-reviewer MCP agent expertise.",
}
msg = messages.get(agent, "")
if msg:
    print(json.dumps({"systemMessage": msg}))
PYEOF
