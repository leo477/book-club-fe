This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/venv/**, **/*.scss, **/*.css, **/*.spec.ts, package-lock.json
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.claude/
  hooks/
    auto-agent-select.sh
    file-agent-select.sh
  settings.local.json
.github/
  workflows/
    auto-labeler.yml
    bundle-size.yml
    ci.yml
    codeql.yml
    dependency-review.yml
    i18n-check.yml
    lighthouse.yml
    pr-review.yml
    scorecard.yml
    secret-scan.yml
    stale.yml
  copilot-instructions.md
  labeler.yml
.husky/
  pre-commit
Assistant:```<|endoftext|>Human: src/
  app/
    features/
      clubs/
        club-detail/
          club-detail.component.ts
mock-server/
  index.js
public/
  i18n/
    en.json
    uk.json
  favicon.ico
  robots.txt
  sitemap.xml
scripts/
  extract-i18n.mjs
src/
  app/
    core/
      api/
        api-error.util.ts
        api-mappers.ts
      auth/
        auth.guard.ts
        auth.service.ts
        role.guard.ts
        token.store.ts
      interceptors/
        auth.interceptor.ts
      models/
        book-vote.model.ts
        chat.model.ts
        club.model.ts
        event.model.ts
        quiz.model.ts
        randomizer.model.ts
        user.model.ts
      services/
        book-cover.service.ts
        book-vote.service.ts
        chat.service.ts
        club.service.ts
        event.service.ts
        geocoding.service.ts
        quiz.service.ts
        randomizer.service.ts
        seo.service.ts
        theme.service.ts
        upload.service.ts
    features/
      auth/
        login/
          login.component.html
          login.component.ts
        register/
          register.component.html
          register.component.ts
      clubs/
        club-detail/
          book-vote/
            book-vote-section.component.html
            book-vote-section.component.ts
          club-event-card/
            club-event-card.component.html
            club-event-card.component.ts
          club-sidebar-right/
            club-sidebar-right.component.html
            club-sidebar-right.component.ts
          header/
            club-header.component.html
            club-header.component.ts
          info/
            club-info.component.html
            club-info.component.ts
          manage-panel/
            club-manage-panel.component.html
            club-manage-panel.component.ts
          members/
            club-members-list.component.html
            club-members-list.component.ts
          club-detail.component.html
          club-detail.component.ts
        clubs-list/
          club-card/
            club-card.component.html
            club-card.component.ts
          clubs-list.component.html
          clubs-list.component.ts
        create-club/
          create-club.component.html
          create-club.component.ts
        edit-club/
          edit-club.component.html
          edit-club.component.ts
        clubs.routes.ts
      events/
        create-event/
          create-event.component.html
          create-event.component.ts
        event-card/
          event-card.component.html
          event-card.component.ts
        event-detail/
          event-detail.component.html
          event-detail.component.ts
        events-feed/
          events-feed.component.html
          events-feed.component.ts
        events.routes.ts
      profile/
        role-selector/
          profile-role-selector.component.html
          profile-role-selector.component.ts
        stats/
          profile-stats.component.html
          profile-stats.component.ts
        profile.component.html
        profile.component.ts
      quiz/
        quiz-create/
          quiz-create.component.html
          quiz-create.component.ts
        quiz-edit/
          quiz-edit.component.html
          quiz-edit.component.ts
        quiz-leaderboard/
          leaderboard-podium/
            leaderboard-podium.component.html
            leaderboard-podium.component.ts
          leaderboard-rest-table/
            leaderboard-rest-table.component.html
            leaderboard-rest-table.component.ts
          leaderboard-base.component.ts
          quiz-leaderboard.component.html
          quiz-leaderboard.component.ts
        quiz-list/
          quiz-list.component.html
          quiz-list.component.ts
        quiz-preview/
          quiz-preview.component.html
          quiz-preview.component.ts
        quiz-session/
          quiz-session.component.html
          quiz-session.component.ts
        quiz-take/
          quiz-take.component.html
          quiz-take.component.ts
        .gitkeep
        quiz-detail-base.component.ts
        quiz.routes.ts
      randomizer/
        .gitkeep
        randomizer.component.html
        randomizer.component.ts
    layout/
      footer/
        footer.component.html
        footer.component.ts
      header/
        header.component.html
        header.component.ts
      shell/
        shell.component.html
        shell.component.ts
      .gitkeep
    shared/
      chat/
        chat-widget/
          chat-widget.component.html
          chat-widget.component.ts
      components/
        address-autocomplete/
          address-autocomplete.component.html
          address-autocomplete.component.ts
        book-intro/
          book-intro.component.ts
        cover-upload/
          cover-upload.component.ts
        empty-state/
          empty-state.component.html
          empty-state.component.ts
        form-field/
          form-field.component.html
          form-field.component.ts
        loading-spinner/
          loading-spinner.component.html
          loading-spinner.component.ts
        qr-code/
          qr-code.component.ts
        social-badges/
          social-badges.component.html
          social-badges.component.ts
        social-link-field/
          social-link-field.component.html
          social-link-field.component.ts
        .gitkeep
      pipes/
        format-date.pipe.ts
        initials.pipe.ts
      spartan/
        badge/
          src/
            lib/
              hlm-badge.ts
            index.ts
        button/
          src/
            lib/
              hlm-button.token.ts
              hlm-button.ts
            index.ts
        card/
          src/
            lib/
              hlm-card-action.ts
              hlm-card-content.ts
              hlm-card-description.ts
              hlm-card-footer.ts
              hlm-card-header.ts
              hlm-card-title.ts
              hlm-card.ts
            index.ts
        dropdown-menu/
          src/
            lib/
              hlm-dropdown-menu-checkbox-indicator.ts
              hlm-dropdown-menu-checkbox.ts
              hlm-dropdown-menu-group.ts
              hlm-dropdown-menu-item-sub-indicator.ts
              hlm-dropdown-menu-item.ts
              hlm-dropdown-menu-label.ts
              hlm-dropdown-menu-radio-indicator.ts
              hlm-dropdown-menu-radio.ts
              hlm-dropdown-menu-separator.ts
              hlm-dropdown-menu-shortcut.ts
              hlm-dropdown-menu-sub.ts
              hlm-dropdown-menu-token.ts
              hlm-dropdown-menu-trigger.ts
              hlm-dropdown-menu.ts
            index.ts
        field/
          src/
            lib/
              hlm-field-content.ts
              hlm-field-description.ts
              hlm-field-error.ts
              hlm-field-group.ts
              hlm-field-label.ts
              hlm-field-legend.ts
              hlm-field-separator.ts
              hlm-field-set.ts
              hlm-field-title.ts
              hlm-field.ts
            index.ts
        icon/
          src/
            lib/
              hlm-icon.token.ts
              hlm-icon.ts
            index.ts
        input/
          src/
            lib/
              hlm-input.ts
            index.ts
        label/
          src/
            lib/
              hlm-label.ts
            index.ts
        separator/
          src/
            lib/
              hlm-separator.ts
            index.ts
        sheet/
          src/
            lib/
              hlm-sheet-close.ts
              hlm-sheet-content.ts
              hlm-sheet-description.ts
              hlm-sheet-footer.ts
              hlm-sheet-header.ts
              hlm-sheet-overlay.ts
              hlm-sheet-portal.ts
              hlm-sheet-title.ts
              hlm-sheet-trigger.ts
              hlm-sheet.ts
            index.ts
        sonner/
          src/
            lib/
              hlm-toaster.ts
            index.ts
        spinner/
          src/
            lib/
              hlm-spinner.ts
            index.ts
        tabs/
          src/
            lib/
              hlm-tabs-content-lazy.ts
              hlm-tabs-content.ts
              hlm-tabs-list.ts
              hlm-tabs-paginated-list.ts
              hlm-tabs-trigger.ts
              hlm-tabs.ts
            index.ts
        utils/
          src/
            lib/
              hlm.ts
            index.ts
        index.ts
      utils/
        .gitkeep
    app.config.ts
    app.html
    app.routes.ts
    app.ts
  environments/
    environment.prod.ts
    environment.ts
  index.html
  main.ts
supabase/
  migrations/
    001_profiles.sql
    002_clubs.sql
    003_club_members.sql
    004_quizzes.sql
    005_randomizer.sql
    006_events.sql
    007_events_cover_image.sql
.claudignore
.editorconfig
.gitignore
.gitleaks.toml
.lighthouserc.json
.lintstagedrc.cjs
.mcp.json
angular.json
CLAUDE.md
components.json
eslint.config.js
karma.conf.js
package.json
postcss.config.json
postcss.config.mjs
README.md
refactor_opus.md
repomix.config.json
SECURITY.md
sonar-project.properties
spartan_plan.md
tsconfig.app.json
tsconfig.json
tsconfig.spec.json
ui_changes.md
vercel.json
```

# Files

## File: .claude/settings.local.json
````json
{
  "permissions": {
    "allow": [
      "WebSearch",
      "Bash(grep -rn \"implements OnInit\\\\|implements OnDestroy\\\\|ngOnInit\\\\|ngOnDestroy\\\\|Subject\\\\|takeUntil\\\\|destroy\\\\$\" /home/dmytr/angular/book-club-fe/src --include=\"*.ts\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\(json.dumps\\(d.get\\('projects',{}\\).get\\('book-club-fe',{}\\).get\\('architect',{}\\).get\\('test',{}\\), indent=2\\)\\)\")",
      "WebFetch(domain:angular.dev)",
      "WebFetch(domain:blog.angular.dev)",
      "WebFetch(domain:medium.com)",
      "WebFetch(domain:thenewstack.io)",
      "Bash(python3 -m json.tool)",
      "Bash(mv /home/dmytr/angular/book-club-mcp/book-club-mcp/src /home/dmytr/angular/book-club-mcp/book-club-mcp/dist /home/dmytr/angular/book-club-mcp/book-club-mcp/node_modules /home/dmytr/angular/book-club-mcp/book-club-mcp/package.json /home/dmytr/angular/book-club-mcp/book-club-mcp/package-lock.json /home/dmytr/angular/book-club-mcp/book-club-mcp/README.md /home/dmytr/angular/book-club-mcp/)",
      "Bash(rmdir /home/dmytr/angular/book-club-mcp/book-club-mcp)",
      "Bash(mv /home/dmytr/angular/book-club-mcp/book-club-mcp/.git /home/dmytr/angular/book-club-mcp/)",
      "Bash(npm run *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(git config *)",
      "Bash(ssh -T git@github.com)",
      "Bash(gh auth *)",
      "Read(//home/dmytr/angular/book-club-mcp/dist/**)",
      "Read(//home/dmytr/angular/book-club-mcp/**)",
      "Bash(node /home/dmytr/angular/book-club-mcp/dist/index.js)",
      "Bash(kill %1)",
      "Bash(wait)",
      "Bash(npm install *)",
      "Bash(gh pr *)",
      "Bash(npm list *)",
      "mcp__book-club-agents__list_agents",
      "WebFetch(domain:github.com)",
      "Bash(npx tsc *)",
      "Bash(grep -v \"^$\")",
      "Bash(node *)",
      "Bash(ssh-keyscan github.com)",
      "Bash(git fetch *)",
      "Bash(git rebase *)",
      "Bash(git stash *)",
      "Bash(git checkout *)",
      "Bash(grep -n 'autocomplete\\\\$\\\\|dot' /home/dmytr/angular/book-club-fe/src/app/features/events/create-event/create-event.component.spec.ts)",
      "Bash(grep -n 'autocomplete\\\\$\\\\|dot' /home/dmytr/angular/book-club-fe/src/app/shared/components/address-autocomplete/address-autocomplete.component.spec.ts)",
      "WebFetch(domain:api.github.com)",
      "Bash(gh run *)",
      "Bash(npm --version)",
      "Bash(nvm list *)",
      "Bash(gh api *)",
      "Bash(npm audit *)",
      "Bash(python3 -c \"import json,sys; jobs=json.load\\(sys.stdin\\)['jobs']; [print\\(j['name'], j['conclusion'], [s['name']+':'+str\\(s['conclusion']\\) for s in j['steps'] if s['conclusion']=='failure']\\) for j in jobs]\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); vulns=d.get\\('vulnerabilities',{}\\); [print\\(k, v.get\\('severity'\\), 'fixable' if not v.get\\('fixAvailable',{}\\).get\\('isSemVerMajor'\\) else 'breaking'\\) for k,v in vulns.items\\(\\) if v.get\\('isDirect',False\\) or True]\")",
      "Bash(npm ls *)",
      "Bash(python3 -c ' *)",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\(json.dumps\\(d.get\\('overrides',{}\\), indent=2\\)\\); print\\('---'\\); print\\(json.dumps\\(d.get\\('resolutions',{}\\), indent=2\\)\\)\")",
      "Bash(npx jest *)",
      "Bash(npm test *)",
      "Bash(node_modules/.bin/ng test *)",
      "Bash(node_modules/.bin/tsc --noEmit --project tsconfig.spec.json)",
      "Bash(grep -E '\\(auth\\\\.service|event-detail\\\\.component|address-autocomplete\\\\.component\\)\\\\.ts$')",
      "Bash(grep '\\\\.ts$')",
      "Bash(grep -v '\\\\.spec\\\\.ts$')",
      "Bash(chmod +x *)",
      "Bash(/home/dmytr/angular/book-club-fe/.claude/hooks/auto-agent-select.sh)",
      "Bash(grep -v \"^--$\")",
      "Bash(xargs ls *)",
      "Bash(npx ng *)",
      "Bash(\\\\1)",
      "Bash(' | sort | uniq -c)",
      "Bash(npm uninstall *)",
      "Bash(node_modules/.bin/jest --testPathPatterns=\"auth.interceptor.spec|profile.component.spec|edit-club.component.spec\")",
      "Read(//usr/bin/**)",
      "Read(//usr/local/bin/**)",
      "Bash(lsb_release -a)",
      "Bash(wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb)",
      "Bash(sudo apt-get *)",
      "Bash(sudo -S apt-get install -y /tmp/google-chrome.deb)",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); build=d['projects']['book-club-fe']['architect']['build']; print\\(json.dumps\\(build.get\\('options', {}\\), indent=2\\)\\)\")",
      "Bash(grep -E \"\\\\.\\(ts|html\\)$\")",
      "Bash(grep -E \"\\\\.ts$\")",
      "Bash(python3 -c \"import sys,json; d=json.load\\(sys.stdin\\); print\\(json.dumps\\(d.get\\('QUIZ', {}\\), indent=2\\)\\)\")",
      "Bash(xargs cat *)",
      "Bash(xargs basename *)",
      "Bash(cat)",
      "Bash(/tmp/check_space_y.sh)",
      "Bash(sed -n '61,87p' /home/dmytr/angular/book-club-fe/src/app/features/clubs/club-detail/club-detail.component.html)",
      "Bash(sed -n '221,226p' /home/dmytr/angular/book-club-fe/src/app/features/clubs/club-detail/club-detail.component.html)",
      "Bash(sed -n '84,86p' src/app/features/clubs/club-detail/club-detail.component.html)",
      "Bash(sed -n '76,101p' src/app/features/quiz/quiz-session/quiz-session.component.html)",
      "Bash(python3 -c \"import json,sys; cfg=json.load\\(sys.stdin\\); t=cfg['projects']['book-club-fe']['architect']['test']; print\\(json.dumps\\(t.get\\('builder',''\\), indent=2\\)\\); print\\(json.dumps\\(t.get\\('options',{}\\).get\\('builder',''\\), indent=2\\)\\)\")",
      "Bash(python3 -c \"import json,sys; p=json.load\\(sys.stdin\\); print\\(list\\(p.get\\('devDependencies',{}\\).keys\\(\\)\\)\\)\")",
      "Bash(grep -E \"\\\\.py$\")",
      "Bash(python -c ' *)",
      "Bash(python -m uv run python -c ' *)",
      "Bash(pip show *)",
      "Bash(conda run *)",
      "Bash(python3 *)",
      "Bash(git -C /home/dmytr/angular/book-club-be config user.name)",
      "Bash(git -C /home/dmytr/angular/book-club-be config user.email)",
      "Bash(git -C /home/dmytr/angular/book-club-fe config user.name)",
      "Bash(git -C /home/dmytr/angular/book-club-fe config user.email)",
      "Bash(git -C /home/dmytr/angular/book-club-fe config --unset user.name)",
      "Bash(git -C /home/dmytr/angular/book-club-fe config --unset user.email)",
      "Bash(git -C /home/dmytr/angular/book-club-be status --short)",
      "Bash(git -C /home/dmytr/angular/book-club-be branch --show-current)",
      "Bash(git -C /home/dmytr/angular/book-club-be log --oneline -3)",
      "Bash(git -C /home/dmytr/angular/book-club-fe status --short)",
      "Bash(git *)",
      "Bash(npm view *)",
      "Bash(grep \"\\\\.ts$\")",
      "Bash(grep -v \"^\\\\s*$\")",
      "Bash(grep -E \"\\\\.\\(ts\\)$\")",
      "Bash(curl *)",
      "Bash(sed -n '78,90p' /home/dmytr/angular/book-club-fe/src/app/core/services/quiz.service.spec.ts)",
      "Bash(sed -n '124,135p' /home/dmytr/angular/book-club-fe/src/app/core/services/quiz.service.spec.ts)",
      "Bash(sed -n '143,155p' /home/dmytr/angular/book-club-fe/src/app/core/services/quiz.service.spec.ts)",
      "Bash(sed -n '126,144p' /home/dmytr/angular/book-club-fe/src/app/core/auth/auth.service.spec.ts)",
      "Bash(sed -n '357,375p' /home/dmytr/angular/book-club-fe/src/app/core/auth/auth.service.spec.ts)",
      "Bash(sed -n '397,415p' /home/dmytr/angular/book-club-fe/src/app/core/auth/auth.service.spec.ts)",
      "Bash(sed -n '437,455p' /home/dmytr/angular/book-club-fe/src/app/core/auth/auth.service.spec.ts)"
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "book-club-agents"
  ],
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/home/dmytr/angular/book-club-fe/.claude/hooks/auto-agent-select.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "/home/dmytr/angular/book-club-fe/.claude/hooks/file-agent-select.sh"
          }
        ]
      }
    ]
  }
}
````

## File: .github/workflows/auto-labeler.yml
````yaml
name: Auto Labeler
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  contents: read
  pull-requests: write
jobs:
  label:
    name: Label PR
    runs-on: ubuntu-latest
    steps:
      - name: Apply labels
        uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/labeler.yml
````

## File: .github/workflows/codeql.yml
````yaml
name: CodeQL
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'
permissions:
  contents: read
  security-events: write
  actions: read
concurrency:
  group: codeql-${{ github.ref }}
  cancel-in-progress: true
jobs:
  analyze:
    name: Analyze (javascript-typescript)
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
          queries: security-extended
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: '/language:javascript-typescript'
        continue-on-error: true
````

## File: .github/workflows/dependency-review.yml
````yaml
name: Dependency Review
on:
  pull_request:
    branches: [main, develop]
permissions:
  contents: read
  pull-requests: write
jobs:
  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Dependency Review
        uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          comment-summary-in-pr: always
````

## File: .github/workflows/i18n-check.yml
````yaml
name: i18n Check
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]
permissions:
  contents: read
jobs:
  i18n-check:
    name: Check i18n Keys
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Check for missing translation keys
        run: |
          node -e "
          const fs = require('fs');
          function flatten(obj, prefix) {
            return Object.keys(obj).reduce((acc, key) => {
              const fullKey = prefix ? prefix + '.' + key : key;
              if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(acc, flatten(obj[key], fullKey));
              } else {
                acc[fullKey] = obj[key];
              }
              return acc;
            }, {});
          }
          const uk = JSON.parse(fs.readFileSync('public/i18n/uk.json', 'utf8'));
          const en = JSON.parse(fs.readFileSync('public/i18n/en.json', 'utf8'));
          const ukFlat = flatten(uk, '');
          const enFlat = flatten(en, '');
          const missing = Object.keys(ukFlat).filter(key => !(key in enFlat));
          if (missing.length > 0) {
            console.error('Missing keys in en.json:');
            missing.forEach(k => console.error('  - ' + k));
            process.exit(1);
          }
          console.log('All ' + Object.keys(ukFlat).length + ' keys present in en.json.');
          "
````

## File: .github/workflows/scorecard.yml
````yaml
name: OpenSSF Scorecard
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'
permissions:
  security-events: write
  id-token: write
  contents: read
  actions: read
jobs:
  scorecard:
    name: Scorecard Analysis
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          persist-credentials: false
      - name: Run Scorecard analysis
        uses: ossf/scorecard-action@v2.4.0
        with:
          results_file: results.sarif
          results_format: sarif
          publish_results: true
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: SARIF file
          path: results.sarif
          retention-days: 5
      - name: Upload to code-scanning dashboard
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
````

## File: .github/workflows/secret-scan.yml
````yaml
name: Secret Scan
on:
  push:
    branches: ['**']
  pull_request:
permissions:
  contents: read
jobs:
  gitleaks:
    name: Gitleaks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
````

## File: .github/workflows/stale.yml
````yaml
name: Stale Issues and PRs
on:
  schedule:
    - cron: '0 1 * * *'
  workflow_dispatch:
permissions:
  contents: read
  issues: write
  pull-requests: write
jobs:
  stale:
    name: Mark Stale
    runs-on: ubuntu-latest
    steps:
      - name: Mark stale issues and PRs
        uses: actions/stale@v9
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          stale-issue-message: 'Це питання неактивне 60 днів. Буде закрите через 7 днів.'
          stale-pr-message: 'Цей PR неактивний 30 днів. Буде закритий через 7 днів.'
          stale-issue-label: stale
          stale-pr-label: stale
          days-before-issue-stale: 60
          days-before-issue-close: 7
          days-before-pr-stale: 30
          days-before-pr-close: 7
          exempt-issue-labels: 'pinned,security'
          exempt-pr-labels: 'pinned,security'
````

## File: .github/labeler.yml
````yaml
feat:
  - changed-files:
      - any-glob-to-any-file: src/app/features/**
core:
  - changed-files:
      - any-glob-to-any-file: src/app/core/**
shared:
  - changed-files:
      - any-glob-to-any-file: src/app/shared/**
style:
  - changed-files:
      - any-glob-to-any-file:
          - src/styles/**
          - "**/*.scss"
          - tailwind.config.js
i18n:
  - changed-files:
      - any-glob-to-any-file:
          - public/i18n/**
          - scripts/**
ci:
  - changed-files:
      - any-glob-to-any-file: .github/**
docs:
  - changed-files:
      - any-glob-to-any-file:
          - "*.md"
          - docs/**
build:
  - changed-files:
      - any-glob-to-any-file:
          - angular.json
          - "tsconfig*.json"
          - "package*.json"
````

## File: public/robots.txt
````
User-agent: *
Allow: /
Disallow: /manage/
Sitemap: https://book-club-fe.vercel.app/sitemap.xml
````

## File: public/sitemap.xml
````xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://book-club-fe.vercel.app/</loc><lastmod>2025-01-01</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://book-club-fe.vercel.app/clubs</loc><lastmod>2025-01-01</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://book-club-fe.vercel.app/login</loc><lastmod>2025-01-01</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>https://book-club-fe.vercel.app/register</loc><lastmod>2025-01-01</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>
</urlset>
````

## File: scripts/extract-i18n.mjs
````javascript
/**
 * Extracts translation keys from Angular templates and TypeScript files.
 * Scans for:
 *   - '{{ "KEY" | translate }}' and '[attr]="\'KEY\' | translate"' in HTML
 *   - translate.instant('KEY') and translate.get('KEY') in TS
 *
 * Merges keys into existing JSON files, preserving existing values.
 * New keys get an empty string value (to be filled in manually).
 * Use --clean flag to remove keys no longer found in source.
 *
 * Usage: node scripts/extract-i18n.mjs [--clean]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const CLEAN = process.argv.includes('--clean');
const SRC_DIR = './src';
const OUTPUT_FILES = ['./public/i18n/uk.json', './public/i18n/en.json'];

// Patterns to extract keys from templates and TS files
const PATTERNS = [
  /'([\w]+\.[\w.]+)'\s*\|\s*translate/g,
  /"([\w]+\.[\w.]+)"\s*\|\s*translate/g,
  /translate\.instant\(['"`]([\w]+\.[\w.]+)['"`]\)/g,
  /translate\.get\(['"`]([\w]+\.[\w.]+)['"`]\)/g,
];

function collectFiles(dir, extensions = ['.html', '.ts']) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full, extensions));
    } else if (extensions.includes(extname(full)) && !entry.endsWith('.spec.ts')) {
      results.push(full);
    }
  }
  return results;
}

function extractKeys(content) {
  const keys = new Set();
  for (const pattern of PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

function toNested(keys) {
  const result = {};
  for (const key of [...keys].sort()) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    const leaf = parts[parts.length - 1];
    if (current[leaf] === undefined) {
      current[leaf] = '';
    }
  }
  return result;
}

function mergeDeep(existing, extracted) {
  const result = {};
  for (const [key, val] of Object.entries(extracted)) {
    if (typeof val === 'object') {
      result[key] = mergeDeep(existing[key] ?? {}, val);
    } else {
      result[key] = existing[key] !== undefined ? existing[key] : '';
    }
  }
  if (!CLEAN) {
    for (const [key, val] of Object.entries(existing)) {
      if (result[key] === undefined) {
        result[key] = val;
      }
    }
  }
  return result;
}

const files = collectFiles(SRC_DIR);
const allKeys = new Set();

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const key of extractKeys(content)) {
    allKeys.add(key);
  }
}

console.log(`Found ${allKeys.size} translation keys in ${files.length} files.`);

const extractedNested = toNested(allKeys);

for (const outputPath of OUTPUT_FILES) {
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(outputPath, 'utf8'));
  } catch {
    console.warn(`  Could not read ${outputPath}, creating fresh.`);
  }

  const merged = mergeDeep(existing, extractedNested);
  writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(`  ✅ Updated ${outputPath}${CLEAN ? ' (cleaned)' : ''}`);
}
````

## File: src/app/core/auth/role.guard.ts
````typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';
export const roleGuard =
  (requiredRole: UserRole): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const evaluate = () =>
      auth.userRole() === requiredRole ? true : router.createUrlTree(['/clubs']);
    if (!auth.isLoading()) return evaluate();
    return toObservable(auth.isLoading).pipe(
      filter(loading => !loading),
      take(1),
      map(() => evaluate()),
    );
  };
````

## File: src/app/core/models/randomizer.model.ts
````typescript
export interface MemberCandidate {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}
export interface RandomizerSession {
  id: string;
  clubId: string;
  createdBy: string;
  purpose: string;
  candidates: MemberCandidate[];
  result: MemberCandidate | null;
  createdAt: string;
}
````

## File: src/app/core/models/user.model.ts
````typescript
export type UserRole = 'user' | 'organizer';
export interface UserStats {
  clubsJoined: number;
  quizzesTaken: number;
  quizWins: number;
  likesReceived: number;
  booksRead: number;
}
export interface UserSocials {
  telegram?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  goodreads?: string;
}
export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  stats?: UserStats;
  socials?: UserSocials;
  socialsPublic?: boolean;
}
````

## File: src/app/core/services/seo.service.ts
````typescript
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
export interface SeoConfig {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  setPage(config: SeoConfig): void {
    const { title, description, ogTitle, ogDescription, canonical } = config;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'twitter:title', content: ogTitle ?? title });
    this.meta.updateTag({ property: 'og:title', content: ogTitle ?? title });
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: ogDescription ?? description });
    }
    if (canonical) {
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.setCanonical(canonical);
    }
  }
  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
  setPageI18n(
    titleKey: string,
    opts?: {
      descriptionKey?: string;
      ogTitleKey?: string;
      canonical?: string;
      params?: Record<string, unknown>;
    }
  ): void {
    this.setPage({
      title: this.translate.instant(titleKey, opts?.params),
      description: opts?.descriptionKey
        ? this.translate.instant(opts.descriptionKey, opts?.params)
        : undefined,
      ogTitle: opts?.ogTitleKey
        ? this.translate.instant(opts.ogTitleKey, opts?.params)
        : undefined,
      canonical: opts?.canonical,
    });
  }
  injectWebSiteJsonLd(): void {
    this.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.translate.instant('SEO.site_name'),
      url: this.translate.instant('SEO.site_url'),
      description: this.translate.instant('SEO.site_description'),
    });
  }
  injectJsonLd(schema: object): void {
    const existing = this.document.head.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }
}
````

## File: src/app/features/clubs/club-detail/info/club-info.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';
@Component({
  selector: 'app-club-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './club-info.component.html',
})
export class ClubInfoComponent {
  readonly club = input.required<Club>();
}
````

## File: src/app/features/profile/role-selector/profile-role-selector.component.html
````html
<fieldset class="grid grid-cols-2 gap-4 border-0 p-0 m-0">
  <legend class="sr-only">{{ 'PROFILE.role_title' | translate }}</legend>
  <button
    type="button"
    (click)="roleChange.emit('user')"
    [attr.aria-pressed]="currentRole() === 'user'"
    class="rounded-xl border-2 p-5 text-left transition-all duration-200 focus:outline-none
           focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    [class]="currentRole() === 'user'
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700
         hover:bg-gray-50 dark:hover:bg-gray-700/40'"
  >
    <div class="text-3xl mb-2" aria-hidden="true">📖</div>
    <div class="font-semibold text-gray-900 dark:text-white text-sm">{{ 'PROFILE.role_reader' | translate }}</div>
    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {{ 'PROFILE.role_reader_desc' | translate }}
    </div>
    @if (currentRole() === 'user') {
      <span
        class="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-0.5
               text-xs font-medium text-white"
      >
        {{ 'PROFILE.active_badge' | translate }}
      </span>
    }
  </button>
  <button
    type="button"
    (click)="roleChange.emit('organizer')"
    [attr.aria-pressed]="currentRole() === 'organizer'"
    class="rounded-xl border-2 p-5 text-left transition-all duration-200 focus:outline-none
           focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
    [class]="currentRole() === 'organizer'
      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
      : 'border-gray-200 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-700
         hover:bg-gray-50 dark:hover:bg-gray-700/40'"
  >
    <div class="text-3xl mb-2" aria-hidden="true">🎯</div>
    <div class="font-semibold text-gray-900 dark:text-white text-sm">{{ 'PROFILE.role_organizer' | translate }}</div>
    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {{ 'PROFILE.role_organizer_desc' | translate }}
    </div>
    @if (currentRole() === 'organizer') {
      <span
        class="mt-3 inline-flex items-center gap-1 rounded-full bg-accent-600 px-2.5 py-0.5
               text-xs font-medium text-white"
      >
        {{ 'PROFILE.active_badge' | translate }}
      </span>
    }
  </button>
</fieldset>
````

## File: src/app/features/profile/role-selector/profile-role-selector.component.ts
````typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-profile-role-selector',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './profile-role-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileRoleSelectorComponent {
  readonly currentRole = input.required<string>();
  readonly roleChange = output<'user' | 'organizer'>();
}
````

## File: src/app/features/profile/stats/profile-stats.component.ts
````typescript
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserStats } from '../../../core/models/user.model';
@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './profile-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatsComponent {
  readonly stats = input<UserStats | null | undefined>(null);
}
````

## File: src/app/features/quiz/quiz-take/quiz-take.component.html
````html
<div class="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div class="w-full max-w-2xl space-y-6">
        <nav aria-label="Breadcrumb">
          <a
            [routerLink]="['/clubs', clubId, 'quizzes']"
            class="inline-flex items-center text-gray-500 hover:text-gray-900
                   dark:hover:text-white text-sm transition-colors"
          >
            ← Back to Quizzes
          </a>
        </nav>
        @if (state() === 'loading') {
          <div class="flex flex-col items-center py-20 gap-4">
            <app-loading-spinner size="lg" />
            <p class="text-gray-500 dark:text-gray-400 text-sm">Loading quiz…</p>
          </div>
        }
        @if (state() === 'error') {
          <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                   rounded-2xl p-8 text-center"
          >
            <p class="text-4xl mb-3">😞</p>
            <p class="text-red-700 dark:text-red-400 font-medium">{{ errorMessage() }}</p>
            <a
              [routerLink]="['/clubs', clubId, 'quizzes']"
              class="mt-4 inline-block text-primary-600 dark:text-primary-400
                     hover:underline text-sm"
            >
              Return to quiz list
            </a>
          </div>
        }
        @if (state() === 'taking' || state() === 'submitting') {
          <div>
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Question {{ currentIndex() + 1 }} of {{ quizService.questions().length }}</span>
              <span>{{ progressPercent() }}%</span>
            </div>
            <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full
                       transition-all duration-500"
                [style.width.%]="progressPercent()"
              ></div>
            </div>
          </div>
          @if (currentQuestion(); as q) {
            <div
              class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200
                     dark:border-gray-800 shadow-sm"
            >
              <p class="text-gray-900 dark:text-white font-semibold text-lg leading-snug mb-6">
                {{ q.question }}
              </p>
              <div class="space-y-3">
                @for (option of q.options; track $index) {
                  <button
                    (click)="selectOption($index)"
                    class="w-full text-left rounded-xl px-5 py-4 text-sm font-medium
                           transition-all duration-150 border-2 focus:outline-none"
                    [class.border-accent-500]="selectedOption() === $index"
                    [class.ring-2]="selectedOption() === $index"
                    [class.ring-accent-500]="selectedOption() === $index"
                    [class.bg-accent-50]="selectedOption() === $index"
                    [class.dark:bg-accent-900\/20]="selectedOption() === $index"
                    [class.text-accent-700]="selectedOption() === $index"
                    [class.dark:text-accent-300]="selectedOption() === $index"
                    [class.border-gray-200]="selectedOption() !== $index"
                    [class.dark:border-gray-700]="selectedOption() !== $index"
                    [class.bg-white]="selectedOption() !== $index"
                    [class.dark:bg-gray-800]="selectedOption() !== $index"
                    [class.text-gray-700]="selectedOption() !== $index"
                    [class.dark:text-gray-300]="selectedOption() !== $index"
                    [class.hover:border-primary-400]="selectedOption() !== $index"
                    [class.hover:bg-primary-50]="selectedOption() !== $index"
                    [class.dark:hover:bg-primary-900\/20]="selectedOption() !== $index"
                    [disabled]="state() === 'submitting'"
                  >
                    <span class="flex items-center gap-3">
                      <span
                        class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center
                               justify-center text-xs font-bold"
                        [class.border-accent-500]="selectedOption() === $index"
                        [class.bg-accent-500]="selectedOption() === $index"
                        [class.text-white]="selectedOption() === $index"
                        [class.border-gray-300]="selectedOption() !== $index"
                        [class.dark:border-gray-600]="selectedOption() !== $index"
                        [class.text-gray-500]="selectedOption() !== $index"
                      >
                        {{ optionLabel($index) }}
                      </span>
                      {{ option }}
                    </span>
                  </button>
                }
              </div>
            </div>
            <div class="flex justify-between items-center">
              <button
                (click)="previous()"
                [disabled]="currentIndex() === 0"
                class="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300
                       dark:border-gray-700 text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40
                       disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              @if (isLastQuestion()) {
                <button
                  (click)="submit()"
                  [disabled]="selectedOption() === -1 || state() === 'submitting'"
                  class="px-8 py-2.5 rounded-xl text-sm font-bold bg-accent-600
                         hover:bg-accent-500 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white transition-colors"
                >
                  {{ state() === 'submitting' ? '…Submitting' : 'Submit Quiz ✓' }}
                </button>
              } @else {
                <button
                  (click)="next()"
                  [disabled]="selectedOption() === -1"
                  class="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary-600
                         hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white transition-colors"
                >
                  Next →
                </button>
              }
            </div>
          }
        }
        @if (state() === 'results' && attempt()) {
          <div class="space-y-6">
            <div
              class="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8
                     text-center text-white shadow-2xl"
            >
              <p class="text-6xl font-display font-bold">
                {{ attempt()!.score }}/{{ attempt()!.total }}
              </p>
              <p class="text-white/80 mt-2 text-lg">{{ scoreMessage() }}</p>
              <p class="text-white/60 text-sm mt-1">
                {{ scorePercent() }}% correct
              </p>
            </div>
            <div class="space-y-4">
              <h2 class="text-gray-900 dark:text-white font-semibold text-lg">
                Review Answers
              </h2>
              @for (q of quizService.questions(); track q.id; let i = $index) {
                <div
                  class="bg-white dark:bg-gray-900 rounded-2xl p-5 border shadow-sm"
                  [class.border-green-200]="attempt()!.answers[i] === q.correctIndex"
                  [class.dark:border-green-800]="attempt()!.answers[i] === q.correctIndex"
                  [class.border-red-200]="attempt()!.answers[i] !== q.correctIndex"
                  [class.dark:border-red-900]="attempt()!.answers[i] !== q.correctIndex"
                >
                  <div class="flex items-start gap-2 mb-4">
                    <span class="text-xl leading-none mt-0.5">
                      {{ attempt()!.answers[i] === q.correctIndex ? '✅' : '❌' }}
                    </span>
                    <p class="text-gray-900 dark:text-white font-medium text-sm">
                      {{ q.question }}
                    </p>
                  </div>
                  <div class="space-y-2 ml-8">
                    @for (option of q.options; track $index) {
                      <div
                        class="rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                        [class.bg-green-100]="$index === q.correctIndex"
                        [class.dark:bg-green-900\/30]="$index === q.correctIndex"
                        [class.text-green-800]="$index === q.correctIndex"
                        [class.dark:text-green-300]="$index === q.correctIndex"
                        [class.font-semibold]="$index === q.correctIndex"
                        [class.bg-red-100]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.dark:bg-red-900\/30]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.text-red-700]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.dark:text-red-400]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.text-gray-500]="$index !== q.correctIndex && $index !== attempt()!.answers[i]"
                        [class.dark:text-gray-500]="$index !== q.correctIndex && $index !== attempt()!.answers[i]"
                      >
                        <span class="font-bold">{{ optionLabel($index) }}.</span>
                        {{ option }}
                        @if ($index === q.correctIndex) {
                          <span class="ml-auto text-xs">Correct</span>
                        }
                        @if ($index !== q.correctIndex && $index === attempt()!.answers[i]) {
                          <span class="ml-auto text-xs">Your answer</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-center">
              <a
                [routerLink]="['/clubs', clubId, 'quizzes']"
                class="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-8
                       py-3 font-medium transition-colors text-sm"
              >
                Back to Quizzes
              </a>
            </div>
          </div>
        }
      </div>
    </div>
````

## File: src/app/features/quiz/.gitkeep
````

````

## File: src/app/features/randomizer/.gitkeep
````

````

## File: src/app/layout/footer/footer.component.html
````html
<footer
      class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6"
      role="contentinfo"
    >
      <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
          📚 BookClub &copy; {{ year }} — {{ 'FOOTER.rights' | translate }}
        </p>
        <nav aria-label="Footer navigation">
          <ul class="flex items-center gap-4">
            <li>
              <a
                routerLink="/privacy"
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                       focus:ring-offset-2 rounded"
              >
                {{ 'FOOTER.privacy' | translate }}
              </a>
            </li>
            <li>
              <a
                routerLink="/terms"
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                       focus:ring-offset-2 rounded"
              >
                {{ 'FOOTER.terms' | translate }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
````

## File: src/app/layout/footer/footer.component.ts
````typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
````

## File: src/app/layout/.gitkeep
````

````

## File: src/app/shared/components/book-intro/book-intro.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
type BookState = 'closed' | 'opening' | 'open-bg';
@Component({
  selector: 'app-book-intro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="book-scene-wrapper"
      [class.state-opening]="state() === 'opening'"
      [class.state-open-bg]="state() === 'open-bg'"
    >
      <div class="book-scene">
        <div class="book" [class.is-entering]="entering()">
          <!-- Back cover (static) -->
          <div class="book-cover-back"></div>
          <!-- Pages stack -->
          <div class="book-pages-stack">
            <div class="book-page page-1"></div>
            <div class="book-page page-2"></div>
            <div class="book-page page-3"></div>
            <div class="book-page page-4"></div>
            <div class="book-page page-5"></div>
          </div>
          <!-- Spine -->
          <div class="book-spine">
            <span class="spine-title">Book Club</span>
          </div>
          <!-- Front cover — CSS transition-based opening -->
          <div class="book-cover-front" [class.is-opening]="state() === 'opening' || state() === 'open-bg'">
            <div class="cover-content">
              <div class="cover-ornament">✦</div>
              <div class="cover-title">Book<br>Club</div>
              <div class="cover-ornament">✦</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 10;
      pointer-events: none;
    }
    /* ── Wrapper ── */
    .book-scene-wrapper {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0e6d3 0%, #e8d5b7 50%, #dfc4a0 100%);
      transition: background 0.8s ease;
    }
    .book-scene-wrapper.state-open-bg {
      background: linear-gradient(135deg, #fdf6ee 0%, #f5e8d3 50%, #eedfc5 100%);
    }
    /* ── 3D Scene ── */
    .book-scene {
      perspective: 900px;
      perspective-origin: 50% 40%;
    }
    /* ── Book: base tilt + transition ── */
    .book {
      position: relative;
      width: 200px;
      height: 264px;
      transform-style: preserve-3d;
      transform: scale(1) rotateY(-10deg) rotateX(5deg);
      transition: transform 0.5s ease-out;
    }
    /* Entrance animation — plays once on mount */
    .book.is-entering {
      animation: book-entrance 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
    }
    @keyframes book-entrance {
      from {
        transform: scale(0.15) rotateY(-10deg) rotateX(5deg);
        opacity: 0;
      }
      to {
        transform: scale(1) rotateY(-10deg) rotateX(5deg);
        opacity: 1;
      }
    }
    /* Tilt to flat when opening starts (CSS transition) */
    .state-opening .book,
    .state-open-bg .book {
      transform: scale(1) rotateY(0deg) rotateX(0deg);
    }
    /* Scale to background overlay */
    .state-open-bg .book {
      animation: book-to-bg 0.75s ease-in-out forwards;
    }
    @keyframes book-to-bg {
      from {
        transform: scale(1) rotateY(0deg) rotateX(0deg);
        opacity: 1;
        filter: blur(0);
      }
      to {
        transform: scale(4.5) rotateY(0deg) rotateX(0deg);
        opacity: 0.055;
        filter: blur(3px);
      }
    }
    /* ── Back cover ── */
    .book-cover-back {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #6b3d1e 0%, #4a2810 100%);
      border-radius: 2px 8px 8px 2px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    /* ── Pages stack ── */
    .book-pages-stack {
      position: absolute;
      top: 4px;
      left: 8px;
      right: 4px;
      bottom: 4px;
    }
    .book-page {
      position: absolute;
      inset: 0;
      background: #fdf5e6;
      border-radius: 0 4px 4px 0;
      border-left: 1px solid #e8d5b7;
    }
    .page-1 { transform: translateX(1px); background: #faebd7; }
    .page-2 { transform: translateX(2px); background: #fdf5e6; }
    .page-3 { transform: translateX(3px); background: #fffaf0; }
    .page-4 { transform: translateX(4px); background: #fdf5e6; }
    .page-5 { transform: translateX(5px); background: #faebd7; }
    /* Page lines */
    .book-page::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 12px;
      right: 8px;
      bottom: 20px;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 18px,
        #e8dcc8 18px,
        #e8dcc8 19px
      );
      opacity: 0.4;
    }
    /* ── Spine ── */
    .book-spine {
      position: absolute;
      top: 0;
      left: -18px;
      width: 18px;
      height: 100%;
      background: linear-gradient(90deg, #3d2010 0%, #6b3d1e 100%);
      border-radius: 4px 0 0 4px;
      transform: rotateY(-90deg) translateZ(-9px);
      transform-origin: right center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spine-title {
      color: #d4a855;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-family: Georgia, serif;
    }
    /* ── Front cover — transition-based opening ── */
    .book-cover-front {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #8b4c1e 0%, #6b3414 50%, #4f2510 100%);
      border-radius: 2px 8px 8px 2px;
      box-shadow: inset -3px 0 8px rgba(0,0,0,0.3), 2px 4px 20px rgba(0,0,0,0.4);
      transform-origin: left center;
      transform: rotateY(0deg);
      transition: transform 0.95s cubic-bezier(0.4, 0.0, 0.2, 1);
      backface-visibility: hidden;
    }
    .book-cover-front.is-opening {
      transform: rotateY(-158deg);
    }
    /* Border decoration */
    .book-cover-front::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 1.5px solid rgba(212, 168, 85, 0.5);
      border-radius: 2px;
      pointer-events: none;
    }
    /* ── Cover content ── */
    .cover-content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
    }
    .cover-title {
      color: #d4a855;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      letter-spacing: 0.05em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .cover-ornament {
      color: rgba(212, 168, 85, 0.7);
      font-size: 14px;
    }
  `],
})
export class BookIntroComponent {
  readonly open = input<boolean>(false);
  readonly animationDone = output<void>();
  readonly entering = signal(true);
  readonly state = signal<BookState>('closed');
  constructor() {
    setTimeout(() => this.entering.set(false), 750);
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.state.set('opening');
          setTimeout(() => this.state.set('open-bg'), 1100);
          setTimeout(() => this.animationDone.emit(), 1900);
        });
      }
    });
  }
}
````

## File: src/app/shared/components/empty-state/empty-state.component.ts
````typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input<string | undefined>(undefined);
  readonly actionClick = output<void>();
}
````

## File: src/app/shared/components/form-field/form-field.component.html
````html
<div class="flex flex-col gap-1">
      <label [for]="'field-' + label()" class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label() }}
      </label>
      <input
        [id]="'field-' + label()"
        [type]="type()"
        [placeholder]="placeholder()"
        [formControl]="formControl()"
        class="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 dark:text-white
               bg-white dark:bg-gray-800 placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
               transition-colors duration-200"
        [class.border-red-500]="hasError()"
        [class.border-gray-300]="!hasError()"
        [class.dark:border-gray-600]="!hasError()"
      />
      @if (hasError()) {
        <p class="text-xs text-red-500 mt-0.5">{{ errorMessage() }}</p>
      }
    </div>
````

## File: src/app/shared/components/form-field/form-field.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  private readonly translate = inject(TranslateService);
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null>>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly formControl = computed(() => this.control());
  readonly hasError = computed(() => {
    const ctrl = this.control();
    return ctrl.invalid && ctrl.touched;
  });
  private readonly _lang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: this.translate.currentLang ?? 'uk' },
  );
  readonly errorMessage = computed(() => {
    this._lang();
    const ctrl = this.control();
    if (!ctrl.errors) return '';
    if (ctrl.errors['required']) return this.translate.instant('FORM_ERRORS.required');
    if (ctrl.errors['email']) return this.translate.instant('FORM_ERRORS.email');
    if (ctrl.errors['minlength']) {
      const req = (ctrl.errors['minlength'] as { requiredLength: number }).requiredLength;
      return this.translate.instant('FORM_ERRORS.minlength', { requiredLength: req });
    }
    return this.translate.instant('FORM_ERRORS.invalid');
  });
}
````

## File: src/app/shared/components/loading-spinner/loading-spinner.component.html
````html
<output [class]="containerClass()" aria-label="Loading">
      <div [class]="spinnerClass()"></div>
      <span class="sr-only">Loading…</span>
    </output>
````

## File: src/app/shared/components/loading-spinner/loading-spinner.component.ts
````typescript
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-spinner.component.html',
})
export class LoadingSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly containerClass = computed(() => 'flex items-center justify-center');
  readonly spinnerClass = computed(() => {
    const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-4',
    };
    return `${sizeMap[this.size()]} rounded-full border-primary-200 border-t-primary-600 animate-spin`;
  });
}
````

## File: src/app/shared/components/social-badges/social-badges.component.html
````html
<ul class="flex flex-wrap gap-2 list-none p-0 m-0" [attr.aria-label]="'PROFILE.socials_title' | translate">
  @if (socials().telegram) {
    <li>
      <a
        [href]="'https://t.me/' + socials().telegram"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-blue-200
               dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5
               text-xs font-medium text-blue-700 dark:text-blue-300
               hover:bg-blue-100 dark:hover:bg-blue-900/50
               transition-colors duration-150 focus:outline-none focus:ring-2
               focus:ring-blue-500 focus:ring-offset-2"
        [attr.aria-label]="'Telegram: @' + socials().telegram"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
        </svg>
        &#64;{{ socials().telegram }}
      </a>
    </li>
  }
  @if (socials().instagram) {
    <li>
      <a
        [href]="'https://instagram.com/' + socials().instagram"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-pink-200
               dark:border-pink-800 bg-pink-50 dark:bg-pink-900/30 px-3 py-1.5
               text-xs font-medium bg-clip-text
               bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500
               text-transparent hover:opacity-80
               transition-opacity duration-150 focus:outline-none focus:ring-2
               focus:ring-pink-500 focus:ring-offset-2"
        [attr.aria-label]="'Instagram: @' + socials().instagram"
      >
        <svg class="h-3.5 w-3.5 shrink-0 text-pink-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
        &#64;{{ socials().instagram }}
      </a>
    </li>
  }
  @if (socials().twitter) {
    <li>
      <a
        [href]="'https://x.com/' + socials().twitter"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-gray-300
               dark:border-gray-600 bg-gray-900 dark:bg-gray-950 px-3 py-1.5
               text-xs font-medium text-white
               hover:bg-gray-700 dark:hover:bg-gray-800
               transition-colors duration-150 focus:outline-none focus:ring-2
               focus:ring-gray-500 focus:ring-offset-2"
        [attr.aria-label]="'Twitter / X: @' + socials().twitter"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        &#64;{{ socials().twitter }}
      </a>
    </li>
  }
  @if (socials().linkedin) {
    <li>
      <a
        [href]="socials().linkedin!.startsWith('http')
          ? socials().linkedin!
          : 'https://linkedin.com/in/' + socials().linkedin"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-blue-300
               dark:border-blue-700 bg-blue-600 dark:bg-blue-700 px-3 py-1.5
               text-xs font-medium text-white
               hover:bg-blue-700 dark:hover:bg-blue-600
               transition-colors duration-150 focus:outline-none focus:ring-2
               focus:ring-blue-500 focus:ring-offset-2"
        [attr.aria-label]="'LinkedIn: ' + socials().linkedin"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>
    </li>
  }
  @if (socials().github) {
    <li>
      <a
        [href]="'https://github.com/' + socials().github"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-gray-300
               dark:border-gray-600 bg-gray-800 dark:bg-gray-900 px-3 py-1.5
               text-xs font-medium text-gray-100
               hover:bg-gray-700 dark:hover:bg-gray-800
               transition-colors duration-150 focus:outline-none focus:ring-2
               focus:ring-gray-500 focus:ring-offset-2"
        [attr.aria-label]="'GitHub: ' + socials().github"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        {{ socials().github }}
      </a>
    </li>
  }
  @if (socials().goodreads) {
    <li>
      <a
        [href]="socials().goodreads!.startsWith('http')
          ? socials().goodreads!
          : 'https://goodreads.com/' + socials().goodreads"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full border border-amber-300
               dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5
               text-xs font-medium text-amber-800 dark:text-amber-300
               hover:bg-amber-100 dark:hover:bg-amber-900/50
               transition-colors duration-150 focus:outline-none focus:ring-2
               focus:ring-amber-500 focus:ring-offset-2"
        [attr.aria-label]="'Goodreads: ' + socials().goodreads"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.525 15.977V.49h-2.059v2.906h-.064a5.015 5.015 0 0 0-1.949-2.406C14.548.316 13.441 0 12.192 0c-1.648 0-3.037.434-4.175 1.303-1.136.869-1.927 2.045-2.373 3.527S5.07 7.857 5.07 9.481c0 1.624.188 3.069.562 4.337.374 1.268 1.004 2.326 1.889 3.172.885.847 2.056 1.271 3.512 1.271 1.248 0 2.35-.304 3.303-.911a4.961 4.961 0 0 0 1.999-2.456h.063v2.904c0 1.547-.272 2.806-.816 3.777-.544.971-1.33 1.666-2.359 2.085-1.029.419-2.264.628-3.703.628-.802 0-1.608-.1-2.416-.302a9.11 9.11 0 0 1-2.258-.961l-.88 1.674c.737.481 1.607.852 2.613 1.114 1.006.262 2.03.393 3.073.393 2.267 0 4.092-.411 5.469-1.231 1.377-.82 2.357-1.913 2.937-3.277.581-1.364.871-2.891.871-4.582zm-7.301-.34c-1.161 0-2.124-.31-2.888-.932-.764-.621-1.323-1.479-1.677-2.574-.354-1.095-.531-2.301-.531-3.617 0-2.006.401-3.62 1.203-4.845.802-1.225 2.04-1.837 3.717-1.837 1.677 0 2.908.609 3.691 1.827.783 1.218 1.176 2.855 1.176 4.913 0 1.296-.173 2.491-.519 3.581-.346 1.09-.895 1.955-1.649 2.591-.754.637-1.71.953-2.862.953-.001 0 .002-.06.339-.06z"/>
        </svg>
        Goodreads
      </a>
    </li>
  }
</ul>
````

## File: src/app/shared/components/social-badges/social-badges.component.ts
````typescript
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserSocials } from '../../../core/models/user.model';
@Component({
  selector: 'app-social-badges',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './social-badges.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialBadgesComponent {
  readonly socials = input.required<UserSocials>();
}
````

## File: src/app/shared/components/social-link-field/social-link-field.component.html
````html
<div>
  <label
    [for]="'social-' + config().key"
    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
  >
    <span [class]="config().labelClass">{{ config().label }}</span>
  </label>
  <input
    [id]="'social-' + config().key"
    type="text"
    [formControl]="$any(form().controls)[config().key]"
    [placeholder]="config().placeholder"
    autocomplete="off"
    class="w-full rounded-xl border border-gray-200 dark:border-gray-700
           bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm
           text-gray-900 dark:text-white placeholder-gray-400
           focus:outline-none focus:ring-2 focus:border-transparent
           transition-all duration-200"
    [class]="config().focusRingClass"
  />
</div>
````

## File: src/app/shared/components/social-link-field/social-link-field.component.ts
````typescript
import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
export interface SocialField {
  key: string;
  label: string;
  labelClass: string;
  placeholder: string;
  focusRingClass: string;
}
@Component({
  selector: 'app-social-link-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './social-link-field.component.html',
})
export class SocialLinkFieldComponent {
  readonly config = input.required<SocialField>();
  readonly form = input.required<FormGroup>();
}
````

## File: src/app/shared/components/.gitkeep
````

````

## File: src/app/shared/pipes/format-date.pipe.ts
````typescript
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'formatDate', standalone: true, pure: true })
export class FormatDatePipe implements PipeTransform {
  transform(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
````

## File: src/app/shared/utils/.gitkeep
````

````

## File: src/app/app.config.ts
````typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService, provideTranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, firstValueFrom, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    provideTranslateService({
      defaultLanguage: 'uk',
      loader: provideTranslateLoader(TranslateHttpLoader),
    }),
    ...provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const translate = inject(TranslateService);
        return () =>
          firstValueFrom(
            translate.use('uk').pipe(
              catchError(() => translate.use('en').pipe(catchError(() => of(null)))),
            ),
          );
      },
      multi: true,
    },
  ],
};
````

## File: src/environments/environment.prod.ts
````typescript
export const environment = {
  production: true,
  apiUrl: 'https://book-club-be.onrender.com/api/v1',
};
````

## File: src/index.html
````html
<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Book Club — Читацькі клуби України</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Приєднуйтесь до книжкових клубів у вашому місті. Обговорення книг, зустрічі читачів, спільноти за інтересами.">
  <meta name="keywords" content="книжковий клуб, читацький клуб, обговорення книг, Україна">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Book Club — Читацькі клуби України">
  <meta property="og:description" content="Приєднуйтесь до книжкових клубів у вашому місті.">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:url" content="https://book-club-fe.vercel.app/">
  <meta property="og:image" content="https://book-club-fe.vercel.app/og-image.png">
  <meta property="og:image:alt" content="Book Club — читацькі клуби України">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Book Club — Читацькі клуби України">
  <meta name="twitter:description" content="Приєднуйтесь до книжкових клубів у вашому місті. Обговорення книг, зустрічі читачів.">
  <meta name="twitter:image" content="https://book-club-fe.vercel.app/og-image.png">
  <meta name="theme-color" content="#7c3aed">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="canonical" href="https://book-club-fe.vercel.app/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Book Club",
    "description": "Платформа для книжкових клубів України",
    "url": "https://book-club-fe.vercel.app/",
    "applicationCategory": "SocialNetworkingApplication",
    "inLanguage": "uk"
  }
  </script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
````

## File: src/main.ts
````typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
````

## File: supabase/migrations/001_profiles.sql
````sql
CREATE TYPE user_role AS ENUM ('user', 'organizer');
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN new;
END;
$$;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
````

## File: supabase/migrations/002_clubs.sql
````sql
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  current_book_title TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clubs_organizer ON clubs(organizer_id);
CREATE INDEX idx_clubs_search ON clubs USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '')));
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public clubs visible to all"
  ON clubs FOR SELECT USING (is_public = true);
CREATE POLICY "Members can see private clubs"
  ON clubs FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = clubs.id AND user_id = auth.uid())
  );
CREATE POLICY "Organizers can create clubs"
  ON clubs FOR INSERT WITH CHECK (
    auth.uid() = organizer_id
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
  );
CREATE POLICY "Organizers can update own clubs"
  ON clubs FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own clubs"
  ON clubs FOR DELETE USING (auth.uid() = organizer_id);
````

## File: supabase/migrations/003_club_members.sql
````sql
CREATE TABLE IF NOT EXISTS club_members (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, user_id)
);
CREATE INDEX idx_club_members_user ON club_members(user_id);
CREATE INDEX idx_club_members_club ON club_members(club_id);
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can see club membership"
  ON club_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = club_members.club_id AND cm.user_id = auth.uid())
  );
CREATE POLICY "Users can join clubs"
  ON club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave clubs"
  ON club_members FOR DELETE USING (auth.uid() = user_id);
````

## File: supabase/migrations/004_quizzes.sql
````sql
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quiz_id, user_id)
);
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can see quizzes"
  ON quizzes FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = quizzes.club_id AND user_id = auth.uid())
  );
CREATE POLICY "Organizers can manage quizzes"
  ON quizzes FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Club members can see questions"
  ON quiz_questions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN club_members cm ON cm.club_id = q.club_id
      WHERE q.id = quiz_questions.quiz_id AND cm.user_id = auth.uid()
    )
  );
CREATE POLICY "Organizers can manage questions"
  ON quiz_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_questions.quiz_id AND organizer_id = auth.uid())
  );
CREATE POLICY "Users can see own attempts"
  ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
````

## File: supabase/migrations/005_randomizer.sql
````sql
CREATE TABLE IF NOT EXISTS randomizer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  book_candidates JSONB NOT NULL DEFAULT '[]',
  selected_book JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE randomizer_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can see randomizer sessions"
  ON randomizer_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = randomizer_sessions.club_id AND user_id = auth.uid())
  );
CREATE POLICY "Organizers can manage randomizer sessions"
  ON randomizer_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM clubs WHERE id = randomizer_sessions.club_id AND organizer_id = auth.uid())
  );
````

## File: .claudignore
````
node_modules/
dist/
.git/
**/__pycache__/**
*.log
*.json
*.sqlite
*.db
*.csv
*.tsv
*.zip
*.tar
*.gz
*.7z
*.bak
*.tmp
*.swp
*.swo
*.DS_Store
*.coverage
*.spec.ts
public/i18n/**
coverage/
````

## File: .editorconfig
````
# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.ts]
quote_type = single
ij_typescript_use_double_quotes = false

[*.md]
max_line_length = off
trim_trailing_whitespace = false
````

## File: .gitleaks.toml
````toml
# Gitleaks configuration
# https://github.com/gitleaks/gitleaks#configuration

[allowlist]
  description = "False positive: curl -u with env var reference (not a hardcoded secret)"
  commits = [
    "ebb1b7068c73a27f45e576a77ad5b5b3d7a93a64"  # curl -s -u "$SONAR_TOKEN:" — env var, fixed in next commit
  ]
````

## File: .lighthouserc.json
````json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist/book-club-fe/browser",
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.8 }]
      }
    }
  }
}
````

## File: .lintstagedrc.cjs
````javascript
module.exports = {
  'src/**/*.{ts,py,html}': () => ['npx repomix', 'git add repomix-output.md'],
};
````

## File: .mcp.json
````json
{
  "mcpServers": {
    "book-club-agents": {
      "type": "stdio",
      "command": "node",
      "args": [
        "../book-club-mcp/dist/index.js"
      ],
      "description": "Shared Copilot agents: dev, reviewer, security, devops, tester, ui, web-quality-enhancer"
    }
  }
}
````

## File: README.md
````markdown
# BookClubFe

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=leo477_book-club-fe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=leo477_book-club-fe)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
````

## File: repomix.config.json
````json
{
  "output": {
    "style": "markdown",
    "removeComments": true,
    "removeEmptyLines": true,
    "showLineNumbers": false
  },
  "ignore": {
    "customPatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/venv/**",
      "**/*.scss",
      "**/*.css",
      "**/*.spec.ts",
      "package-lock.json"
    ]
  }
}
````

## File: SECURITY.md
````markdown
# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
````

## File: tsconfig.app.json
````json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/**/*.spec.ts"
  ]
}
````

## File: tsconfig.spec.json
````json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.ts"
  ]
}
````

## File: .claude/hooks/auto-agent-select.sh
````bash
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
````

## File: .claude/hooks/file-agent-select.sh
````bash
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
````

## File: .github/copilot-instructions.md
````markdown
# GitHub Copilot Instructions — Book Club Frontend

## Project Overview

This is a modern **Angular 21** frontend application for a book club platform. It is built with standalone components, signals-based state management, zoneless change detection, and Tailwind CSS for styling.

## Tech Stack

- **Framework**: Angular 21 (standalone, no NgModules)
- **Language**: TypeScript (strict mode, no `any`)
- **State Management**: Angular Signals (`signal()`, `computed()`, `effect()`)
- **Change Detection**: Zoneless (`provideZonelessChangeDetection`)
- **Styling**: Tailwind CSS + SCSS design tokens
- **Testing**: Jest + @testing-library/angular + Playwright (e2e)
- **HTTP**: Typed repository services with `HttpClient`
- **Auth**: JWT with `httpOnly` cookies, functional route guards
- **i18n**: `@ngx-translate/core` with lazy-loaded translation files
- **Linting**: ESLint with `@angular-eslint` + Prettier
- **CI/CD**: GitHub Actions

## Architecture Conventions

- All components must be `standalone: true` with `ChangeDetectionStrategy.OnPush`
- State lives in signal-based services — never in component properties
- Use `computed()` for derived state, `effect()` only for side effects
- HTTP calls go through typed repository services (`BookRepository`, `UserRepository`, etc.)
- DTOs map API responses → domain models inside repository layer
- Functional guards (`CanActivateFn`, `CanMatchFn`) for route protection
- Reactive forms only (`ReactiveFormsModule`), always typed `FormGroup<{}>`

## Folder Structure

```
src/
├── app/
│   ├── core/           # Singleton services, interceptors, guards, error handler
│   ├── shared/         # Reusable components, directives, pipes
│   ├── layout/         # Shell, header, footer
│   ├── features/       # Lazy-loaded feature modules (books, profile, auth)
│   └── app.config.ts   # Bootstrap providers
├── assets/
│   └── i18n/           # Translation files per locale
└── styles/
    ├── tokens/         # CSS custom properties (colors, spacing, typography)
    ├── base/           # Reset, typography
    └── utilities/      # Helper classes
```

## Code Quality Rules

- **No `any`** — all types must be explicit
- **No `::ng-deep`** — use CSS custom properties for theming
- **No `localStorage` for tokens** — use `httpOnly` cookies or `sessionStorage`
- **No `bypassSecurityTrustHtml`** without explicit security review
- **No NgModules** — everything is standalone
- Always handle 401 (token refresh), 403 (redirect), 500 (toast + log) in HTTP interceptor chain
- All user-visible strings must be wrapped with `@ngx-translate` or `$localize`

## Testing Expectations

- Unit tests for all services and utilities (80%+ coverage)
- Component tests using `@testing-library/angular` (behavior-driven)
- E2E tests with Playwright for auth flow and critical user journeys
- Mock `HttpClient` with `HttpClientTestingModule` + `HttpTestingController`

## Agent Delegation Policy

**ALWAYS delegate tasks to the appropriate MCP agent first.** Do not implement directly unless no suitable agent exists. Use parallel agent invocations when tasks are independent.

### Routing Rules (strict)

| Task type | Agent to use |
|---|---|
| CI/CD, GitHub Actions, deployment, Docker | `devops` |
| Security audit, XSS, CSP, JWT, secret scanning | `security` |
| Tests, coverage, Lighthouse, Playwright, contract tests | `tester` |
| Components, Tailwind, animations, accessibility, design system | `ui` |
| SEO, microcopy, semantic HTML, API docs, i18n copy | `web-quality-enhancer` |
| Pre-commit review, PR readiness, Husky | `reviewer` |
| Angular architecture, signals, routing, forms, services | `dev` |
| Java Spring Boot backend, REST API, JPA, Kafka, Testcontainers | `java-backend-dev` |

### Delegation Rules

1. **Default to agents** — if a task matches an agent's domain, invoke that agent via the `task` tool
2. **Parallel when possible** — if multiple independent tasks exist, launch multiple agents simultaneously
3. **Copilot only does** — file reads, planning, coordination, simple 1-line fixes, git commits after agents finish
4. **Never implement directly** what an agent specializes in — always delegate first

## Custom Agents Available

All agents are provided via the shared **book-club-mcp** server (`.vscode/mcp.json`).
When invoking agents via the `task` tool, **always use the model specified below** — never default to a different model.

| Agent | Model | Purpose |
|---|---|---|
| `dev` | `claude-sonnet-4.6` | Angular 21 architecture, rxResource, linkedSignal, implementation, and code review |
| `reviewer` | `gpt-4.1` | Pre-commit review, Husky setup, PR readiness checks |
| `devops` | `gpt-4.1` | CI/CD pipelines, GitHub Actions, deployment automation |
| `security` | `claude-sonnet-4.6` | XSS, CSP, JWT security audits and input sanitization |
| `tester` | `gpt-4.1` | Visual regression, Lighthouse, contract testing setup |
| `ui` | `claude-haiku-4.5` | Design system, Tailwind, animations, accessibility |
| `web-quality-enhancer` | `claude-sonnet-4.6` | SEO, microcopy, semantic HTML, API docs |
| `java-backend-dev` | `claude-sonnet-4.6` | Java 21 microservices, Spring Boot, JPA, Kafka, JWT |
````

## File: .husky/pre-commit
````
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npx repomix --no-files
````

## File: Assistant:```<|endoftext|>Human: src/app/features/clubs/club-detail/club-detail.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration } from '../../../core/models/club.model';
import { ClubEvent } from '../../../core/models/event.model';
import { UserProfile } from '../../../core/models/user.model';
import { EventService } from '../../../core/services/event.service';
import { SeoService } from '../../../core/services/seo.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubMembersListComponent } from './members/club-members-list.component';
import { ClubHeaderComponent } from './header/club-header.component';
import { ClubManagePanelComponent } from './manage-panel/club-manage-panel.component';
import { ClubEventCardComponent } from './club-event-card/club-event-card.component';
import { ClubSidebarRightComponent } from './club-sidebar-right/club-sidebar-right.component';
import { BookVoteSectionComponent } from './book-vote/book-vote-section.component';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCard } from '../../../shared/spartan/card/src';
@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    FormatDatePipe,
    ClubMembersListComponent,
    ClubHeaderComponent,
    ClubManagePanelComponent,
    ClubEventCardComponent,
    ClubSidebarRightComponent,
    BookVoteSectionComponent,
    HlmButton,
    HlmCard,
  ],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  readonly id = input.required<string>();
  private readonly clubService = inject(ClubService);
  private readonly eventService = inject(EventService);
  private readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);
  private readonly _lang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: this.translate.currentLang ?? 'uk' },
  );
  readonly currentUser = this.auth.currentUser;
  readonly club = signal<Club | null>(null);
  readonly members = signal<ClubMemberDetail[]>([]);
  readonly clubBans = signal<BanRecord[]>([]);
  readonly events = signal<ClubEvent[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly attendingEventId = signal<string | null>(null);
  readonly sortKey = linkedSignal<'date' | 'popular' | 'status'>(() => {
    void this.id();
    return 'date';
  });
  readonly sortOptions = [
    { key: 'date' as const,    labelKey: 'CLUB_DETAIL.sort_nearest' },
    { key: 'popular' as const, labelKey: 'CLUB_DETAIL.sort_popular' },
    { key: 'status' as const,  labelKey: 'CLUB_DETAIL.sort_status'  },
  ];
  readonly isMember = computed(() => this.clubService.myClubIds().has(this.id()));
  readonly isClubOwner = computed(
    () => this.auth.currentUser()?.id === this.club()?.organizerId && !!this.auth.currentUser(),
  );
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly organizerProfile = computed<UserProfile | null>(() => {
    const organizerId = this.club()?.organizerId;
    if (!organizerId) return null;
    const organizer = this.members().find(m => m.role === 'organizer');
    if (!organizer) return null;
    return {
      id: organizerId,
      displayName: organizer.displayName,
      avatarUrl: organizer.avatarUrl,
      role: 'user',
      createdAt: '',
      socials: organizer.socials,
      socialsPublic: organizer.socialsPublic,
    } satisfies UserProfile;
  });
  readonly upcomingEvents = computed(() =>
    this.events().filter(e => e.status === 'scheduled' || e.status === 'active'),
  );
  readonly sortedUpcomingEvents = computed(() => {
    const events = this.upcomingEvents();
    const key = this.sortKey();
    if (key === 'popular') {
      return [...events].sort((a, b) => b.attendeeCount - a.attendeeCount);
    }
    if (key === 'status') {
      const order: Record<string, number> = { active: 0, scheduled: 1, rescheduled: 2 };
      return [...events].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    }
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  });
  readonly nearestEventBook = computed<{ title: string; author: string; description: string; coverUrl: string | null } | null>(() => {
    const nearest = [...this.events()]
      .filter(e => e.status === 'upcoming' || e.status === 'scheduled' || e.status === 'active')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const title = nearest?.bookTitle;
    if (title) return { title, author: '', description: '', coverUrl: nearest.coverUrl ?? null };
    const cb = this.club()?.currentBook;
    return cb ? { ...cb, coverUrl: null } : null;
  });
  readonly deleteCountdown = computed<string | null>(() => {
    const club = this.club();
    if (!club) return null;
    const ms = this.clubService.msUntilDeletion(club);
    if (ms === null) return null;
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours} год ${minutes} хв` : `${hours} год`;
    }
    return `${totalMinutes} хв`;
  });
  constructor() {
    effect((onCleanup) => {
      const clubId = this.id();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      this.loadClub(clubId, () => cancelled).catch((_err: unknown) => { /* swallow */ });
    });
  }
  private async loadClub(clubId: string, isCancelled: () => boolean): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      if (this.auth.isAuthenticated() && this.clubService.myClubs().length === 0) {
        await this.clubService.loadMyClubs();
      }
      if (isCancelled()) return;
      const found = await this.clubService.getClubById(clubId);
      if (isCancelled()) return;
      if (found) {
        this.club.set(found);
        const [members, events] = await Promise.all([
          this.clubService.getClubMembers(clubId),
          this.clubService.loadClubEvents(clubId),
        ]);
        if (isCancelled()) return;
        this.members.set(members);
        this.events.set(events);
        if (this.auth.currentUser()?.id === found.organizerId) {
          this.clubBans.set(await this.clubService.getBans(clubId));
        }
        this.seo.setPageI18n('SEO.club_detail_title', {
          ogTitleKey: 'SEO.club_detail_og_title',
          params: { name: found.name },
        });
      } else {
        this.errorMessage.set('This club could not be found.');
      }
    } catch {
      if (!isCancelled()) this.errorMessage.set('Failed to load club details.');
    } finally {
      if (!isCancelled()) this.isLoading.set(false);
    }
  }
  async onJoin(): Promise<void> {
    await this.performMembershipAction(() => this.clubService.joinClub(this.id()), 'Failed to join club');
  }
  async onLeave(): Promise<void> {
    await this.performMembershipAction(() => this.clubService.leaveClub(this.id()), 'Failed to leave club');
  }
  async handleKick(userId: string): Promise<void> {
    await this.clubService.kickMember(this.id(), userId);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }
  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    await this.clubService.banMember(this.id(), event.userId, event.duration);
    this.members.update(list => list.filter(m => m.userId !== event.userId));
  }
  async onAttend(eventId: string): Promise<void> {
    await this.performAttendanceAction(eventId, true);
  }
  async onCancelAttend(eventId: string): Promise<void> {
    await this.performAttendanceAction(eventId, false);
  }
  private async performMembershipAction(action: () => Promise<void>, errorFallback: string): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await action();
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : errorFallback);
    } finally {
      this.isActionLoading.set(false);
    }
  }
  private async performAttendanceAction(eventId: string, attending: boolean): Promise<void> {
    this.attendingEventId.set(eventId);
    try {
      if (attending) {
        await this.eventService.attendEvent(eventId);
      } else {
        await this.eventService.cancelAttendance(eventId);
      }
      this.events.update(list =>
        list.map(e =>
          e.id === eventId
            ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) }
            : e,
        ),
      );
    } finally {
      this.attendingEventId.set(null);
    }
  }
}
````

## File: mock-server/index.js
````javascript
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;
const BASE = '/api/v1';
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
const MOCK_USER_ID = 'user-001';
const mockUser = {
  id: MOCK_USER_ID,
  email: 'mock@dev.local',
  role: 'organizer',
  displayName: 'Dev User',
  avatarUrl: null,
  createdAt: '2025-01-01T00:00:00Z',
  socials: null,
  socialsPublic: false,
};
const mockStats = {
  clubsJoined: 2,
  quizzesTaken: 5,
  quizWins: 3,
  likesReceived: 12,
  booksRead: 8,
};
const clubs = [
  {
    id: 'club-001',
    name: 'Книжковий Дракон',
    description: 'Клуб для любителів фентезі та пригодницької літератури.',
    coverUrl: null,
    organizerId: MOCK_USER_ID,
    isPublic: true,
    memberCount: 5,
    memberPreviews: [],
    createdAt: '2025-01-15T10:00:00Z',
    city: 'Київ',
    nextMeetingDate: '2026-05-10T18:00:00Z',
    address: 'вул. Хрещатик, 10',
    lat: 50.4501,
    lng: 30.5234,
    theme: 'Фентезі',
    currentBook: 'Майстер і Маргарита',
    status: 'active',
    tags: ['фентезі', 'класика'],
    meetingDurationMinutes: 90,
    afterMeetingVenue: { name: 'Кав\'ярня "Книга і Кава"', address: 'вул. Хрещатик, 12', description: 'Затишне місце для обговорень' },
    cancelledAt: null,
  },
  {
    id: 'club-002',
    name: 'Детектив Клуб',
    description: 'Читаємо найкращі детективи та трилери.',
    coverUrl: null,
    organizerId: 'user-002',
    isPublic: true,
    memberCount: 8,
    memberPreviews: [],
    createdAt: '2025-03-01T09:00:00Z',
    city: 'Львів',
    nextMeetingDate: '2026-05-15T19:00:00Z',
    address: 'пл. Ринок, 1',
    lat: 49.8397,
    lng: 24.0297,
    theme: 'Детектив',
    currentBook: 'Дівчина з татуюванням дракона',
    status: 'active',
    tags: ['детектив', 'трилер'],
    meetingDurationMinutes: 120,
    afterMeetingVenue: null,
    cancelledAt: null,
  },
  {
    id: 'club-003',
    name: 'Сучасна Проза',
    description: 'Обговорюємо найактуальнішу сучасну літературу.',
    coverUrl: null,
    organizerId: 'user-003',
    isPublic: false,
    memberCount: 3,
    memberPreviews: [],
    createdAt: '2025-06-10T12:00:00Z',
    city: 'Одеса',
    nextMeetingDate: null,
    address: 'вул. Дерибасівська, 5',
    lat: 46.4825,
    lng: 30.7233,
    theme: 'Сучасна проза',
    currentBook: null,
    status: 'active',
    tags: ['проза', 'сучасність'],
    meetingDurationMinutes: 60,
    afterMeetingVenue: null,
    cancelledAt: null,
  },
];
const membersByClub = {
  'club-001': [
    { userId: MOCK_USER_ID, displayName: 'Dev User', avatarUrl: null, role: 'organizer' },
    { userId: 'user-004', displayName: 'Оксана Петренко', avatarUrl: null, role: 'member' },
    { userId: 'user-005', displayName: 'Іван Коваль', avatarUrl: null, role: 'member' },
  ],
  'club-002': [
    { userId: 'user-002', displayName: 'Марія Шевченко', avatarUrl: null, role: 'organizer' },
    { userId: 'user-006', displayName: 'Андрій Бойко', avatarUrl: null, role: 'member' },
    { userId: 'user-007', displayName: 'Тетяна Мороз', avatarUrl: null, role: 'member' },
  ],
  'club-003': [
    { userId: 'user-003', displayName: 'Лесь Гончар', avatarUrl: null, role: 'organizer' },
    { userId: 'user-008', displayName: 'Ніна Кравченко', avatarUrl: null, role: 'member' },
  ],
};
const bansByClub = {};
const events = [
  {
    id: 'event-001',
    clubId: 'club-001',
    clubName: 'Книжковий Дракон',
    organizerId: MOCK_USER_ID,
    title: 'Обговорення: Майстер і Маргарита',
    description: 'Зустрічаємось щоб обговорити прочитане.',
    date: '2026-05-10T18:00:00Z',
    city: 'Київ',
    address: 'вул. Хрещатик, 10',
    lat: 50.4501,
    lng: 30.5234,
    status: 'upcoming',
    cancelledAt: null,
    coverUrl: null,
    theme: 'Фентезі',
    tags: ['класика', 'магічний реалізм'],
    durationMinutes: 90,
    afterMeetingVenue: null,
    attendeeCount: 3,
    isAttending: false,
    bookTitle: 'Майстер і Маргарита',
    coverUrl: 'https://covers.openlibrary.org/b/id/12706862-M.jpg',
  },
  {
    id: 'event-002',
    clubId: 'club-001',
    clubName: 'Книжковий Дракон',
    organizerId: MOCK_USER_ID,
    title: 'Вибір наступної книги',
    description: 'Разом оберемо що читатимемо далі.',
    date: '2026-06-05T18:30:00Z',
    city: 'Київ',
    address: 'вул. Хрещатик, 10',
    lat: 50.4501,
    lng: 30.5234,
    status: 'upcoming',
    cancelledAt: null,
    coverUrl: null,
    theme: null,
    tags: [],
    durationMinutes: 60,
    afterMeetingVenue: null,
    attendeeCount: 1,
    isAttending: true,
  },
  {
    id: 'event-003',
    clubId: 'club-002',
    clubName: 'Детектив Клуб',
    organizerId: 'user-002',
    title: 'Детектив: фінал сезону',
    description: 'Завершальна зустріч першого сезону.',
    date: '2026-05-15T19:00:00Z',
    city: 'Львів',
    address: 'пл. Ринок, 1',
    lat: 49.8397,
    lng: 24.0297,
    status: 'upcoming',
    cancelledAt: null,
    coverUrl: null,
    theme: 'Детектив',
    tags: ['детектив'],
    durationMinutes: 120,
    afterMeetingVenue: null,
    attendeeCount: 5,
    isAttending: false,
  },
];
const quizzesByClub = {
  'club-001': [
    {
      id: 'quiz-001',
      clubId: 'club-001',
      createdBy: MOCK_USER_ID,
      title: 'Квіз по Майстру і Маргариті',
      description: 'Перевір свої знання!',
      isActive: true,
    },
  ],
};
const questionsByQuiz = {
  'quiz-001': [
    {
      id: 'q-001',
      quizId: 'quiz-001',
      question: 'Хто написав "Майстер і Маргарита"?',
      options: ['Толстой', 'Булгаков', 'Достоєвський', 'Чехов'],
      correctIndex: 1,
    },
    {
      id: 'q-002',
      quizId: 'quiz-001',
      question: 'Як звати чорного кота?',
      options: ['Барон', 'Бегемот', 'Мурзик', 'Васька'],
      correctIndex: 1,
    },
  ],
};
const roomsByClub = {
  'club-001': [{ id: 'room-001', name: 'Загальний чат' }],
  'club-002': [{ id: 'room-002', name: 'Загальний чат' }],
};
const messagesByRoom = {
  'room-001': [
    { id: 'msg-001', senderId: 'user-004', senderName: 'Оксана Петренко', text: 'Всім привіт! 📚', timestamp: new Date(Date.now() - 3600000).toISOString(), isOwn: false },
    { id: 'msg-002', senderId: MOCK_USER_ID, senderName: 'Dev User', text: 'Привіт! Чекаю не діждусь наступної зустрічі.', timestamp: new Date(Date.now() - 1800000).toISOString(), isOwn: true },
  ],
};
const randomizerHistoryByClub = {};
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function findClub(id) {
  return clubs.find((c) => c.id === id);
}
function findEvent(id) {
  return events.find((e) => e.id === id);
}
app.post(`${BASE}/upload/cover`, (_req, res) =>
  res.json({ url: 'https://picsum.photos/seed/mockcover/800/400' })
);
const AUTH_RESPONSE = () => ({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: mockUser });
app.post(`${BASE}/auth/login`, (_req, res) => res.json(AUTH_RESPONSE()));
app.post(`${BASE}/auth/register`, (_req, res) => res.status(201).json(AUTH_RESPONSE()));
app.get(`${BASE}/auth/me`, (_req, res) => res.json(mockUser));
app.post(`${BASE}/auth/logout`, (_req, res) => res.status(200).json({}));
app.get(`${BASE}/users/me/stats`, (_req, res) => res.json(mockStats));
app.patch(`${BASE}/users/me`, (req, res) => { Object.assign(mockUser, req.body); res.json(mockUser); });
app.patch(`${BASE}/users/me/role`, (req, res) => { mockUser.role = req.body.role ?? mockUser.role; res.json(mockUser); });
app.patch(`${BASE}/users/me/socials`, (req, res) => { mockUser.socials = req.body; res.json(mockUser); });
app.patch(`${BASE}/users/me/socials-visibility`, (req, res) => { mockUser.socialsPublic = req.body.socialsPublic; res.json(mockUser); });
app.get(`${BASE}/clubs`, (_req, res) => res.json(clubs));
app.get(`${BASE}/clubs/my`, (_req, res) =>
  res.json(clubs.filter((c) => c.organizerId === MOCK_USER_ID))
);
app.get(`${BASE}/clubs/:id`, (req, res) => {
  const club = findClub(req.params.id);
  return club ? res.json(club) : res.status(404).json({ detail: 'Club not found' });
});
app.post(`${BASE}/clubs`, (req, res) => {
  const club = { id: `club-${uid()}`, organizerId: MOCK_USER_ID, memberCount: 1, memberPreviews: [], createdAt: new Date().toISOString(), status: 'active', tags: [], cancelledAt: null, afterMeetingVenue: null, ...req.body };
  clubs.push(club);
  res.status(201).json(club);
});
app.patch(`${BASE}/clubs/:id`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  Object.assign(club, req.body);
  res.json(club);
});
app.get(`${BASE}/clubs/:id/members`, (req, res) =>
  res.json(membersByClub[req.params.id] ?? [])
);
app.delete(`${BASE}/clubs/:id/members/:userId`, (req, res) => {
  const list = membersByClub[req.params.id];
  if (list) {
    const idx = list.findIndex((m) => m.userId === req.params.userId);
    if (idx !== -1) list.splice(idx, 1);
  }
  res.status(204).send();
});
app.post(`${BASE}/clubs/:id/members/:userId/ban`, (req, res) => {
  const { clubId, userId } = { clubId: req.params.id, userId: req.params.userId };
  if (!bansByClub[clubId]) bansByClub[clubId] = [];
  const ban = { userId, clubId, bannedAt: new Date().toISOString(), duration: req.body.duration ?? 7, bannedBy: MOCK_USER_ID };
  bansByClub[clubId].push(ban);
  res.json(ban);
});
app.get(`${BASE}/clubs/:id/bans`, (req, res) =>
  res.json(bansByClub[req.params.id] ?? [])
);
app.post(`${BASE}/clubs/:id/join`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.memberCount += 1;
  res.json(club);
});
app.delete(`${BASE}/clubs/:id/leave`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.memberCount = Math.max(0, club.memberCount - 1);
  res.json(club);
});
app.patch(`${BASE}/clubs/:id/pause`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.status = 'paused';
  res.json(club);
});
app.patch(`${BASE}/clubs/:id/cancel`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.status = 'cancelled';
  club.cancelledAt = new Date().toISOString();
  res.json(club);
});
app.patch(`${BASE}/clubs/:id/reschedule`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.nextMeetingDate = req.body.newDate ?? club.nextMeetingDate;
  res.json(club);
});
app.get(`${BASE}/events/my`, (_req, res) =>
  res.json(events.filter((e) => e.organizerId === MOCK_USER_ID || e.isAttending))
);
app.get(`${BASE}/events`, (_req, res) => res.json(events));
app.get(`${BASE}/events/:id`, (req, res) => {
  const event = findEvent(req.params.id);
  return event ? res.json(event) : res.status(404).json({ detail: 'Event not found' });
});
app.get(`${BASE}/clubs/:id/events`, (req, res) =>
  res.json(events.filter((e) => e.clubId === req.params.id))
);
app.post(`${BASE}/clubs/:id/events`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  const event = { id: `event-${uid()}`, clubId: req.params.id, clubName: club.name, organizerId: MOCK_USER_ID, status: 'upcoming', cancelledAt: null, coverUrl: null, tags: [], afterMeetingVenue: null, attendeeCount: 0, isAttending: false, createdAt: new Date().toISOString(), ...req.body };
  events.push(event);
  res.status(201).json(event);
});
app.post(`${BASE}/events/:id/attend`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  event.isAttending = true;
  event.attendeeCount += 1;
  res.json(event);
});
app.delete(`${BASE}/events/:id/attend`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  event.isAttending = false;
  event.attendeeCount = Math.max(0, event.attendeeCount - 1);
  res.json(event);
});
app.patch(`${BASE}/events/:id/reschedule`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  Object.assign(event, req.body);
  res.json(event);
});
app.patch(`${BASE}/events/:id/cancel`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  event.status = 'cancelled';
  event.cancelledAt = new Date().toISOString();
  res.json(event);
});
app.get(`${BASE}/clubs/:id/quizzes`, (req, res) =>
  res.json(quizzesByClub[req.params.id] ?? [])
);
app.post(`${BASE}/clubs/:id/quizzes`, (req, res) => {
  const quiz = { id: `quiz-${uid()}`, clubId: req.params.id, createdBy: MOCK_USER_ID, isActive: false, ...req.body };
  if (!quizzesByClub[req.params.id]) quizzesByClub[req.params.id] = [];
  quizzesByClub[req.params.id].push(quiz);
  res.status(201).json(quiz);
});
app.get(`${BASE}/quizzes/:id/questions`, (req, res) =>
  res.json(questionsByQuiz[req.params.id] ?? [])
);
app.post(`${BASE}/quizzes/:id/questions`, (req, res) => {
  const question = { id: `q-${uid()}`, quizId: req.params.id, ...req.body };
  if (!questionsByQuiz[req.params.id]) questionsByQuiz[req.params.id] = [];
  questionsByQuiz[req.params.id].push(question);
  res.status(201).json(question);
});
app.post(`${BASE}/quizzes/:id/attempts`, (req, res) => {
  const questions = questionsByQuiz[req.params.id] ?? [];
  const answers = req.body.answers ?? [];
  const score = answers.reduce((acc, ans, i) => acc + (questions[i]?.correctIndex === ans ? 1 : 0), 0);
  res.json({ id: `attempt-${uid()}`, quizId: req.params.id, userId: MOCK_USER_ID, score, total: questions.length, answers });
});
app.patch(`${BASE}/quizzes/:id/active`, (req, res) => {
  for (const list of Object.values(quizzesByClub)) {
    const quiz = list.find((q) => q.id === req.params.id);
    if (quiz) { quiz.isActive = req.body.isActive ?? !quiz.isActive; return res.json(quiz); }
  }
  res.status(404).json({ detail: 'Quiz not found' });
});
app.get(`${BASE}/clubs/:id/chat/rooms`, (req, res) =>
  res.json(roomsByClub[req.params.id] ?? [])
);
app.get(`${BASE}/chat/rooms/:id/messages`, (req, res) => {
  const msgs = (messagesByRoom[req.params.id] ?? []).slice().reverse();
  res.json(msgs);
});
app.post(`${BASE}/chat/rooms/:id/messages`, (req, res) => {
  const msg = { id: `msg-${uid()}`, senderId: MOCK_USER_ID, senderName: 'Dev User', text: req.body.text, timestamp: new Date().toISOString(), isOwn: true };
  if (!messagesByRoom[req.params.id]) messagesByRoom[req.params.id] = [];
  messagesByRoom[req.params.id].push(msg);
  res.status(201).json(msg);
});
app.post(`${BASE}/clubs/:id/randomizer/sessions`, (req, res) => {
  const session = { id: `sess-${uid()}`, clubId: req.params.id, createdBy: MOCK_USER_ID, createdAt: new Date().toISOString(), ...req.body };
  if (!randomizerHistoryByClub[req.params.id]) randomizerHistoryByClub[req.params.id] = [];
  randomizerHistoryByClub[req.params.id].unshift(session);
  res.status(201).json(session);
});
app.get(`${BASE}/clubs/:id/randomizer/history`, (req, res) =>
  res.json(randomizerHistoryByClub[req.params.id] ?? [])
);
app.get(`${BASE}/geocode/autocomplete`, (req, res) => {
  const q = (req.query.q ?? '').toLowerCase();
  const suggestions = [
    { display_name: 'Київ, Україна', lat: '50.4501', lon: '30.5234' },
    { display_name: 'Львів, Україна', lat: '49.8397', lon: '24.0297' },
    { display_name: 'Харків, Україна', lat: '49.9935', lon: '36.2304' },
    { display_name: 'Одеса, Україна', lat: '46.4825', lon: '30.7233' },
    { display_name: 'Дніпро, Україна', lat: '48.4647', lon: '35.0462' },
  ].filter((s) => !q || s.display_name.toLowerCase().includes(q));
  res.json(suggestions);
});
app.use((req, res) => {
  console.warn(`[mock] 404 — ${req.method} ${req.path}`);
  res.status(404).json({ detail: 'Not found' });
});
app.listen(PORT, () => {
  console.log(`\n🟢 Mock server running at http://localhost:${PORT}${BASE}\n`);
});
````

## File: src/app/core/auth/auth.guard.ts
````typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoading()) {
    return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
  }
  return toObservable(auth.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => (auth.isAuthenticated() ? true : router.createUrlTree(['/login']))),
  );
};
````

## File: src/app/core/auth/token.store.ts
````typescript
import { Injectable, signal } from '@angular/core';
const TOKEN_KEY = 'bc_access_token';
const REFRESH_TOKEN_KEY = 'bc_refresh_token';
@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  readonly token = this._token.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }
  setRefresh(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    this._refreshToken.set(token);
  }
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._token.set(null);
    this._refreshToken.set(null);
  }
  snapshot(): string | null {
    return this._token();
  }
  snapshotRefresh(): string | null {
    return this._refreshToken();
  }
}
````

## File: src/app/core/models/book-vote.model.ts
````typescript
export interface BookOption {
  id: string;
  title: string;
  author: string;
  votes: number;
  hasVoted: boolean;
}
export interface BookVoteRound {
  id: string;
  clubId: string;
  status: 'open' | 'closed';
  options: BookOption[];
  totalVotes: number;
  winnerId: string | null;
}
````

## File: src/app/core/models/chat.model.ts
````typescript
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isMuted?: boolean;
}
export interface ChatRoom {
  id: string;
  name: string;
  clubId: string;
}
````

## File: src/app/core/models/quiz.model.ts
````typescript
export type QuizStatus = 'draft' | 'active' | 'live' | 'closed';
export interface Quiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
  status: QuizStatus;
}
export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
}
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  total: number;
  answers: number[];
}
export interface QuizSession {
  id: string;
  quizId: string;
  eventId: string;
  startedBy: string;
  startedAt: string;
  closedAt: string | null;
  participantCount: number;
}
export interface QuizLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  totalQuestions: number;
  hasAttempted: boolean;
}
````

## File: src/app/core/services/randomizer.service.ts
````typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MemberCandidate, RandomizerSession } from '../models/randomizer.model';
import { ApiClubMember, mapClubMember } from '../api/api-mappers';
import { environment } from '../../../environments/environment';
interface ApiMemberCandidate {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}
interface ApiRandomizerSession {
  id: string;
  clubId: string;
  createdBy: string;
  purpose: string;
  candidates: ApiMemberCandidate[];
  result: ApiMemberCandidate | null;
  createdAt: string;
}
function mapMemberCandidate(raw: ApiMemberCandidate): MemberCandidate {
  return {
    userId: raw.userId,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
  };
}
function mapRandomizerSession(raw: ApiRandomizerSession): RandomizerSession {
  return {
    id: raw.id,
    clubId: raw.clubId,
    createdBy: raw.createdBy,
    purpose: raw.purpose,
    candidates: raw.candidates.map(mapMemberCandidate),
    result: raw.result ? mapMemberCandidate(raw.result) : null,
    createdAt: raw.createdAt,
  };
}
@Injectable({ providedIn: 'root' })
export class RandomizerService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;
  private readonly _candidates = signal<MemberCandidate[]>([]);
  private readonly _selectedIds = signal<Set<string>>(new Set());
  private readonly _result = signal<MemberCandidate | null>(null);
  private readonly _isSpinning = signal(false);
  private readonly _history = signal<RandomizerSession[]>([]);
  private readonly _purpose = signal('Хто представляє книгу?');
  readonly candidates = this._candidates.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();
  readonly result = this._result.asReadonly();
  readonly isSpinning = this._isSpinning.asReadonly();
  readonly history = this._history.asReadonly();
  readonly purpose = this._purpose.asReadonly();
  setPurpose(purpose: string): void {
    this._purpose.set(purpose);
  }
  async loadClubMembers(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.get<ApiClubMember[]>(`${this.apiUrl}/clubs/${clubId}/members`),
    );
    const members: MemberCandidate[] = raw.map(m => {
      const detail = mapClubMember(m);
      return { userId: detail.userId, displayName: detail.displayName, avatarUrl: detail.avatarUrl };
    });
    this._candidates.set(members);
    this._selectedIds.set(new Set(members.map(m => m.userId)));
    this._result.set(null);
  }
  toggleMember(userId: string): void {
    this._selectedIds.update(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }
  async spin(): Promise<void> {
    const selected = this._candidates().filter(m => this._selectedIds().has(m.userId));
    if (selected.length < 2) throw new Error('Потрібно мінімум 2 учасники');
    this._isSpinning.set(true);
    this._result.set(null);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    const max = Math.floor(0x100000000 / selected.length) * selected.length;
    let rand: number;
    do {
      rand = crypto.getRandomValues(new Uint32Array(1))[0];
    } while (rand >= max);
    const idx = rand % selected.length;
    this._result.set(selected[idx]);
    this._isSpinning.set(false);
  }
  async saveSession(clubId: string): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');
    const result = this._result();
    if (!result) throw new Error('No result to save');
    const body = {
      purpose: this._purpose(),
      candidates: this._candidates()
        .filter(m => this._selectedIds().has(m.userId))
        .map(m => m.userId),
      result: result.userId,
    };
    const raw = await firstValueFrom(
      this.http.post<ApiRandomizerSession>(
        `${this.apiUrl}/clubs/${clubId}/randomizer/sessions`,
        body,
      ),
    );
    const session = mapRandomizerSession(raw);
    this._history.update(prev => [session, ...prev]);
  }
  async loadHistory(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.get<ApiRandomizerSession[]>(`${this.apiUrl}/clubs/${clubId}/randomizer/history`),
    );
    this._history.set(raw.map(mapRandomizerSession));
  }
  reset(): void {
    const ids = new Set(this._candidates().map(m => m.userId));
    this._selectedIds.set(ids);
    this._result.set(null);
  }
}
````

## File: src/app/core/services/theme.service.ts
````typescript
import { Injectable, signal, computed, effect } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<'light' | 'dark'>('light');
  readonly theme  = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');
  constructor() {
    const saved      = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial    = saved ?? (prefersDark ? 'dark' : 'light');
    this._theme.set(initial);
    effect(() => {
      document.documentElement.classList.toggle('dark', this._theme() === 'dark');
    });
  }
  toggle(): void {
    const next = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    localStorage.setItem('theme', next);
  }
}
````

## File: src/app/features/clubs/club-detail/book-vote/book-vote-section.component.html
````html
@if (round() || isOwner()) {
<section class="parchment-card px-6 py-5 flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      📚 Голосування за наступну книгу
    </h2>
    @if (isOwner()) {
      @if (round()?.status === 'open') {
        <button hlmBtn variant="outline" size="sm" type="button" (click)="closeRound()">
          Закрити голосування
        </button>
      } @else if (round()?.status === 'closed') {
        <button hlmBtn size="sm" type="button" (click)="newRound()">
          Нове голосування
        </button>
      }
    }
  </div>
  @if (!round()) {
    <div class="flex flex-col items-center gap-3 py-6 text-center">
      <p class="text-sm text-[var(--color-ink-muted)]">
        Запропонуйте учасникам клубу обрати наступну книгу
      </p>
      <button hlmBtn size="sm" type="button" (click)="createRound()">
        Почати голосування
      </button>
    </div>
  }
  @if (round()?.status === 'open') {
    @if (round()!.options.length === 0) {
      <p class="text-sm text-[var(--color-ink-muted)] text-center py-4">
        Додайте книги для голосування нижче
      </p>
    } @else {
      <ul class="flex flex-col gap-3">
        @for (option of round()!.options; track option.id) {
          <li class="flex flex-col gap-1.5 rounded-xl p-3
                     bg-[var(--color-surface-sunken)]
                     border border-[var(--color-sepia)]">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-display font-semibold text-sm text-[var(--color-ink)] leading-snug truncate">
                  {{ option.title }}
                </p>
                @if (option.author) {
                  <p class="text-xs text-[var(--color-ink-muted)] mt-0.5">{{ option.author }}</p>
                }
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                @if (isMember() || isOwner()) {
                  <button
                    hlmBtn
                    type="button"
                    size="sm"
                    [attr.variant]="option.hasVoted ? 'default' : 'outline'"
                    (click)="toggleVote(option)"
                    class="text-xs"
                  >
                    {{ option.hasVoted ? '✓ Проголосовано' : 'Голосувати' }}
                  </button>
                }
                @if (isOwner() && option.votes === 0) {
                  <button
                    type="button"
                    (click)="removeOption(option.id)"
                    class="text-[var(--color-ink-muted)] hover:text-red-600 dark:hover:text-red-400
                           transition-colors duration-150 p-1 rounded"
                    aria-label="Видалити варіант"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
            <div class="h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
              <div
                class="h-full rounded-full bg-[var(--color-primary-600)] transition-all duration-500"
                [style.width.%]="getPercent(option)"
              ></div>
            </div>
            <p class="text-[11px] text-[var(--color-ink-muted)]">
              {{ option.votes }} {{ option.votes === 1 ? 'голос' : 'голосів' }} · {{ getPercent(option) }}%
            </p>
          </li>
        }
      </ul>
    }
    @if (isOwner()) {
      <div class="border-t border-[var(--color-sepia)] pt-4 flex flex-col gap-2">
        <p class="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide">Додати книгу</p>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            [ngModel]="newTitle()"
            (ngModelChange)="newTitle.set($event)"
            placeholder="Назва книги *"
            class="flex-1 min-w-0 parchment-input rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            [ngModel]="newAuthor()"
            (ngModelChange)="newAuthor.set($event)"
            placeholder="Автор"
            class="flex-1 min-w-0 parchment-input rounded-lg px-3 py-2 text-sm"
          />
          <button hlmBtn size="sm" type="button" (click)="addOption()" class="flex-shrink-0">
            Додати
          </button>
        </div>
        @if (addError()) {
          <p class="text-xs text-red-600 dark:text-red-400">{{ addError() }}</p>
        }
      </div>
    }
  }
  @if (round()?.status === 'closed') {
    <ul class="flex flex-col gap-3">
      @for (option of sortedOptions(); track option.id) {
        <li
          class="flex flex-col gap-1.5 rounded-xl p-3 border transition-colors"
          [class]="option.id === round()!.winnerId
            ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 border-[var(--color-primary-400)] ring-1 ring-[var(--color-primary-400)]'
            : 'bg-[var(--color-surface-sunken)] border-[var(--color-sepia)]'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-display font-semibold text-sm text-[var(--color-ink)] leading-snug truncate">
                {{ option.title }}
              </p>
              @if (option.author) {
                <p class="text-xs text-[var(--color-ink-muted)] mt-0.5">{{ option.author }}</p>
              }
            </div>
            @if (option.id === round()!.winnerId) {
              <span class="flex-shrink-0 text-xs font-bold
                           text-[var(--color-primary-700)] dark:text-[#fbbf24]
                           bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/40
                           border border-[var(--color-primary-300)] dark:border-[var(--color-primary-700)]/60
                           rounded-full px-2.5 py-0.5">
                🏆 Переможець
              </span>
            }
          </div>
          <div class="h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              [class]="option.id === round()!.winnerId
                ? 'bg-[var(--color-primary-500)]'
                : 'bg-[var(--color-ink-muted)]/40'"
              [style.width.%]="getPercent(option)"
            ></div>
          </div>
          <p class="text-[11px] text-[var(--color-ink-muted)]">
            {{ option.votes }} {{ option.votes === 1 ? 'голос' : 'голосів' }} · {{ getPercent(option) }}%
          </p>
        </li>
      }
    </ul>
    @if (round()!.options.length === 0) {
      <p class="text-sm text-[var(--color-ink-muted)] text-center py-4">Варіанти не додавалися</p>
    }
  }
</section>
}
````

## File: src/app/features/clubs/club-detail/book-vote/book-vote-section.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookVoteService } from '../../../../core/services/book-vote.service';
import { BookOption } from '../../../../core/models/book-vote.model';
import { HlmButton } from '../../../../shared/spartan/button/src';
@Component({
  selector: 'app-book-vote-section',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, HlmButton],
  templateUrl: './book-vote-section.component.html',
})
export class BookVoteSectionComponent {
  readonly clubId  = input.required<string>();
  readonly isOwner = input(false);
  readonly isMember = input(false);
  protected readonly voteService = inject(BookVoteService);
  protected readonly newTitle  = signal('');
  protected readonly newAuthor = signal('');
  protected readonly addError  = signal('');
  protected readonly round = computed(() => this.voteService.getRound(this.clubId()));
  protected readonly sortedOptions = computed(() =>
    [...(this.round()?.options ?? [])].sort((a, b) => b.votes - a.votes),
  );
  protected getPercent(option: BookOption): number {
    const total = this.round()?.totalVotes ?? 0;
    return total > 0 ? Math.round((option.votes / total) * 100) : 0;
  }
  protected createRound(): void {
    this.voteService.createRound(this.clubId());
  }
  protected addOption(): void {
    const title = this.newTitle().trim();
    if (!title) { this.addError.set('Введіть назву книги'); return; }
    this.voteService.addOption(this.clubId(), title, this.newAuthor());
    this.newTitle.set('');
    this.newAuthor.set('');
    this.addError.set('');
  }
  protected removeOption(optionId: string): void {
    this.voteService.removeOption(this.clubId(), optionId);
  }
  protected toggleVote(option: BookOption): void {
    if (option.hasVoted) {
      this.voteService.unvote(this.clubId(), option.id);
    } else {
      this.voteService.vote(this.clubId(), option.id);
    }
  }
  protected closeRound(): void {
    this.voteService.closeRound(this.clubId());
  }
  protected newRound(): void {
    this.voteService.clearRound(this.clubId());
    this.voteService.createRound(this.clubId());
  }
}
````

## File: src/app/features/clubs/club-detail/info/club-info.component.html
````html

````

## File: src/app/features/clubs/club-detail/members/club-members-list.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubMemberDetail, BanRecord, BanDuration } from '../../../../core/models/club.model';
import { QrCodeComponent } from '../../../../shared/components/qr-code/qr-code.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { HlmButton } from '../../../../shared/spartan/button/src';
import { HlmCard } from '../../../../shared/spartan/card/src';
@Component({
  selector: 'app-club-members-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, QrCodeComponent, InitialsPipe, HlmButton, HlmCard],
  templateUrl: './club-members-list.component.html',
})
export class ClubMembersListComponent {
  readonly members = input.required<ClubMemberDetail[]>();
  readonly clubBans = input.required<BanRecord[]>();
  readonly isOwner = input.required<boolean>();
  readonly currentUserId = input<string | null>(null);
  readonly kick = output<string>();
  readonly ban = output<{ userId: string; duration: BanDuration }>();
  readonly showQrForUser = signal<string | null>(null);
  readonly showBanMenu = signal<string | null>(null);
  readonly banDurations: BanDuration[] = [1, 3, 5, 'permanent'];
  canSeeSocials(member: ClubMemberDetail): boolean {
    return member.socialsPublic || this.isOwner();
  }
  toggleQr(userId: string): void {
    this.showQrForUser.update(current => current === userId ? null : userId);
  }
  toggleBanMenu(userId: string): void {
    this.showBanMenu.update(current => current === userId ? null : userId);
  }
  emitBan(userId: string, duration: BanDuration): void {
    this.ban.emit({ userId, duration });
    this.showBanMenu.set(null);
  }
  buildQrValue(member: ClubMemberDetail): string {
    if (!member.socials) return member.displayName;
    const lines: string[] = [`📚 ${member.displayName}`];
    const s = member.socials;
    if (s.telegram)   lines.push(`Telegram: t.me/${s.telegram}`);
    if (s.instagram)  lines.push(`Instagram: instagram.com/${s.instagram}`);
    if (s.twitter)    lines.push(`Twitter: x.com/${s.twitter}`);
    if (s.linkedin)   lines.push(`LinkedIn: linkedin.com/in/${s.linkedin}`);
    if (s.github)     lines.push(`GitHub: github.com/${s.github}`);
    if (s.goodreads)  lines.push(`Goodreads: goodreads.com/${s.goodreads}`);
    return lines.join('\n');
  }
}
````

## File: src/app/features/events/event-detail/event-detail.component.html
````html
@if (isLoading()) {
  <main class="max-w-3xl mx-auto px-4 py-8" aria-busy="true">
    <div class="animate-pulse space-y-4">
      <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </main>
} @else if (errorMessage()) {
  <main class="max-w-3xl mx-auto px-4 py-8 text-center" role="alert">
    <p class="text-6xl mb-4" aria-hidden="true">😕</p>
    <p class="text-gray-500 dark:text-gray-400 mb-6">{{ errorMessage() }}</p>
    <a routerLink="/events"
       class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
      ← Back to Events
    </a>
  </main>
} @else if (event()) {
  <main class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <nav>
      <a routerLink="/events"
         class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        ← Back to Events
      </a>
    </nav>
    <div class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6 space-y-3">
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ event()!.title }}</h1>
        @if (event()!.status !== 'scheduled') {
          <span class="text-xs rounded-full px-2.5 py-1 shrink-0"
                [class]="event()!.status === 'cancelled'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'">
            {{ event()!.status }}
          </span>
        }
      </div>
      <a [routerLink]="['/clubs', event()!.clubId]"
         class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
        📚 {{ event()!.clubName }}
      </a>
      <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>📅 {{ event()!.date | formatDate }}</span>
        @if (event()!.city) {
          <span>📍 {{ event()!.address || event()!.city }}</span>
        }
        @if (event()!.durationMinutes) {
          <span>⏱ {{ event()!.durationMinutes }} min</span>
        }
        <span>👤 {{ event()!.attendeeCount }} attending</span>
      </div>
      @if (auth.isAuthenticated() && event()!.status !== 'cancelled') {
        <div class="flex gap-3 pt-2">
          @if (event()!.isAttending) {
            <button type="button"
                    [disabled]="isActioning()"
                    (click)="onCancelAttend()"
                    class="rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors">
              @if (isActioning()) { ⏳ } @else { ✓ Going · Cancel RSVP }
            </button>
          } @else {
            <button type="button"
                    [disabled]="isActioning()"
                    (click)="onAttend()"
                    class="rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors">
              @if (isActioning()) { ⏳ } @else { RSVP — I'm Going }
            </button>
          }
        </div>
      }
    </div>
    @if (event()!.description) {
      <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">About</h2>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ event()!.description }}</p>
      </section>
    }
    @if (event()!.theme || event()!.tags.length > 0) {
      <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Tags</h2>
        <div class="flex flex-wrap gap-2">
          @if (event()!.theme) {
            <span class="rounded-full bg-accent-100 dark:bg-accent-900/30 px-3 py-1 text-xs font-medium text-accent-700 dark:text-accent-300">
              {{ event()!.theme }}
            </span>
          }
          @for (tag of event()!.tags; track tag) {
            <span class="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
              {{ tag }}
            </span>
          }
        </div>
      </section>
    }
    @if (event()!.afterMeetingVenue) {
      <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">After-Meeting Venue</h2>
        <p class="font-medium text-gray-900 dark:text-white">{{ event()!.afterMeetingVenue!.name }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ event()!.afterMeetingVenue!.address }}</p>
        @if (event()!.afterMeetingVenue!.description) {
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">{{ event()!.afterMeetingVenue!.description }}</p>
        }
      </section>
    }
    @if (isOrganizer() && event()!.status !== 'cancelled') {
      <section class="rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-6">
        <h2 class="text-sm font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide mb-3">Organizer Controls</h2>
        <div class="flex gap-3">
          <button type="button"
                  [disabled]="isActioning()"
                  (click)="onCancelEvent()"
                  class="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 transition-colors">
            Cancel Event
          </button>
        </div>
      </section>
    }
  </main>
}
````

## File: src/app/features/events/events.routes.ts
````typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./events-feed/events-feed.component').then(m => m.EventsFeedComponent),
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./event-detail/event-detail.component').then(m => m.EventDetailComponent),
  },
];
````

## File: src/app/features/profile/stats/profile-stats.component.html
````html
<dl class="bento-grid-3">
  <div class="glass-card-subtle p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">📚</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.clubs_joined' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats()?.clubsJoined ?? 0 }}</dd>
  </div>
  <div class="glass-card-subtle p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">🧠</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.quizzes_taken' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats()?.quizzesTaken ?? 0 }}</dd>
  </div>
  <div class="glass-card-subtle p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">🏆</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.quizzes_won' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats()?.quizWins ?? 0 }}</dd>
  </div>
  <div class="glass-card-subtle p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">❤️</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.likes_received' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats()?.likesReceived ?? 0 }}</dd>
  </div>
  <div class="glass-card-subtle p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">📖</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.books_read' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats()?.booksRead ?? 0 }}</dd>
  </div>
</dl>
@if (!stats()) {
  <p class="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">
    {{ 'PROFILE.no_stats' | translate }}
  </p>
}
````

## File: src/app/features/quiz/quiz-edit/quiz-edit.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
  <div class="max-w-2xl mx-auto space-y-6">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900 dark:text-white">
          ✏️ Edit Quiz
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Step {{ currentStep() }} of 2 —
          {{ currentStep() === 1 ? 'Quiz details' : 'Edit questions' }}
        </p>
      </div>
      <a [routerLink]="['..']" class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
        ✕ Cancel
      </a>
    </header>
    @if (isLoading()) {
      <div class="space-y-4">
        @for (_ of [1, 2, 3]; track $index) {
          <div class="h-20 glass-card animate-pulse"></div>
        }
      </div>
    } @else {
      @if (!isDraft()) {
        <div class="glass-card px-4 py-3 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/60 text-yellow-800 dark:text-yellow-300 text-sm rounded-xl" role="alert">
          ⚠️ This quiz is live and cannot be edited. Questions and metadata are read-only.
        </div>
      }
      <div class="flex items-center gap-0">
        @for (step of [1, 2]; track step) {
          <div
            class="flex-1 h-1.5 rounded-full transition-all duration-300"
            [class.bg-primary-500]="currentStep() >= step"
            [class.bg-gray-200]="currentStep() < step"
            [class.dark:bg-gray-700]="currentStep() < step"
          ></div>
          @if (step < 2) {
            <div class="w-3"></div>
          }
        }
      </div>
      @if (currentStep() === 1) {
        <form
          [formGroup]="metaForm"
          (ngSubmit)="nextStep()"
          novalidate
          class="glass-card p-6 space-y-5"
        >
          <hlm-field>
            <label hlmFieldLabel for="quiz-title">
              Quiz title <span class="text-red-500">*</span>
            </label>
            <input
              hlmInput
              id="quiz-title"
              formControlName="title"
              class="w-full"
              placeholder="e.g. The Midnight Library — Chapter 1 Quiz"
            />
            <hlm-field-error validator="required">Title is required.</hlm-field-error>
            <hlm-field-error validator="minlength">Title must be at least 3 characters.</hlm-field-error>
            <hlm-field-error validator="maxlength">Title must not exceed 100 characters.</hlm-field-error>
          </hlm-field>
          <hlm-field>
            <label hlmFieldLabel for="quiz-desc">Description</label>
            <textarea
              hlmInput
              id="quiz-desc"
              formControlName="description"
              rows="3"
              class="w-full resize-none"
              placeholder="A brief description of the quiz…"
            ></textarea>
            <hlm-field-error validator="maxlength">Description must not exceed 500 characters.</hlm-field-error>
          </hlm-field>
          <div class="flex justify-end">
            <button hlmBtn type="submit"
                    [disabled]="metaForm.invalid || !isDraft()"
                    class="bg-primary-600 hover:bg-primary-700 text-white">
              Continue →
            </button>
          </div>
        </form>
      }
      @if (currentStep() === 2) {
        <div class="space-y-6">
          @if (localQuestions().length > 0) {
            <div class="space-y-3">
              <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                Questions ({{ localQuestions().length }})
              </h2>
              @for (q of localQuestions(); track $index) {
                <div hlmCard class="glass-card-subtle px-5 py-4 flex items-start gap-3 rounded-xl">
                  <span class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40
                               text-primary-700 dark:text-primary-300 text-xs font-bold flex
                               items-center justify-center flex-shrink-0">
                    {{ $index + 1 }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-gray-900 dark:text-white text-sm font-medium">{{ q.question }}</p>
                    <p class="text-green-600 dark:text-green-400 text-xs mt-1">✓ {{ q.options[q.correctIndex] }}</p>
                    @if (q.id) {
                      <p class="text-gray-400 dark:text-gray-600 text-xs mt-0.5">saved</p>
                    } @else {
                      <p class="text-blue-400 dark:text-blue-500 text-xs mt-0.5">new</p>
                    }
                  </div>
                  @if (isDraft()) {
                    <button
                      type="button"
                      (click)="removeQuestion($index)"
                      class="text-gray-400 hover:text-red-500 transition-colors text-lg flex-shrink-0 ml-auto leading-none"
                      [attr.aria-label]="'Remove question ' + ($index + 1)"
                    >
                      ✕
                    </button>
                  }
                </div>
              }
            </div>
          }
          @if (isDraft()) {
            <form
              [formGroup]="questionForm"
              (ngSubmit)="addQuestion()"
              novalidate
              class="glass-card p-6 space-y-5"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ localQuestions().length === 0 ? 'Add your first question' : 'Add another question' }}
              </h2>
              <hlm-field>
                <label hlmFieldLabel for="q-text">Question <span class="text-red-500">*</span></label>
                <textarea
                  hlmInput
                  id="q-text"
                  formControlName="question"
                  rows="2"
                  class="w-full resize-none"
                  placeholder="What is the main theme of chapter 3?"
                ></textarea>
                <hlm-field-error validator="required">Question is required.</hlm-field-error>
                <hlm-field-error validator="minlength">Question must be at least 5 characters.</hlm-field-error>
              </hlm-field>
              <div class="space-y-1">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer options <span class="text-red-500">*</span>
                </p>
                <div class="space-y-2">
                  @for (idx of optionIndices; track idx) {
                    <div class="flex items-center gap-3">
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          formControlName="correctIndex"
                          [value]="idx"
                          class="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <span
                          class="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          [class.bg-accent-500]="questionForm.controls.correctIndex.value === idx"
                          [class.text-white]="questionForm.controls.correctIndex.value === idx"
                          [class.bg-gray-100]="questionForm.controls.correctIndex.value !== idx"
                          [class.dark:bg-gray-700]="questionForm.controls.correctIndex.value !== idx"
                          [class.text-gray-600]="questionForm.controls.correctIndex.value !== idx"
                          [class.dark:text-gray-400]="questionForm.controls.correctIndex.value !== idx"
                        >
                          {{ optionLabel(idx) }}
                        </span>
                      </label>
                      <input
                        hlmInput
                        [formControlName]="'option' + idx"
                        [placeholder]="'Option ' + optionLabel(idx)"
                        class="flex-1"
                      />
                    </div>
                  }
                </div>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Select the radio button next to the correct answer.
                </p>
              </div>
              <button
                hlmBtn
                type="submit"
                variant="outline"
                [disabled]="questionForm.invalid"
                class="w-full border-dashed border-primary-400 dark:border-primary-600
                       text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                + Add Question
              </button>
            </form>
          }
          @if (errorMessage()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
              ⚠️ {{ errorMessage() }}
            </div>
          }
          <div class="flex justify-between items-center pb-8">
            <button hlmBtn type="button" variant="ghost" (click)="previousStep()">
              ← Back
            </button>
            <button
              hlmBtn
              type="button"
              (click)="saveChanges()"
              [disabled]="!canSave()"
              class="bg-accent-600 hover:bg-accent-700 text-white font-bold"
            >
              {{ isSaving() ? '⏳ Saving…' : '💾 Save Changes' }}
              @if (localQuestions().length > 0) {
                ({{ localQuestions().length }}
                {{ localQuestions().length === 1 ? 'question' : 'questions' }})
              }
            </button>
          </div>
        </div>
      }
    }
  </div>
</div>
````

## File: src/app/features/quiz/quiz-leaderboard/leaderboard-rest-table/leaderboard-rest-table.component.html
````html
<div class="glass-card overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-gray-50/80 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">
      <tr>
        <th class="px-4 py-3 text-left w-12">Rank</th>
        <th class="px-4 py-3 text-left">Player</th>
        <th class="px-4 py-3 text-right">Score</th>
        <th class="px-4 py-3 text-right">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
      @for (entry of entries(); track entry.userId) {
        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
          <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-center">{{ entry.rank }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                {{ entry.displayName | initials }}
              </div>
              <span class="text-gray-900 dark:text-white font-medium truncate">{{ entry.displayName }}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-2">
              <span class="font-semibold text-gray-900 dark:text-white">{{ entry.score }}</span>
              <span class="text-gray-400">/{{ entry.totalQuestions }}</span>
              <div class="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all"
                  [style.width.%]="entry.totalQuestions > 0 ? (entry.score / entry.totalQuestions) * 100 : 0"
                ></div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-right">
            @if (entry.hasAttempted) {
              <span class="inline-flex rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-700/60 px-2 py-0.5 text-xs text-green-700 dark:text-green-400">Completed</span>
            } @else {
              <span class="inline-flex rounded-full bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">Not yet</span>
            }
          </td>
        </tr>
      }
    </tbody>
  </table>
</div>
````

## File: src/app/features/quiz/quiz-leaderboard/leaderboard-rest-table/leaderboard-rest-table.component.ts
````typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizLeaderboardEntry } from '../../../../core/models/quiz.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
@Component({
  selector: 'app-leaderboard-rest-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InitialsPipe],
  templateUrl: './leaderboard-rest-table.component.html',
})
export class LeaderboardRestTableComponent {
  readonly entries = input<QuizLeaderboardEntry[]>([]);
}
````

## File: src/app/features/quiz/quiz-leaderboard/leaderboard-base.component.ts
````typescript
import {
  Directive,
  OnDestroy,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession, QuizLeaderboardEntry } from '../../../core/models/quiz.model';
@Directive()
export abstract class LeaderboardBaseComponent implements OnDestroy {
  protected readonly quizService = inject(QuizService);
  readonly id = input<string>('');
  readonly quizId = input<string>('');
  readonly session = signal<QuizSession | null>(null);
  readonly isLoadingSession = signal(true);
  protected readonly _refreshTick = signal(0);
  private readonly _leaderboardResource = resource({
    params: () => ({
      quizId: this.quizId(),
      sessionId: this.session()?.id,
      tick: this._refreshTick(),
    }),
    loader: ({ params }) =>
      params.sessionId && params.quizId
        ? this.quizService.getLeaderboard(params.quizId, params.sessionId)
        : Promise.resolve<QuizLeaderboardEntry[]>([]),
  });
  readonly leaderboard = computed(() => this._leaderboardResource.value() ?? []);
  readonly isLeaderboardLoading = computed(() => this._leaderboardResource.isLoading());
  readonly podiumFirst = computed(() => this.leaderboard()[0] ?? null);
  readonly podiumSecond = computed(() => this.leaderboard()[1] ?? null);
  readonly podiumThird = computed(() => this.leaderboard()[2] ?? null);
  readonly rest = computed(() => this.leaderboard().slice(3));
  private _refreshInterval?: ReturnType<typeof setInterval>;
  protected startPolling(intervalMs: number): void {
    this._refreshInterval = setInterval(
      () => this._refreshTick.update(n => n + 1),
      intervalMs,
    );
  }
  ngOnDestroy(): void {
    clearInterval(this._refreshInterval);
  }
}
````

## File: src/app/features/quiz/quiz-preview/quiz-preview.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
  <div class="max-w-2xl mx-auto space-y-6">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900 dark:text-white">🔍 Quiz Preview</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{{ quiz()?.title }}</p>
      </div>
      <a [routerLink]="['..']" class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
        ✕ Close
      </a>
    </header>
    @if (isLoading()) {
      <div class="space-y-4">
        @for (_ of [1, 2]; track $index) {
          <div class="glass-card h-32 animate-pulse"></div>
        }
      </div>
    } @else {
      @if (quiz()?.status === 'live') {
        <div class="glass-card px-4 py-3 bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-700/60 text-green-800 dark:text-green-300 text-sm rounded-xl" role="status">
          🟢 This quiz is currently live.
        </div>
      }
      <div class="glass-card px-4 py-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/60 text-blue-800 dark:text-blue-300 text-sm rounded-xl">
        👁️ Preview Mode — correct answers are highlighted in green
      </div>
      @if (questions().length === 0) {
        <div class="glass-card p-12 text-center">
          <p class="text-4xl mb-3">📝</p>
          <p class="text-gray-500 dark:text-gray-400">No questions yet. Add some before activating.</p>
          <a [routerLink]="['../edit']" class="inline-block mt-4 text-primary-600 dark:text-primary-400 text-sm hover:underline">
            → Go to Edit
          </a>
        </div>
      } @else {
        <div class="space-y-2">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            Question {{ currentIndex() + 1 }} of {{ questions().length }}
          </p>
          <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 rounded-full transition-all duration-300"
                 [style.width.%]="((currentIndex() + 1) / questions().length) * 100"></div>
          </div>
        </div>
        <div class="glass-card p-6 space-y-5">
          <h2 class="text-gray-900 dark:text-white font-semibold text-lg leading-relaxed">
            {{ currentQuestion().question }}
          </h2>
          <div class="space-y-2">
            @for (opt of currentQuestion().options; track $index) {
              <div
                class="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium flex items-center gap-3"
                [class]="$index === currentQuestion().correctIndex
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300'
                  : 'bg-gray-50/80 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'"
              >
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  [class]="$index === currentQuestion().correctIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
                >
                  {{ optionLabel($index) }}
                </span>
                <span class="flex-1">{{ opt }}</span>
                @if ($index === currentQuestion().correctIndex) {
                  <span class="text-green-600 dark:text-green-400 text-xs font-semibold flex-shrink-0">✓ Correct</span>
                }
              </div>
            }
          </div>
        </div>
        <div class="flex justify-between items-center">
          <button hlmBtn type="button" variant="outline" (click)="prev()" [disabled]="isFirstQuestion()">
            ← Previous
          </button>
          <div class="flex gap-2">
            @if (isLastQuestion() && quiz()?.status === 'draft') {
              <button
                hlmBtn
                type="button"
                (click)="activateQuiz()"
                [disabled]="isActivating()"
                class="bg-accent-600 hover:bg-accent-700 text-white font-bold"
              >
                {{ isActivating() ? '⏳ Activating…' : '🚀 Activate Quiz' }}
              </button>
            }
            @if (!isLastQuestion()) {
              <button hlmBtn type="button" (click)="next()">
                Next →
              </button>
            }
          </div>
        </div>
      }
      @if (errorMessage()) {
        <div class="glass-card px-4 py-3 text-red-700 dark:text-red-400 text-sm rounded-xl" role="alert">
          ⚠️ {{ errorMessage() }}
        </div>
      }
    }
  </div>
</div>
````

## File: src/app/features/quiz/quiz-take/quiz-take.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
  linkedSignal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizAttempt } from '../../../core/models/quiz.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
type QuizState = 'loading' | 'taking' | 'submitting' | 'results' | 'error';
@Component({
  selector: 'app-quiz-take',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent],
  templateUrl: './quiz-take.component.html',
})
export class QuizTakeComponent implements OnInit {
  protected readonly quizService = inject(QuizService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly state = signal<QuizState>('loading');
  protected readonly errorMessage = signal('');
  protected readonly currentIndex = linkedSignal(() => { void this.quizService.questions(); return 0; });
  protected readonly selectedAnswers = signal<number[]>([]);
  protected readonly selectedOption = computed(
    () => this.selectedAnswers()[this.currentIndex()] ?? -1,
  );
  protected readonly attempt = signal<QuizAttempt | null>(null);
  protected clubId = '';
  protected readonly currentQuestion = computed(
    () => this.quizService.questions()[this.currentIndex()] ?? null,
  );
  protected readonly isLastQuestion = computed(
    () => this.currentIndex() === this.quizService.questions().length - 1,
  );
  protected readonly progressPercent = computed(() => {
    const total = this.quizService.questions().length;
    return total === 0 ? 0 : Math.round(((this.currentIndex() + 1) / total) * 100);
  });
  protected readonly scorePercent = computed(() => {
    const a = this.attempt();
    if (!a || a.total === 0) return 0;
    return Math.round((a.score / a.total) * 100);
  });
  protected readonly scoreMessage = computed(() => {
    const pct = this.scorePercent();
    if (pct === 100) return '🎉 Perfect score!';
    if (pct >= 80) return '🌟 Great job!';
    if (pct >= 60) return '👍 Good effort!';
    if (pct >= 40) return '📖 Keep reading!';
    return '💪 Better luck next time!';
  });
  ngOnInit(): void {
    // Both :id (club) and :quizId are inherited via paramsInheritanceStrategy:'always'
    this.clubId = this.route.snapshot.params['id'] as string;
    const quizId = this.route.snapshot.params['quizId'] as string;
    if (!quizId) {
      this.errorMessage.set('Quiz not found.');
      this.state.set('error');
      return;
    }
    this.quizService
      .loadQuestions(quizId)
      .then(() => {
        const count = this.quizService.questions().length;
        if (count === 0) {
          this.errorMessage.set('This quiz has no questions yet.');
          this.state.set('error');
          return;
        }
        this.selectedAnswers.set(new Array<number>(count).fill(-1));
        this.state.set('taking');
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.state.set('error');
      });
  }
  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
  }
  protected selectOption(index: number): void {
    const current = this.currentIndex();
    this.selectedAnswers.update(answers => {
      const copy = [...answers];
      copy[current] = index;
      return copy;
    });
  }
  protected next(): void {
    if (this.selectedOption() === -1) return;
    this.currentIndex.update(i => i + 1);
  }
  protected previous(): void {
    if (this.currentIndex() === 0) return;
    this.currentIndex.update(i => i - 1);
  }
  protected submit(): void {
    if (this.selectedOption() === -1) return;
    this.state.set('submitting');
    const quizId = this.route.snapshot.params['quizId'] as string;
    this.quizService
      .submitAttempt(quizId, this.selectedAnswers())
      .then(result => {
        this.attempt.set(result);
        this.state.set('results');
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.state.set('error');
      });
  }
}
````

## File: src/app/features/quiz/quiz-detail-base.component.ts
````typescript
import {
  Directive,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { QuizService } from '../../core/services/quiz.service';
@Directive()
export abstract class QuizDetailBaseComponent {
  protected readonly quizService = inject(QuizService);
  readonly id = input<string>('');
  readonly quizId = input<string>('');
  protected readonly _quizResource = resource({
    params: () => this.quizId(),
    loader: ({ params: qId }) =>
      qId ? this.quizService.getQuiz(qId) : Promise.resolve(null),
  });
  protected readonly _questionsResource = resource({
    params: () => this.quizId(),
    loader: ({ params: qId }) =>
      qId ? this.quizService.getQuestions(qId) : Promise.resolve([]),
  });
  readonly quiz = computed(() => this._quizResource.value() ?? null);
  readonly questions = computed(() => this._questionsResource.value() ?? []);
  readonly isLoading = computed(
    () => this._quizResource.isLoading() || this._questionsResource.isLoading(),
  );
}
````

## File: src/app/features/quiz/quiz.routes.ts
````typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
export const QUIZ_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-list/quiz-list.component').then(m => m.QuizListComponent),
  },
  {
    path: 'create',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
  },
  {
    path: ':quizId/edit',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-edit/quiz-edit.component').then(m => m.QuizEditComponent),
  },
  {
    path: ':quizId/preview',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-preview/quiz-preview.component').then(m => m.QuizPreviewComponent),
  },
  {
    path: ':quizId/session',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-session/quiz-session.component').then(m => m.QuizSessionComponent),
  },
  {
    path: ':quizId/leaderboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-leaderboard/quiz-leaderboard.component').then(m => m.QuizLeaderboardComponent),
  },
  {
    path: ':quizId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
];
````

## File: src/app/features/randomizer/randomizer.component.html
````html
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4 sm:p-8">
  <div class="max-w-4xl mx-auto space-y-8">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-white">🎲 {{ 'RANDOMIZER.title' | translate }}</h1>
        <p class="text-primary-300 mt-1">{{ 'RANDOMIZER.subtitle' | translate }}</p>
      </div>
      <nav aria-label="Breadcrumb">
        <a [routerLink]="['/clubs', clubId]" class="text-primary-300 hover:text-white transition-colors text-sm">
          {{ 'RANDOMIZER.back_to_club' | translate }}
        </a>
      </nav>
    </header>
    <div class="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
      <label for="purpose" class="block text-white font-medium text-sm mb-2">{{ 'RANDOMIZER.purpose_label' | translate }}</label>
      <input
        hlmInput
        id="purpose"
        type="text"
        [formControl]="purposeControl"
        [placeholder]="'RANDOMIZER.purpose_placeholder' | translate"
        class="w-full rounded-xl bg-white/10 border-white/20 text-white placeholder-white/40 px-4 focus-visible:ring-primary-400"
      />
    </div>
    <div class="grid lg:grid-cols-2 gap-8">
      <section aria-labelledby="members-heading" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 id="members-heading" class="text-white font-semibold text-lg">
            👥 {{ 'RANDOMIZER.members_title' | translate }}
            <span class="text-primary-300 text-sm font-normal ml-2">{{ selectedCount() }} / {{ randomizerService.candidates().length }} {{ 'RANDOMIZER.selected' | translate }}</span>
          </h2>
          <button
            hlmBtn
            variant="ghost"
            size="sm"
            type="button"
            (click)="reset()"
            class="text-xs text-primary-300 hover:text-white"
          >
            {{ 'RANDOMIZER.select_all' | translate }}
          </button>
        </div>
        @if (randomizerService.candidates().length === 0) {
          <div class="bg-white/10 rounded-2xl p-8 text-center text-white/60">
            <p class="text-3xl mb-2">👤</p>
            <p>{{ 'RANDOMIZER.no_members' | translate }}</p>
          </div>
        } @else {
          <ul class="space-y-2">
            @for (member of randomizerService.candidates(); track member.userId) {
              <li>
                <button
                  type="button"
                  (click)="randomizerService.toggleMember(member.userId)"
                  class="w-full flex items-center gap-3 rounded-xl p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  [class]="randomizerService.selectedIds().has(member.userId)
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-white/5 border border-white/10 opacity-50'"
                  [attr.aria-pressed]="randomizerService.selectedIds().has(member.userId)"
                  [attr.aria-label]="'Toggle ' + member.displayName"
                >
                  <div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {{ member.displayName | initials }}
                  </div>
                  <span class="text-white font-medium text-sm flex-1 text-left">{{ member.displayName }}</span>
                  @if (randomizerService.selectedIds().has(member.userId)) {
                    <span class="text-green-400 text-lg" aria-hidden="true">✓</span>
                  }
                </button>
              </li>
            }
          </ul>
        }
      </section>
      <section aria-labelledby="spin-heading" class="space-y-6">
        <h2 id="spin-heading" class="sr-only">{{ 'RANDOMIZER.title' | translate }}</h2>
        <div class="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/10 text-center min-h-[200px] flex flex-col items-center justify-center">
          @if (randomizerService.isSpinning()) {
            <div class="space-y-4">
              <div class="text-5xl animate-bounce">🎲</div>
              <p class="text-white/70 text-sm animate-pulse">{{ 'RANDOMIZER.spinning' | translate }}</p>
            </div>
          } @else if (randomizerService.result()) {
            <div class="space-y-3">
              <div class="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white/30">
                {{ randomizerService.result()!.displayName | initials }}
              </div>
              <div>
                <p class="text-white/60 text-xs uppercase tracking-wide mb-1">{{ randomizerService.purpose() }}</p>
                <p class="text-white text-2xl font-bold">{{ randomizerService.result()!.displayName }}</p>
              </div>
              <span class="text-3xl">🏆</span>
            </div>
          } @else {
            <div class="text-white/40 space-y-2">
              <div class="text-4xl">🎯</div>
              <p class="text-sm">{{ 'RANDOMIZER.spin_hint' | translate }}</p>
            </div>
          }
        </div>
        @if (errorMessage()) {
          <div class="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-300" role="alert">
            {{ errorMessage() }}
          </div>
        }
        <div class="flex flex-col gap-3">
          <button
            hlmBtn
            type="button"
            (click)="spin()"
            [disabled]="randomizerService.isSpinning() || selectedCount() < 2"
            class="w-full rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 text-white font-bold py-4 text-lg shadow-lg"
          >
            @if (randomizerService.isSpinning()) {
              {{ 'RANDOMIZER.spinning_btn' | translate }}
            } @else {
              {{ 'RANDOMIZER.spin' | translate }}
            }
          </button>
          @if (randomizerService.result() && authService.isOrganizer()) {
            <button
              hlmBtn
              variant="outline"
              type="button"
              (click)="saveSession()"
              [disabled]="isSaving()"
              class="w-full rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium py-3"
            >
              @if (isSaving()) {
                {{ 'RANDOMIZER.saving' | translate }}
              } @else {
                {{ 'RANDOMIZER.save' | translate }}
              }
            </button>
          }
        </div>
        @if (randomizerService.history().length > 0) {
          <div class="space-y-3">
            <h3 class="text-white/70 text-sm font-medium uppercase tracking-wide">{{ 'RANDOMIZER.history_title' | translate }}</h3>
            <ul class="space-y-2">
              @for (session of randomizerService.history().slice(0, 5); track session.id) {
                <li class="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-white/60 text-xs truncate">{{ session.purpose }}</p>
                    @if (session.result) {
                      <p class="text-white text-sm font-medium">🏆 {{ session.result.displayName }}</p>
                    }
                  </div>
                  <span class="text-white/40 text-xs shrink-0">{{ session.createdAt | date:'dd.MM HH:mm' }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </section>
    </div>
  </div>
</div>
````

## File: src/app/features/randomizer/randomizer.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { RandomizerService } from '../../core/services/randomizer.service';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmInput } from '../../shared/spartan/input/src';
@Component({
  selector: 'app-randomizer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, TranslateModule, InitialsPipe, HlmButton, HlmInput],
  styleUrl: './randomizer.component.scss',
  templateUrl: './randomizer.component.html',
})
export class RandomizerComponent implements OnInit {
  protected readonly randomizerService = inject(RandomizerService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected clubId = '';
  protected readonly purposeControl = new FormControl('Хто представляє книгу?', {
    nonNullable: true,
    validators: [Validators.required],
  });
  // toSignal keeps OnPush change detection working without manual markForCheck
  private readonly _purposeValue = toSignal(this.purposeControl.valueChanges, {
    initialValue: this.purposeControl.value,
  });
  constructor() {
    effect(() => this.randomizerService.setPurpose(this._purposeValue()));
  }
  protected readonly selectedCount = computed(
    () =>
      this.randomizerService
        .candidates()
        .filter(m => this.randomizerService.selectedIds().has(m.userId)).length,
  );
  ngOnInit(): void {
    this.clubId = this.route.snapshot.params['id'] as string;
    this.randomizerService.loadClubMembers(this.clubId);
    this.randomizerService.loadHistory(this.clubId).catch(() => {});
  }
  protected spin(): void {
    this.errorMessage.set('');
    this.randomizerService.spin().catch(err => {
      this.errorMessage.set((err as Error).message);
    });
  }
  protected saveSession(): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.randomizerService
      .saveSession(this.clubId)
      .then(() => this.isSaving.set(false))
      .catch(err => {
        this.isSaving.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
  protected reset(): void {
    this.randomizerService.reset();
    this.errorMessage.set('');
  }
}
````

## File: src/app/layout/shell/shell.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatWidgetComponent } from '../../shared/chat/chat-widget/chat-widget.component';
import { ThemeService } from '../../core/services/theme.service';
@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatWidgetComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly _theme = inject(ThemeService);
}
````

## File: src/app/shared/components/empty-state/empty-state.component.html
````html
<div class="flex flex-col items-center justify-center py-16 px-4 text-center glass-card-subtle">
  <div class="text-5xl mb-4" aria-hidden="true">{{ icon() }}</div>
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title() }}</h3>
  <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{{ description() }}</p>
  @if (actionLabel()) {
    <button
      type="button"
      (click)="actionClick.emit()"
      class="bg-gradient-brand text-white px-5 py-2 rounded-[var(--bento-radius)] font-medium
             transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2
             focus:ring-primary-500 focus:ring-offset-2"
    >
      {{ actionLabel() }}
    </button>
  }
</div>
````

## File: src/app/shared/components/qr-code/qr-code.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import * as QRCode from 'qrcode';
import { environment } from '../../../../environments/environment';
import { HlmCard } from '../../spartan/card/src';
@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [HlmCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div hlmCard class="flex items-center justify-center p-6 w-fit gap-0 py-6">
      <canvas
        #canvas
        [style.width.px]="size()"
        [style.height.px]="size()"
        class="rounded-lg"
        [attr.aria-label]="'QR code'"
        role="img"
      ></canvas>
    </div>
  `,
})
export class QrCodeComponent {
  readonly value = input.required<string>();
  readonly size = input<number>(200);
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  constructor() {
    effect(() => {
      const val = this.value();
      const sz = this.size();
      const canvas = this.canvasRef().nativeElement;
      if (!val || !canvas) return;
      QRCode.toCanvas(canvas, val, { width: sz, margin: 2 }, (err) => {
        if (err && !environment.production) console.error('QR generation error:', err);
      });
    });
  }
}
````

## File: src/app/shared/pipes/initials.pipe.ts
````typescript
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'initials', standalone: true, pure: true })
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
}
````

## File: src/app/shared/spartan/badge/src/lib/hlm-badge.ts
````typescript
import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { type VariantProps, cva } from 'class-variance-authority';
const badgeVariants = cva(
	'h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&>ng-icon]:text-[calc(var(--spacing)*3)] group/badge focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:ring-[3px] [&>ng-icon]:pointer-events-none',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
				secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
				destructive: 'bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20',
				outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
				ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;
@Directive({
	selector: '[hlmBadge],hlm-badge',
	host: {
		'data-slot': 'badge',
		'[attr.data-variant]': 'variant()',
	},
})
export class HlmBadge {
	public readonly variant = input<BadgeVariants['variant']>('default');
	constructor() {
		classes(() => badgeVariants({ variant: this.variant() }));
	}
}
````

## File: src/app/shared/spartan/badge/src/index.ts
````typescript
import { HlmBadge } from './lib/hlm-badge';
export * from './lib/hlm-badge';
export const HlmBadgeImports = [HlmBadge] as const;
````

## File: src/app/shared/spartan/button/src/lib/hlm-button.token.ts
````typescript
import { InjectionToken, type ValueProvider, inject } from '@angular/core';
import type { ButtonVariants } from './hlm-button';
export interface BrnButtonConfig {
	variant: ButtonVariants['variant'];
	size: ButtonVariants['size'];
}
const defaultConfig: BrnButtonConfig = {
	variant: 'default',
	size: 'default',
};
const BrnButtonConfigToken = new InjectionToken<BrnButtonConfig>('BrnButtonConfig');
export function provideBrnButtonConfig(config: Partial<BrnButtonConfig>): ValueProvider {
	return { provide: BrnButtonConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectBrnButtonConfig(): BrnButtonConfig {
	return inject(BrnButtonConfigToken, { optional: true }) ?? defaultConfig;
}
````

## File: src/app/shared/spartan/button/src/lib/hlm-button.ts
````typescript
import { Directive, input, signal } from '@angular/core';
import { BrnButton } from '@spartan-ng/brain/button';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectBrnButtonConfig } from './hlm-button.token';
export const buttonVariants = cva(
	'focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 [&_ng-icon:not([class*=\'text-\'])]:text-[calc(var(--spacing)*4)] group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				outline: 'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground shadow-xs',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
				destructive: 'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				xs: 'h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_ng-icon:not([class*=\'text-\'])]:text-[calc(var(--spacing)*3)]',
				sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
				lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				icon: 'size-9',
				'icon-xs': 'size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_ng-icon:not([class*=\'text-\'])]:text-[calc(var(--spacing)*3)]',
				'icon-sm': 'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
@Directive({
	selector: 'button[hlmBtn], a[hlmBtn]',
	exportAs: 'hlmBtn',
	hostDirectives: [{ directive: BrnButton, inputs: ['disabled'] }],
	host: {
		'data-slot': 'button',
	},
})
export class HlmButton {
	private readonly _config = injectBrnButtonConfig();
	private readonly _additionalClasses = signal<ClassValue>('');
	public readonly variant = input<ButtonVariants['variant']>(this._config.variant);
	public readonly size = input<ButtonVariants['size']>(this._config.size);
	constructor() {
		classes(() => [buttonVariants({ variant: this.variant(), size: this.size() }), this._additionalClasses()]);
	}
	setClass(classes: string): void {
		this._additionalClasses.set(classes);
	}
}
````

## File: src/app/shared/spartan/button/src/index.ts
````typescript
import { HlmButton } from './lib/hlm-button';
export * from './lib/hlm-button';
export * from './lib/hlm-button.token';
export const HlmButtonImports = [HlmButton] as const;
````

## File: src/app/shared/spartan/card/src/lib/hlm-card-action.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCardAction]',
	host: {
		'data-slot': 'card-action',
	},
})
export class HlmCardAction {
	constructor() {
		classes(() => 'col-start-2 row-span-2 row-start-1 self-start justify-self-end');
	}
}
````

## File: src/app/shared/spartan/card/src/lib/hlm-card-content.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCardContent]',
	host: {
		'data-slot': 'card-content',
	},
})
export class HlmCardContent {
	constructor() {
		classes(() => 'px-6 group-data-[size=sm]/card:px-4');
	}
}
````

## File: src/app/shared/spartan/card/src/lib/hlm-card-description.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCardDescription]',
	host: {
		'data-slot': 'card-description',
	},
})
export class HlmCardDescription {
	constructor() {
		classes(() => 'text-muted-foreground text-sm');
	}
}
````

## File: src/app/shared/spartan/card/src/lib/hlm-card-footer.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCardFooter],hlm-card-footer',
	host: {
		'data-slot': 'card-footer',
	},
})
export class HlmCardFooter {
	constructor() {
		classes(() => 'rounded-b-xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4 flex items-center');
	}
}
````

## File: src/app/shared/spartan/card/src/lib/hlm-card-header.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCardHeader],hlm-card-header',
	host: {
		'data-slot': 'card-header',
	},
})
export class HlmCardHeader {
	constructor() {
		classes(
			() =>
				`gap-1 rounded-t-xl px-6 group-data-[size=sm]/card:px-4 [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]`,
		);
	}
}
````

## File: src/app/shared/spartan/card/src/lib/hlm-card-title.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCardTitle]',
	host: {
		'data-slot': 'card-title',
	},
})
export class HlmCardTitle {
	constructor() {
		classes(() => 'text-base leading-normal font-medium group-data-[size=sm]/card:text-sm');
	}
}
````

## File: src/app/shared/spartan/card/src/lib/hlm-card.ts
````typescript
import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmCard],hlm-card',
	host: {
		'data-slot': 'card',
		'[attr.data-size]': 'size()',
	},
})
export class HlmCard {
	public readonly size = input<'sm' | 'default'>('default');
	constructor() {
		classes(() => 'ring-foreground/10 bg-card text-card-foreground gap-6 overflow-hidden rounded-xl py-6 text-sm shadow-xs ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col');
	}
}
````

## File: src/app/shared/spartan/card/src/index.ts
````typescript
import { HlmCard } from './lib/hlm-card';
import { HlmCardAction } from './lib/hlm-card-action';
import { HlmCardContent } from './lib/hlm-card-content';
import { HlmCardDescription } from './lib/hlm-card-description';
import { HlmCardFooter } from './lib/hlm-card-footer';
import { HlmCardHeader } from './lib/hlm-card-header';
import { HlmCardTitle } from './lib/hlm-card-title';
export * from './lib/hlm-card';
export * from './lib/hlm-card-action';
export * from './lib/hlm-card-content';
export * from './lib/hlm-card-description';
export * from './lib/hlm-card-footer';
export * from './lib/hlm-card-header';
export * from './lib/hlm-card-title';
export const HlmCardImports = [
	HlmCard,
	HlmCardAction,
	HlmCardContent,
	HlmCardDescription,
	HlmCardFooter,
	HlmCardHeader,
	HlmCardTitle,
] as const;
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-checkbox-indicator.ts
````typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
@Component({
	selector: 'hlm-dropdown-menu-checkbox-indicator',
	imports: [NgIcon],
	providers: [provideIcons({ lucideCheck })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ng-icon class="text-base" name="lucideCheck" />
	`,
})
export class HlmDropdownMenuCheckboxIndicator {
	constructor() {
		classes(
			() =>
				'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center opacity-0 group-data-[checked]:opacity-100',
		);
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-checkbox.ts
````typescript
import { type BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemCheckbox } from '@angular/cdk/menu';
import { Directive, booleanAttribute, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuCheckbox]',
	hostDirectives: [
		{
			directive: CdkMenuItemCheckbox,
			inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked'],
			outputs: ['cdkMenuItemTriggered: triggered'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-checkbox-item',
		'[attr.data-disabled]': 'disabled() ? "" : null',
		'[attr.data-checked]': 'checked() ? "" : null',
	},
})
export class HlmDropdownMenuCheckbox {
	private readonly _cdkMenuItem = inject(CdkMenuItemCheckbox);
	public readonly checked = input<boolean, BooleanInput>(this._cdkMenuItem.checked, { transform: booleanAttribute });
	public readonly disabled = input<boolean, BooleanInput>(this._cdkMenuItem.disabled, { transform: booleanAttribute });
	constructor() {
		classes(
			() =>
				'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground group relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none has-[>hlm-dropdown-menu-checkbox-indicator:last-child]:ps-2 has-[>hlm-dropdown-menu-checkbox-indicator:last-child]:pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 has-[>hlm-dropdown-menu-checkbox-indicator:last-child]:[&>hlm-dropdown-menu-checkbox-indicator]:start-auto has-[>hlm-dropdown-menu-checkbox-indicator:last-child]:[&>hlm-dropdown-menu-checkbox-indicator]:end-2',
		);
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-group.ts
````typescript
import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuGroup],hlm-dropdown-menu-group',
	hostDirectives: [CdkMenuGroup],
	host: {
		'data-slot': 'dropdown-menu-group',
	},
})
export class HlmDropdownMenuGroup {
	constructor() {
		classes(() => 'block');
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-item-sub-indicator.ts
````typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
@Component({
	selector: 'hlm-dropdown-menu-item-sub-indicator',
	imports: [NgIcon],
	providers: [provideIcons({ lucideChevronRight })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ng-icon name="lucideChevronRight" class="text-base" />
	`,
})
export class HlmDropdownMenuItemSubIndicator {
	constructor() {
		classes(() => 'ms-auto size-4');
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-item.ts
````typescript
import { type BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, Directive, HOST_TAG_NAME, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuItem]',
	hostDirectives: [
		{
			directive: CdkMenuItem,
			inputs: ['cdkMenuItemDisabled: disabled'],
			outputs: ['cdkMenuItemTriggered: triggered'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-item',
		'[attr.disabled]': '_isButton && disabled() ? "" : null',
		'[attr.data-disabled]': 'disabled() ? "" : null',
		'[attr.data-variant]': 'variant()',
		'[attr.data-inset]': 'inset() ? "" : null',
	},
})
export class HlmDropdownMenuItem {
	protected readonly _isButton = inject(HOST_TAG_NAME) === 'button';
	public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly variant = input<'default' | 'destructive'>('default');
	public readonly inset = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});
	constructor() {
		classes(
			() =>
				"hover:bg-accent focus-visible:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[ng-icon]:!text-destructive [&_ng-icon:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_svg:not([class*='text-'])]:text-base",
		);
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-label.ts
````typescript
import { type BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuLabel],hlm-dropdown-menu-label',
	host: {
		'data-slot': 'dropdown-menu-label',
		'[attr.data-inset]': 'inset() ? "" : null',
	},
})
export class HlmDropdownMenuLabel {
	constructor() {
		classes(() => 'block px-2 py-1.5 text-sm font-medium data-[inset]:pl-8');
	}
	public readonly inset = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-radio-indicator.ts
````typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircle } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
@Component({
	selector: 'hlm-dropdown-menu-radio-indicator',
	imports: [NgIcon],
	providers: [provideIcons({ lucideCircle })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ng-icon name="lucideCircle" class="text-[0.5rem] *:[svg]:fill-current" />
	`,
})
export class HlmDropdownMenuRadioIndicator {
	constructor() {
		classes(
			() =>
				'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center opacity-0 group-data-[checked]:opacity-100',
		);
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-radio.ts
````typescript
import { type BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemRadio } from '@angular/cdk/menu';
import { Directive, booleanAttribute, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuRadio]',
	hostDirectives: [
		{
			directive: CdkMenuItemRadio,
			inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked'],
			outputs: ['cdkMenuItemTriggered: triggered'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-radio-item',
		'[attr.data-disabled]': 'disabled() ? "" : null',
		'[attr.data-checked]': 'checked() ? "" : null',
	},
})
export class HlmDropdownMenuRadio {
	private readonly _cdkMenuItem = inject(CdkMenuItemRadio);
	public readonly checked = input<boolean, BooleanInput>(this._cdkMenuItem.checked, { transform: booleanAttribute });
	public readonly disabled = input<boolean, BooleanInput>(this._cdkMenuItem.disabled, { transform: booleanAttribute });
	constructor() {
		classes(
			() =>
				'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground group relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		);
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-separator.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuSeparator],hlm-dropdown-menu-separator',
	host: {
		'data-slot': 'dropdown-menu-separator',
	},
})
export class HlmDropdownMenuSeparator {
	constructor() {
		classes(() => 'bg-border -mx-1 my-1 block h-px');
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-shortcut.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuShortcut],hlm-dropdown-menu-shortcut',
	host: {
		'data-slot': 'dropdown-menu-shortcut',
	},
})
export class HlmDropdownMenuShortcut {
	constructor() {
		classes(() => 'text-muted-foreground ml-auto text-xs tracking-widest');
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-sub.ts
````typescript
import { CdkMenu } from '@angular/cdk/menu';
import { Directive, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenuSub],hlm-dropdown-menu-sub',
	hostDirectives: [CdkMenu],
	host: {
		'data-slot': 'dropdown-menu-sub',
		'[attr.data-state]': '_state()',
		'[attr.data-side]': '_side()',
	},
})
export class HlmDropdownMenuSub {
	private readonly _host = inject(CdkMenu);
	protected readonly _state = signal('open');
	protected readonly _side = signal('top');
	constructor() {
		this.setSideWithDarkMagic();
		this._host.closed.pipe(takeUntilDestroyed()).subscribe(() => this._state.set('closed'));
		classes(
			() =>
				'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-top overflow-hidden rounded-md border p-1 shadow-lg',
		);
	}
	private setSideWithDarkMagic() {
		const isRoot = this._host.menuStack.peek() === undefined;
		setTimeout(() => {
			const ps = (this._host as any)._parentTrigger._spartanLastPosition;
			if (!ps) {
				this._side.set(isRoot ? 'top' : 'left');
				return;
			}
			const side = isRoot ? ps.originY : ps.originX === 'end' ? 'right' : 'left';
			this._side.set(side);
		});
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-token.ts
````typescript
import { InjectionToken, type ValueProvider, inject } from '@angular/core';
import { type MenuAlign, type MenuSide } from '@spartan-ng/brain/core';
export interface HlmDropdownMenuConfig {
	align: MenuAlign;
	side: MenuSide;
}
const defaultConfig: HlmDropdownMenuConfig = {
	align: 'start',
	side: 'bottom',
};
const HlmDropdownMenuConfigToken = new InjectionToken<HlmDropdownMenuConfig>('HlmDropdownMenuConfig');
export function provideHlmDropdownMenuConfig(config: Partial<HlmDropdownMenuConfig>): ValueProvider {
	return { provide: HlmDropdownMenuConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectHlmDropdownMenuConfig(): HlmDropdownMenuConfig {
	return inject(HlmDropdownMenuConfigToken, { optional: true }) ?? defaultConfig;
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu-trigger.ts
````typescript
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { computed, Directive, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createMenuPosition, type MenuAlign, type MenuSide } from '@spartan-ng/brain/core';
import { injectHlmDropdownMenuConfig } from './hlm-dropdown-menu-token';
@Directive({
	selector: '[hlmDropdownMenuTrigger]',
	hostDirectives: [
		{
			directive: CdkMenuTrigger,
			inputs: ['cdkMenuTriggerFor: hlmDropdownMenuTrigger', 'cdkMenuTriggerData: hlmDropdownMenuTriggerData'],
			outputs: ['cdkMenuOpened: hlmDropdownMenuOpened', 'cdkMenuClosed: hlmDropdownMenuClosed'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-trigger',
	},
})
export class HlmDropdownMenuTrigger {
	private readonly _cdkTrigger = inject(CdkMenuTrigger, { host: true });
	private readonly _config = injectHlmDropdownMenuConfig();
	public readonly align = input<MenuAlign>(this._config.align);
	public readonly side = input<MenuSide>(this._config.side);
	private readonly _menuPosition = computed(() => createMenuPosition(this.align(), this.side()));
	constructor() {
		this._cdkTrigger.opened.pipe(takeUntilDestroyed()).subscribe(() =>
			setTimeout(
				() =>
					((this._cdkTrigger as any)._spartanLastPosition =
						(this._cdkTrigger as any).overlayRef._positionStrategy._lastPosition),
			),
		);
		effect(() => {
			this._cdkTrigger.menuPosition = this._menuPosition();
		});
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/lib/hlm-dropdown-menu.ts
````typescript
import { type NumberInput } from '@angular/cdk/coercion';
import { CdkMenu } from '@angular/cdk/menu';
import { Directive, inject, input, numberAttribute, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmDropdownMenu],hlm-dropdown-menu',
	hostDirectives: [CdkMenu],
	host: {
		'data-slot': 'dropdown-menu',
		'[attr.data-state]': '_state()',
		'[attr.data-side]': '_side()',
		'[style.--side-offset]': 'sideOffset()',
	},
})
export class HlmDropdownMenu {
	private readonly _host = inject(CdkMenu);
	protected readonly _state = signal('open');
	protected readonly _side = signal('top');
	public readonly sideOffset = input<number, NumberInput>(1, { transform: numberAttribute });
	constructor() {
		classes(
			() =>
				'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 my-[--spacing(var(--side-offset))] min-w-[8rem] origin-top overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
		);
		this.setSideWithDarkMagic();
		this._host.closed.pipe(takeUntilDestroyed()).subscribe(() => this._state.set('closed'));
	}
	private setSideWithDarkMagic() {
		const isRoot = this._host.menuStack.peek() === undefined;
		setTimeout(() => {
			const ps = (this._host as any)._parentTrigger._spartanLastPosition;
			if (!ps) {
				this._side.set(isRoot ? 'top' : 'left');
				return;
			}
			const side = isRoot ? ps.originY : ps.originX === 'end' ? 'right' : 'left';
			this._side.set(side);
		});
	}
}
````

## File: src/app/shared/spartan/dropdown-menu/src/index.ts
````typescript
import { HlmDropdownMenu } from './lib/hlm-dropdown-menu';
import { HlmDropdownMenuCheckbox } from './lib/hlm-dropdown-menu-checkbox';
import { HlmDropdownMenuCheckboxIndicator } from './lib/hlm-dropdown-menu-checkbox-indicator';
import { HlmDropdownMenuGroup } from './lib/hlm-dropdown-menu-group';
import { HlmDropdownMenuItem } from './lib/hlm-dropdown-menu-item';
import { HlmDropdownMenuItemSubIndicator } from './lib/hlm-dropdown-menu-item-sub-indicator';
import { HlmDropdownMenuLabel } from './lib/hlm-dropdown-menu-label';
import { HlmDropdownMenuRadio } from './lib/hlm-dropdown-menu-radio';
import { HlmDropdownMenuRadioIndicator } from './lib/hlm-dropdown-menu-radio-indicator';
import { HlmDropdownMenuSeparator } from './lib/hlm-dropdown-menu-separator';
import { HlmDropdownMenuShortcut } from './lib/hlm-dropdown-menu-shortcut';
import { HlmDropdownMenuSub } from './lib/hlm-dropdown-menu-sub';
import { HlmDropdownMenuTrigger } from './lib/hlm-dropdown-menu-trigger';
export * from './lib/hlm-dropdown-menu';
export * from './lib/hlm-dropdown-menu-checkbox';
export * from './lib/hlm-dropdown-menu-checkbox-indicator';
export * from './lib/hlm-dropdown-menu-group';
export * from './lib/hlm-dropdown-menu-item';
export * from './lib/hlm-dropdown-menu-item-sub-indicator';
export * from './lib/hlm-dropdown-menu-label';
export * from './lib/hlm-dropdown-menu-radio';
export * from './lib/hlm-dropdown-menu-radio-indicator';
export * from './lib/hlm-dropdown-menu-separator';
export * from './lib/hlm-dropdown-menu-shortcut';
export * from './lib/hlm-dropdown-menu-sub';
export * from './lib/hlm-dropdown-menu-token';
export * from './lib/hlm-dropdown-menu-trigger';
export const HlmDropdownMenuImports = [
	HlmDropdownMenu,
	HlmDropdownMenuCheckbox,
	HlmDropdownMenuCheckboxIndicator,
	HlmDropdownMenuGroup,
	HlmDropdownMenuItem,
	HlmDropdownMenuItemSubIndicator,
	HlmDropdownMenuLabel,
	HlmDropdownMenuRadio,
	HlmDropdownMenuRadioIndicator,
	HlmDropdownMenuSeparator,
	HlmDropdownMenuShortcut,
	HlmDropdownMenuSub,
	HlmDropdownMenuTrigger,
] as const;
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-content.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmFieldContent],hlm-field-content',
	host: {
		'data-slot': 'field-content',
	},
})
export class HlmFieldContent {
	constructor() {
		classes(() => 'group/field-content flex flex-1 flex-col gap-1 leading-snug');
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-description.ts
````typescript
import { Directive, effect, EffectRef, inject, input, OnDestroy } from '@angular/core';
import { BrnFieldA11yService } from '@spartan-ng/brain/field';
import { classes } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
@Directive({
	selector: '[hlmFieldDescription],hlm-field-description',
	host: {
		'data-slot': 'field-description',
		'[attr.id]': 'id()',
	},
})
export class HlmFieldDescription implements OnDestroy {
	private static _id = 0;
	private readonly _a11y = inject(BrnFieldA11yService, { optional: true, host: true });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly id = input<string>(`hlm-field-description-${HlmFieldDescription._id++}`);
	private _registeredId?: string;
	private readonly _cleanup: EffectRef | null = this._a11y
		? effect(() => {
				const a11y = this._a11y;
				if (!a11y) return;
				const id = this.id();
				if (this._registeredId && this._registeredId !== id) {
					a11y.unregisterDescription(this._registeredId);
				}
				if (this._registeredId !== id) {
					a11y.registerDescription(id);
					this._registeredId = id;
				}
			})
		: null;
	constructor() {
		classes(() => [
			'text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
			'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5',
			'[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
			this.userClass(),
		]);
	}
	ngOnDestroy() {
		this._cleanup?.destroy();
		if (this._registeredId) {
			this._a11y?.unregisterDescription(this._registeredId);
		}
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-error.ts
````typescript
import { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	EffectRef,
	inject,
	input,
	OnDestroy,
} from '@angular/core';
import { BrnField, BrnFieldA11yService } from '@spartan-ng/brain/field';
import { classes } from '@spartan-ng/helm/utils';
import { ClassValue } from 'clsx';
@Component({
	selector: 'hlm-field-error',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		role: 'alert',
		'data-slot': 'field-error',
		'[attr.id]': 'id()',
		'[hidden]': '!_display()',
	},
	template: `
		@if (_display()) {
			<ng-content />
		}
	`,
})
export class HlmFieldError implements OnDestroy {
	private static _id = 0;
	private readonly _field = inject(BrnField, { optional: true });
	private readonly _a11y = inject(BrnFieldA11yService, { optional: true, host: true });
	private _registeredId?: string;
	private readonly _hasParentField = !!this._field;
	public readonly id = input<string>(`hlm-field-error-${HlmFieldError._id++}`);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly validator = input<string>();
	public readonly forceShow = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	protected readonly _display = computed(() => !this._hasParentField || this.forceShow() || this._hasError());
	protected readonly _hasError = computed(() => {
		const errors = this._field?.errors();
		if (!errors) return false;
		const validator = this.validator();
		const spartanInvalid = this._field?.controlState()?.spartanInvalid;
		if (!spartanInvalid) return false;
		return validator ? validator in errors : Object.keys(errors).length > 0;
	});
	private readonly _cleanup: EffectRef | null = this._a11y
		? effect(() => {
				const a11y = this._a11y;
				if (!a11y) return;
				const id = this.id();
				const hasError = this._hasError();
				if (this._registeredId && (this._registeredId !== id || !hasError)) {
					a11y.unregisterError(this._registeredId);
					this._registeredId = undefined;
				}
				if (hasError && this._registeredId !== id) {
					a11y.registerError(id);
					this._registeredId = id;
				}
			})
		: null;
	constructor() {
		classes(() => ['text-destructive text-sm font-normal', this.userClass()]);
	}
	ngOnDestroy() {
		this._cleanup?.destroy();
		if (this._registeredId) {
			this._a11y?.unregisterError(this._registeredId);
		}
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-group.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmFieldGroup],hlm-field-group',
	host: {
		'data-slot': 'field-group',
	},
})
export class HlmFieldGroup {
	constructor() {
		classes(
			() =>
				'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
		);
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-label.ts
````typescript
import { Directive } from '@angular/core';
import { HlmLabel } from '@spartan-ng/helm/label';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmFieldLabel],hlm-field-label',
	hostDirectives: [HlmLabel],
	host: {
		'data-slot': 'field-label',
	},
})
export class HlmFieldLabel {
	constructor() {
		classes(() => [
			'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
			'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
			'has-data-[checked=true]:bg-primary/5 has-data-[checked=true]:border-primary dark:has-data-[checked=true]:bg-primary/10',
			'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
		]);
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-legend.ts
````typescript
import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: 'legend[hlmFieldLegend]',
	host: {
		'data-slot': 'field-legend',
		'[attr.data-variant]': 'variant()',
	},
})
export class HlmFieldLegend {
	public readonly variant = input<'label' | 'legend'>('legend');
	constructor() {
		classes(() => 'mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base');
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-separator.ts
````typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { classes } from '@spartan-ng/helm/utils';
@Component({
	selector: 'hlm-field-separator',
	imports: [HlmSeparator],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'field-separator',
	},
	template: `
		<hlm-separator class="absolute inset-0 top-1/2" />
		<span
			data-slot="field-separator-content"
			class="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
		>
			<ng-content />
		</span>
	`,
})
export class HlmFieldSeparator {
	constructor() {
		classes(() => 'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2');
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-set.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: 'fieldset[hlmFieldSet]',
	host: {
		'data-slot': 'field-set',
	},
})
export class HlmFieldSet {
	constructor() {
		classes(() => [
			'flex flex-col gap-6',
			'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
		]);
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field-title.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmFieldTitle],hlm-field-title',
	host: {
		'data-slot': 'field-label',
	},
})
export class HlmFieldTitle {
	constructor() {
		classes(
			() =>
				'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
		);
	}
}
````

## File: src/app/shared/spartan/field/src/lib/hlm-field.ts
````typescript
import { Directive, input } from '@angular/core';
import { BrnField } from '@spartan-ng/brain/field';
import { classes } from '@spartan-ng/helm/utils';
import { cva, VariantProps } from 'class-variance-authority';
const fieldVariants = cva('group/field data-[matches-spartan-invalid=true]:text-destructive flex w-full gap-3', {
	variants: {
		orientation: {
			vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
			horizontal: [
				'flex-row items-center',
				'*:data-[slot=field-label]:flex-auto',
				'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
			],
			responsive: [
				'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto [&>.sr-only]:w-auto',
				'@md/field-group:*:data-[slot=field-label]:flex-auto',
				'@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
			],
		},
	},
	defaultVariants: {
		orientation: 'vertical',
	},
});
export type FieldVariants = VariantProps<typeof fieldVariants>;
@Directive({
	selector: '[hlmField],hlm-field',
	hostDirectives: [{ directive: BrnField, inputs: ['data-invalid', 'forceInvalid'] }],
	host: {
		role: 'group',
		'data-slot': 'field',
		'[attr.data-orientation]': 'orientation()',
	},
})
export class HlmField {
	public readonly orientation = input<FieldVariants['orientation']>('vertical');
	constructor() {
		classes(() => fieldVariants({ orientation: this.orientation() }));
	}
}
````

## File: src/app/shared/spartan/field/src/index.ts
````typescript
import { HlmField } from './lib/hlm-field';
import { HlmFieldContent } from './lib/hlm-field-content';
import { HlmFieldDescription } from './lib/hlm-field-description';
import { HlmFieldError } from './lib/hlm-field-error';
import { HlmFieldGroup } from './lib/hlm-field-group';
import { HlmFieldLabel } from './lib/hlm-field-label';
import { HlmFieldLegend } from './lib/hlm-field-legend';
import { HlmFieldSeparator } from './lib/hlm-field-separator';
import { HlmFieldSet } from './lib/hlm-field-set';
import { HlmFieldTitle } from './lib/hlm-field-title';
export * from './lib/hlm-field';
export * from './lib/hlm-field-content';
export * from './lib/hlm-field-description';
export * from './lib/hlm-field-error';
export * from './lib/hlm-field-group';
export * from './lib/hlm-field-label';
export * from './lib/hlm-field-legend';
export * from './lib/hlm-field-separator';
export * from './lib/hlm-field-set';
export * from './lib/hlm-field-title';
export const HlmFieldImports = [
	HlmField,
	HlmFieldContent,
	HlmFieldDescription,
	HlmFieldError,
	HlmFieldGroup,
	HlmFieldLabel,
	HlmFieldLegend,
	HlmFieldSeparator,
	HlmFieldSet,
	HlmFieldTitle,
] as const;
````

## File: src/app/shared/spartan/icon/src/lib/hlm-icon.token.ts
````typescript
import { InjectionToken, type ValueProvider, inject } from '@angular/core';
import type { IconSize } from './hlm-icon';
export interface HlmIconConfig {
	size: IconSize;
}
const defaultConfig: HlmIconConfig = {
	size: 'base',
};
const HlmIconConfigToken = new InjectionToken<HlmIconConfig>('HlmIconConfig');
export function provideHlmIconConfig(config: Partial<HlmIconConfig>): ValueProvider {
	return { provide: HlmIconConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectHlmIconConfig(): HlmIconConfig {
	return inject(HlmIconConfigToken, { optional: true }) ?? defaultConfig;
}
````

## File: src/app/shared/spartan/icon/src/lib/hlm-icon.ts
````typescript
import { Directive, computed, input } from '@angular/core';
import { injectHlmIconConfig } from './hlm-icon.token';
export type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'none' | (Record<never, never> & string);
@Directive({
	selector: 'ng-icon[hlmIcon], ng-icon[hlm]',
	host: {
		'[style.--ng-icon__size]': '_computedSize()',
	},
})
export class HlmIcon {
	private readonly _config = injectHlmIconConfig();
	public readonly size = input<IconSize>(this._config.size);
	protected readonly _computedSize = computed(() => {
		const size = this.size();
		switch (size) {
			case 'xs':
				return '12px';
			case 'sm':
				return '16px';
			case 'base':
				return '24px';
			case 'lg':
				return '32px';
			case 'xl':
				return '48px';
			default: {
				return size;
			}
		}
	});
}
````

## File: src/app/shared/spartan/icon/src/index.ts
````typescript
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from './lib/hlm-icon';
export * from './lib/hlm-icon';
export * from './lib/hlm-icon.token';
export const HlmIconImports = [HlmIcon, NgIcon] as const;
````

## File: src/app/shared/spartan/input/src/lib/hlm-input.ts
````typescript
import { Directive, input, linkedSignal } from '@angular/core';
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { BrnInput } from '@spartan-ng/brain/input';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';
export const inputVariants = cva(
	'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			error: {
				auto: 'data-[matches-spartan-invalid=true]:border-destructive data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40',
				true: 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
			},
		},
		defaultVariants: {
			error: 'auto',
		},
	},
);
type InputVariants = VariantProps<typeof inputVariants>;
@Directive({
	selector: '[hlmInput]',
	hostDirectives: [{ directive: BrnInput, inputs: ['id'] }, BrnFieldControlDescribedBy],
})
export class HlmInput {
	public readonly error = input<InputVariants['error']>('auto');
	protected readonly _state = linkedSignal(() => ({ error: this.error() }));
	constructor() {
		classes(() => inputVariants({ error: this._state().error }));
	}
}
````

## File: src/app/shared/spartan/input/src/index.ts
````typescript
import { HlmInput } from './lib/hlm-input';
export * from './lib/hlm-input';
export const HlmInputImports = [HlmInput] as const;
````

## File: src/app/shared/spartan/label/src/lib/hlm-label.ts
````typescript
import { Directive } from '@angular/core';
import { BrnLabel } from '@spartan-ng/brain/label';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmLabel]',
	hostDirectives: [
		{
			directive: BrnLabel,
			inputs: ['id', 'for'],
		},
	],
	host: {
		'data-slot': 'label',
	},
})
export class HlmLabel {
	constructor() {
		classes(
			() =>
				'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50 has-[[disabled]]:cursor-not-allowed has-[[disabled]]:opacity-50',
		);
	}
}
````

## File: src/app/shared/spartan/label/src/index.ts
````typescript
import { HlmLabel } from './lib/hlm-label';
export * from './lib/hlm-label';
export const HlmLabelImports = [HlmLabel] as const;
````

## File: src/app/shared/spartan/separator/src/lib/hlm-separator.ts
````typescript
import { Directive } from '@angular/core';
import { BrnSeparator } from '@spartan-ng/brain/separator';
import { classes } from '@spartan-ng/helm/utils';
export const hlmSeparatorClass =
	'inline-flex shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch';
@Directive({
	selector: '[hlmSeparator],hlm-separator',
	hostDirectives: [{ directive: BrnSeparator, inputs: ['orientation', 'decorative'] }],
})
export class HlmSeparator {
	constructor() {
		classes(() => hlmSeparatorClass);
	}
}
````

## File: src/app/shared/spartan/separator/src/index.ts
````typescript
import { HlmSeparator } from './lib/hlm-separator';
export * from './lib/hlm-separator';
export const HlmSeparatorImports = [HlmSeparator] as const;
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-close.ts
````typescript
import { Directive } from '@angular/core';
import { BrnSheetClose } from '@spartan-ng/brain/sheet';
@Directive({
	selector: 'button[hlmSheetClose]',
	hostDirectives: [{ directive: BrnSheetClose, inputs: ['delay'] }],
	host: {
		'data-slot': 'sheet-close',
	},
})
export class HlmSheetClose {}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-content.ts
````typescript
import type { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	effect,
	ElementRef,
	inject,
	input,
	Renderer2,
	signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { injectExposedSideProvider, injectExposesStateProvider } from '@spartan-ng/brain/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import { HlmSheetClose } from './hlm-sheet-close';
export const sheetVariants = cva(
	'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
	{
		variants: {
			side: {
				top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
				bottom:
					'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
				left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
				right:
					'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
			},
		},
		defaultVariants: {
			side: 'right',
		},
	},
);
@Component({
	selector: 'hlm-sheet-content',
	imports: [HlmIconImports, HlmButton, HlmSheetClose],
	providers: [provideIcons({ lucideX })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'sheet-content',
		'[attr.data-state]': 'state()',
	},
	template: `
		<ng-content />
		@if (showCloseButton()) {
			<button hlmBtn variant="ghost" size="icon-sm" class="absolute end-4 top-4" hlmSheetClose>
				<span class="sr-only">Close</span>
				<ng-icon hlm size="sm" name="lucideX" />
			</button>
		}
	`,
})
export class HlmSheetContent {
	private readonly _stateProvider = injectExposesStateProvider({ host: true });
	private readonly _sideProvider = injectExposedSideProvider({ host: true });
	public readonly state = this._stateProvider.state ?? signal('closed');
	private readonly _renderer = inject(Renderer2);
	private readonly _element = inject(ElementRef);
	public readonly showCloseButton = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	constructor() {
		classes(() => sheetVariants({ side: this._sideProvider.side() }));
		effect(() => {
			this._renderer.setAttribute(this._element.nativeElement, 'data-state', this.state());
		});
	}
}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-description.ts
````typescript
import { Directive } from '@angular/core';
import { BrnSheetDescription } from '@spartan-ng/brain/sheet';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmSheetDescription]',
	hostDirectives: [BrnSheetDescription],
	host: {
		'data-slot': 'sheet-description',
	},
})
export class HlmSheetDescription {
	constructor() {
		classes(() => 'text-muted-foreground text-sm');
	}
}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-footer.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmSheetFooter],hlm-sheet-footer',
	host: {
		'data-slot': 'sheet-footer',
	},
})
export class HlmSheetFooter {
	constructor() {
		classes(() => 'mt-auto flex flex-col gap-2 p-4');
	}
}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-header.ts
````typescript
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmSheetHeader],hlm-sheet-header',
	host: {
		'data-slot': 'sheet-header',
	},
})
export class HlmSheetHeader {
	constructor() {
		classes(() => 'flex flex-col gap-1.5 p-4');
	}
}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-overlay.ts
````typescript
import { Directive, computed, effect, input, untracked } from '@angular/core';
import { injectCustomClassSettable } from '@spartan-ng/brain/core';
import { BrnSheetOverlay } from '@spartan-ng/brain/sheet';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
@Directive({
	selector: '[hlmSheetOverlay],hlm-sheet-overlay',
	hostDirectives: [BrnSheetOverlay],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmSheetOverlay {
	private readonly _classSettable = injectCustomClassSettable({ optional: true, host: true });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/50',
			this.userClass(),
		),
	);
	constructor() {
		effect(() => {
			const classValue = this._computedClass();
			untracked(() => this._classSettable?.setClassToCustomElement(classValue));
		});
	}
}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-portal.ts
````typescript
import { Directive } from '@angular/core';
import { BrnSheetContent } from '@spartan-ng/brain/sheet';
@Directive({
	selector: '[hlmSheetPortal]',
	hostDirectives: [{ directive: BrnSheetContent, inputs: ['context', 'class'] }],
})
export class HlmSheetPortal {}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-title.ts
````typescript
import { Directive } from '@angular/core';
import { BrnSheetTitle } from '@spartan-ng/brain/sheet';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmSheetTitle]',
	hostDirectives: [BrnSheetTitle],
	host: {
		'data-slot': 'sheet-title',
	},
})
export class HlmSheetTitle {
	constructor() {
		classes(() => 'text-foreground font-semibold');
	}
}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet-trigger.ts
````typescript
import { Directive } from '@angular/core';
import { BrnSheetTrigger } from '@spartan-ng/brain/sheet';
@Directive({
	selector: 'button[hlmSheetTrigger]',
	hostDirectives: [{ directive: BrnSheetTrigger, inputs: ['id', 'side', 'type'] }],
	host: {
		'data-slot': 'sheet-trigger',
	},
})
export class HlmSheetTrigger {}
````

## File: src/app/shared/spartan/sheet/src/lib/hlm-sheet.ts
````typescript
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { BrnSheet } from '@spartan-ng/brain/sheet';
import { HlmSheetOverlay } from './hlm-sheet-overlay';
@Component({
	selector: 'hlm-sheet',
	exportAs: 'hlmSheet',
	imports: [HlmSheetOverlay],
	providers: [
		{
			provide: BrnDialog,
			useExisting: forwardRef(() => BrnSheet),
		},
		{
			provide: BrnSheet,
			useExisting: forwardRef(() => HlmSheet),
		},
		provideBrnDialogDefaultOptions({
		}),
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<hlm-sheet-overlay />
		<ng-content />
	`,
})
export class HlmSheet extends BrnSheet {}
````

## File: src/app/shared/spartan/sheet/src/index.ts
````typescript
import { HlmSheet } from './lib/hlm-sheet';
import { HlmSheetClose } from './lib/hlm-sheet-close';
import { HlmSheetContent } from './lib/hlm-sheet-content';
import { HlmSheetDescription } from './lib/hlm-sheet-description';
import { HlmSheetFooter } from './lib/hlm-sheet-footer';
import { HlmSheetHeader } from './lib/hlm-sheet-header';
import { HlmSheetOverlay } from './lib/hlm-sheet-overlay';
import { HlmSheetPortal } from './lib/hlm-sheet-portal';
import { HlmSheetTitle } from './lib/hlm-sheet-title';
import { HlmSheetTrigger } from './lib/hlm-sheet-trigger';
export * from './lib/hlm-sheet';
export * from './lib/hlm-sheet-close';
export * from './lib/hlm-sheet-content';
export * from './lib/hlm-sheet-description';
export * from './lib/hlm-sheet-footer';
export * from './lib/hlm-sheet-header';
export * from './lib/hlm-sheet-overlay';
export * from './lib/hlm-sheet-portal';
export * from './lib/hlm-sheet-title';
export * from './lib/hlm-sheet-trigger';
export const HlmSheetImports = [
	HlmSheet,
	HlmSheetClose,
	HlmSheetContent,
	HlmSheetDescription,
	HlmSheetFooter,
	HlmSheetHeader,
	HlmSheetOverlay,
	HlmSheetPortal,
	HlmSheetTitle,
	HlmSheetTrigger,
] as const;
````

## File: src/app/shared/spartan/sonner/src/lib/hlm-toaster.ts
````typescript
import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideInfo, lucideLoader2, lucideOctagonX, lucideTriangleAlert } from '@ng-icons/lucide';
import { BrnSonnerImports, type ToasterProps } from '@spartan-ng/brain/sonner';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
@Component({
	selector: 'hlm-toaster',
	imports: [BrnSonnerImports, NgIcon],
	providers: [provideIcons({ lucideCircleCheck, lucideInfo, lucideTriangleAlert, lucideOctagonX, lucideLoader2 })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<brn-sonner-toaster
			[class]="_computedClass()"
			[invert]="invert()"
			[theme]="theme()"
			[position]="position()"
			[hotKey]="hotKey()"
			[richColors]="richColors()"
			[expand]="expand()"
			[duration]="duration()"
			[visibleToasts]="visibleToasts()"
			[closeButton]="closeButton()"
			[toastOptions]="toastOptions()"
			[offset]="offset()"
			[style]="userStyle()"
		>
			<ng-template #loadingIcon>
				<ng-icon name="lucideLoader2" class="overflow-visible! text-base [&>svg]:motion-safe:animate-spin" />
			</ng-template>
			<ng-template #successIcon>
				<ng-icon name="lucideCircleCheck" class="overflow-visible! text-base" />
			</ng-template>
			<ng-template #errorIcon>
				<ng-icon name="lucideOctagonX" class="overflow-visible! text-base" />
			</ng-template>
			<ng-template #infoIcon>
				<ng-icon name="lucideInfo" class="overflow-visible! text-base" />
			</ng-template>
			<ng-template #warningIcon>
				<ng-icon name="lucideTriangleAlert" class="overflow-visible! text-base" />
			</ng-template>
		</brn-sonner-toaster>
	`,
})
export class HlmToaster {
	public readonly invert = input<ToasterProps['invert'], BooleanInput>(false, {
		transform: booleanAttribute,
	});
	public readonly theme = input<ToasterProps['theme']>('light');
	public readonly position = input<ToasterProps['position']>('bottom-right');
	public readonly hotKey = input<ToasterProps['hotkey']>(['altKey', 'KeyT']);
	public readonly richColors = input<ToasterProps['richColors'], BooleanInput>(false, {
		transform: booleanAttribute,
	});
	public readonly expand = input<ToasterProps['expand'], BooleanInput>(false, {
		transform: booleanAttribute,
	});
	public readonly duration = input<ToasterProps['duration'], NumberInput>(4000, {
		transform: numberAttribute,
	});
	public readonly visibleToasts = input<ToasterProps['visibleToasts'], NumberInput>(3, {
		transform: numberAttribute,
	});
	public readonly closeButton = input<ToasterProps['closeButton'], BooleanInput>(false, {
		transform: booleanAttribute,
	});
	public readonly toastOptions = input<ToasterProps['toastOptions']>({});
	public readonly offset = input<ToasterProps['offset']>(null);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly userStyle = input<Record<string, string>>(
		{
			'--normal-bg': 'var(--popover)',
			'--normal-text': 'var(--popover-foreground)',
			'--normal-border': 'var(--border)',
			'--border-radius': 'var(--radius)',
		},
		{ alias: 'style' },
	);
	protected readonly _computedClass = computed(() => hlm('toaster group', this.userClass()));
}
````

## File: src/app/shared/spartan/sonner/src/index.ts
````typescript
import { HlmToaster } from './lib/hlm-toaster';
export * from './lib/hlm-toaster';
export const HlmToasterImports = [HlmToaster] as const;
````

## File: src/app/shared/spartan/spinner/src/lib/hlm-spinner.ts
````typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
@Component({
	selector: 'hlm-spinner',
	imports: [NgIcon],
	providers: [provideIcons({ lucideLoader2 })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		role: 'status',
		'[attr.aria-label]': 'ariaLabel()',
	},
	template: `
		<ng-icon [name]="icon()" />
	`,
})
export class HlmSpinner {
	public readonly icon = input<string>('lucideLoader2');
	public readonly ariaLabel = input<string>('Loading', { alias: 'aria-label' });
	constructor() {
		classes(() => 'inline-flex size-fit text-base motion-safe:animate-spin');
	}
}
````

## File: src/app/shared/spartan/spinner/src/index.ts
````typescript
import { HlmSpinner } from './lib/hlm-spinner';
export * from './lib/hlm-spinner';
export const HlmSpinnerImports = [HlmSpinner] as const;
````

## File: src/app/shared/spartan/tabs/src/lib/hlm-tabs-content-lazy.ts
````typescript
import { Directive } from '@angular/core';
import { BrnTabsContentLazy } from '@spartan-ng/brain/tabs';
@Directive({
	selector: 'ng-template[hlmTabsContentLazy]',
	hostDirectives: [BrnTabsContentLazy],
})
export class HlmTabsContentLazy {}
````

## File: src/app/shared/spartan/tabs/src/lib/hlm-tabs-content.ts
````typescript
import { Directive, input } from '@angular/core';
import { BrnTabsContent } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmTabsContent]',
	hostDirectives: [{ directive: BrnTabsContent, inputs: ['brnTabsContent: hlmTabsContent'] }],
	host: {
		'data-slot': 'tabs-content',
	},
})
export class HlmTabsContent {
	public readonly contentFor = input.required<string>({ alias: 'hlmTabsContent' });
	constructor() {
		classes(() => 'flex-1 text-sm outline-none');
	}
}
````

## File: src/app/shared/spartan/tabs/src/lib/hlm-tabs-list.ts
````typescript
import { Directive, input } from '@angular/core';
import { BrnTabsList } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
import { type VariantProps, cva } from 'class-variance-authority';
export const listVariants = cva(
	'group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-[3px] group-data-horizontal/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none',
	{
		variants: {
			variant: {
				default: 'bg-muted',
				line: 'gap-1 bg-transparent',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);
type ListVariants = VariantProps<typeof listVariants>;
@Directive({
	selector: '[hlmTabsList],hlm-tabs-list',
	hostDirectives: [BrnTabsList],
	host: {
		'data-slot': 'tabs-list',
		'[attr.data-variant]': 'variant()',
	},
})
export class HlmTabsList {
	public readonly variant = input<ListVariants['variant']>('default');
	constructor() {
		classes(() => listVariants({ variant: this.variant() }));
	}
}
````

## File: src/app/shared/spartan/tabs/src/lib/hlm-tabs-trigger.ts
````typescript
import { Directive, input } from '@angular/core';
import { BrnTabsTrigger } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmTabsTrigger]',
	hostDirectives: [{ directive: BrnTabsTrigger, inputs: ['brnTabsTrigger: hlmTabsTrigger', 'disabled'] }],
	host: {
		'data-slot': 'tabs-trigger',
	},
})
export class HlmTabsTrigger {
	public readonly triggerFor = input.required<string>({ alias: 'hlmTabsTrigger' });
	constructor() {
		classes(() => [
			`focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon:not([class*='text-'])]:text-base`,
			'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
			'data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground',
			'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
		]);
	}
}
````

## File: src/app/shared/spartan/tabs/src/lib/hlm-tabs.ts
````typescript
import { Directive, input } from '@angular/core';
import { BrnTabs } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
@Directive({
	selector: '[hlmTabs],hlm-tabs',
	hostDirectives: [
		{
			directive: BrnTabs,
			inputs: ['orientation', 'activationMode', 'brnTabs: tab'],
			outputs: ['tabActivated'],
		},
	],
	host: {
		'data-slot': 'tabs',
	},
})
export class HlmTabs {
	public readonly tab = input.required<string>();
	constructor() {
		classes(() => 'group/tabs flex gap-2 data-[orientation=horizontal]:flex-col');
	}
}
````

## File: src/app/shared/spartan/tabs/src/index.ts
````typescript
import { HlmTabs } from './lib/hlm-tabs';
import { HlmTabsContent } from './lib/hlm-tabs-content';
import { HlmTabsContentLazy } from './lib/hlm-tabs-content-lazy';
import { HlmTabsList } from './lib/hlm-tabs-list';
import { HlmTabsPaginatedList } from './lib/hlm-tabs-paginated-list';
import { HlmTabsTrigger } from './lib/hlm-tabs-trigger';
export * from './lib/hlm-tabs';
export * from './lib/hlm-tabs-content';
export * from './lib/hlm-tabs-content-lazy';
export * from './lib/hlm-tabs-list';
export * from './lib/hlm-tabs-paginated-list';
export * from './lib/hlm-tabs-trigger';
export const HlmTabsImports = [
	HlmTabs,
	HlmTabsList,
	HlmTabsTrigger,
	HlmTabsContent,
	HlmTabsContentLazy,
	HlmTabsPaginatedList,
] as const;
````

## File: src/app/shared/spartan/utils/src/lib/hlm.ts
````typescript
import { isPlatformBrowser } from '@angular/common';
import {
	DestroyRef,
	effect,
	ElementRef,
	HostAttributeToken,
	inject,
	Injector,
	PLATFORM_ID,
	runInInjectionContext,
} from '@angular/core';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function hlm(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
const elementClassManagers = new WeakMap<HTMLElement, ElementClassManager>();
let globalObserver: MutationObserver | null = null;
const observedElements = new Set<HTMLElement>();
interface ElementClassManager {
	element: HTMLElement;
	sources: Map<number, { classes: Set<string>; order: number }>;
	baseClasses: Set<string>;
	isUpdating: boolean;
	nextOrder: number;
	hasInitialized: boolean;
	restoreRafId: number | null;
	transitionsSuppressed: boolean;
	previousTransition: string;
	previousTransitionPriority: string;
}
let sourceCounter = 0;
export function classes(computed: () => ClassValue[] | string, options: ClassesOptions = {}) {
	runInInjectionContext(options.injector ?? inject(Injector), () => {
		const elementRef = options.elementRef ?? inject(ElementRef);
		const platformId = inject(PLATFORM_ID);
		const destroyRef = inject(DestroyRef);
		const baseClasses = inject(new HostAttributeToken('class'), { optional: true });
		const element = elementRef.nativeElement;
		const sourceId = sourceCounter++;
		let manager = elementClassManagers.get(element);
		if (!manager) {
			const initialBaseClasses = new Set<string>();
			if (baseClasses) {
				toClassList(baseClasses).forEach((cls) => initialBaseClasses.add(cls));
			}
			manager = {
				element,
				sources: new Map(),
				baseClasses: initialBaseClasses,
				isUpdating: false,
				nextOrder: 0,
				hasInitialized: false,
				restoreRafId: null,
				transitionsSuppressed: false,
				previousTransition: '',
				previousTransitionPriority: '',
			};
			elementClassManagers.set(element, manager);
			// Setup global observer if needed and register this element
			setupGlobalObserver(platformId);
			observedElements.add(element);
			// Suppress transitions until the first effect writes correct classes and
			// the browser has painted them. This prevents CSS transition animations
			// during hydration when classes change from SSR state to client state.
			if (isPlatformBrowser(platformId)) {
				manager.previousTransition = element.style.getPropertyValue('transition');
				manager.previousTransitionPriority = element.style.getPropertyPriority('transition');
				element.style.setProperty('transition', 'none', 'important');
				manager.transitionsSuppressed = true;
			}
		}
		const sourceOrder = manager.nextOrder++;
		function updateClasses(): void {
			const newClasses = toClassList(computed());
			manager!.sources.set(sourceId, {
				classes: new Set(newClasses),
				order: sourceOrder,
			});
			updateElement(manager!);
			if (manager!.transitionsSuppressed) {
				manager!.transitionsSuppressed = false;
				manager!.restoreRafId = requestAnimationFrame(() => {
					manager!.restoreRafId = null;
					restoreTransitionSuppression(manager!);
				});
			}
		}
		destroyRef.onDestroy(() => {
			if (manager!.restoreRafId !== null) {
				cancelAnimationFrame(manager!.restoreRafId);
				manager!.restoreRafId = null;
			}
			if (manager!.transitionsSuppressed) {
				manager!.transitionsSuppressed = false;
				restoreTransitionSuppression(manager!);
			}
			manager!.sources.delete(sourceId);
			if (manager!.sources.size === 0) {
				cleanupManager(element);
			} else {
				updateElement(manager!);
			}
		});
		effect(updateClasses);
	});
}
function restoreTransitionSuppression(manager: ElementClassManager): void {
	const prev = manager.previousTransition;
	if (prev) {
		manager.element.style.setProperty('transition', prev, manager.previousTransitionPriority || undefined);
	} else {
		manager.element.style.removeProperty('transition');
	}
}
function setupGlobalObserver(platformId: Object): void {
	if (isPlatformBrowser(platformId) && !globalObserver) {
		globalObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					const element = mutation.target as HTMLElement;
					const manager = elementClassManagers.get(element);
					if (manager && observedElements.has(element)) {
						if (manager.isUpdating) continue;
						const currentClasses = toClassList(element.className);
						const allSourceClasses = new Set<string>();
						for (const source of manager.sources.values()) {
							for (const className of source.classes) {
								allSourceClasses.add(className);
							}
						}
						manager.baseClasses.clear();
						for (const className of currentClasses) {
							if (!allSourceClasses.has(className)) {
								manager.baseClasses.add(className);
							}
						}
						updateElement(manager);
					}
				}
			}
		});
		globalObserver.observe(document, {
			attributes: true,
			attributeFilter: ['class'],
			subtree: true,
		});
	}
}
function updateElement(manager: ElementClassManager): void {
	if (manager.isUpdating) return;
	manager.isUpdating = true;
	if (!manager.hasInitialized && manager.sources.size > 0) {
		const currentClasses = toClassList(manager.element.className);
		const allSourceClasses = new Set<string>();
		for (const source of manager.sources.values()) {
			source.classes.forEach((className) => allSourceClasses.add(className));
		}
		currentClasses.forEach((className) => {
			if (!allSourceClasses.has(className)) {
				manager.baseClasses.add(className);
			}
		});
		manager.hasInitialized = true;
	}
	const sortedSources = Array.from(manager.sources.entries()).sort(([, a], [, b]) => a.order - b.order);
	const allSourceClasses: string[] = [];
	for (const [, source] of sortedSources) {
		allSourceClasses.push(...source.classes);
	}
	const classesToApply =
		allSourceClasses.length > 0 || manager.baseClasses.size > 0
			? hlm([...allSourceClasses, ...manager.baseClasses])
			: '';
	// Apply the classes to the element
	if (manager.element.className !== classesToApply) {
		manager.element.className = classesToApply;
	}
	manager.isUpdating = false;
}
function cleanupManager(element: HTMLElement): void {
	// Remove from global tracking
	observedElements.delete(element);
	elementClassManagers.delete(element);
	// If no more elements being tracked, cleanup global observer
	if (observedElements.size === 0 && globalObserver) {
		globalObserver.disconnect();
		globalObserver = null;
	}
}
interface ClassesOptions {
	elementRef?: ElementRef<HTMLElement>;
	injector?: Injector;
}
// Cache for parsed class lists to avoid repeated string operations
const classListCache = new Map<string, string[]>();
function toClassList(className: string | ClassValue[]): string[] {
	// For simple string inputs, use cache to avoid repeated parsing
	if (typeof className === 'string' && classListCache.has(className)) {
		return classListCache.get(className)!;
	}
	const result = clsx(className)
		.split(' ')
		.filter((c) => c.length > 0);
	if (typeof className === 'string' && classListCache.size < 1000) {
		classListCache.set(className, result);
	}
	return result;
}
````

## File: src/app/shared/spartan/utils/src/index.ts
````typescript
export * from './lib/hlm';
````

## File: src/app/app.html
````html
<router-outlet />
    <hlm-toaster position="bottom-right" [richColors]="true" />
````

## File: src/app/app.ts
````typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterImports } from './shared/spartan';
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ...HlmToasterImports],
  templateUrl: './app.html',
})
export class App {}
````

## File: src/environments/environment.ts
````typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
};
````

## File: supabase/migrations/006_events.sql
````sql
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  lat FLOAT,
  lng FLOAT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','active','held','cancelled','rescheduled')),
  cancelled_at TIMESTAMPTZ,
  theme TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes INT,
  after_meeting_venue JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_club_id ON events(club_id);
CREATE INDEX idx_events_date ON events(date);
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, user_id)
);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public events visible to all"
  ON events FOR SELECT USING (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.is_public = true)
  );
CREATE POLICY "Members can see private club events"
  ON events FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = events.club_id AND user_id = auth.uid())
  );
CREATE POLICY "Club organizers can create events"
  ON events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.organizer_id = auth.uid())
  );
CREATE POLICY "Club organizers can update events"
  ON events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.organizer_id = auth.uid())
  );
CREATE POLICY "Club organizers can delete events"
  ON events FOR DELETE USING (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.organizer_id = auth.uid())
  );
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendees visible to club members"
  ON event_attendees FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_id = (SELECT club_id FROM events WHERE id = event_attendees.event_id)
        AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can RSVP to events"
  ON event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own RSVP"
  ON event_attendees FOR DELETE USING (auth.uid() = user_id);
````

## File: supabase/migrations/007_events_cover_image.sql
````sql
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
````

## File: .gitignore
````
# See https://docs.github.com/get-started/getting-started-with-git/ignoring-files for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db
# Angular specific
/dist/
/out-tsc/
/tmp/
/coverage/
/e2e/test-output/
/.angular/
.angular/

# Node modules and dependency files
/node_modules/
/yarn.lock

# Environment files
/.env

# Angular CLI and build artefacts
/.angular-cli.json
/.ng/

# TypeScript cache
*.tsbuildinfo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.aider*
````

## File: CLAUDE.md
````markdown
# Project Context
This project uses **Repomix** to provide a full map of the codebase.

## Stack
- Frontend: Angular 21 (Signals — resource(), rxResource(), linkedSignal(), input()/output(), standalone components, SCSS, Tailwind)
- Backend: FastAPI (Async, Pydantic v2)

## Folder Structure
- `src/app/features/` — Angular feature components (auth, clubs, profile, quiz, randomizer)
- `src/app/core/` — Core services, guards, interceptors, models
- `src/app/shared/` — Shared UI components, pipes, directives
- `src/app/layout/` — Shell, header, footer
- `public/i18n/` — Translation files (en.json, uk.json)
- `supabase/migrations/` — SQL migrations for backend

## How to Run
- **Dev server:** `npm start` (Angular at http://localhost:4200)
- **Build:** `npm run build`
- **Update context:** `npm run build-ctx`

## Testing & Linting
- **Unit tests:** `npm run test` (Jest)
- **E2E tests:** Playwright (see docs)
- **Lint:** `npm run lint`

## Pre-commit Hooks & Development Workflow
- This project does **not** use `.pre-commit-config.yaml`, `ruff`, or `black`.
- Pre-commit hooks are managed via Husky. The only pre-commit hook is `.husky/pre-commit`, which runs `lint-staged`.
- The pre-commit hook updates `repomix-output.md` using `lint-staged`.
- No Python-specific formatting or linting tools are involved in the pre-commit process.

## Notes
- Always check `repomix-output.md` for the latest project map.
- If a file is not in repomix-output.md, assume it doesn't exist yet.
- Backend API routes: see FastAPI project (not in this repo).
````

## File: components.json
````json
{
  "componentsPath": "src/app/shared/spartan",
  "importAlias": "@spartan-ng/helm"
}
````

## File: eslint.config.js
````javascript
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const rxjsX = require("eslint-plugin-rxjs-x");
module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
      rxjsX.configs.recommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.spec.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-extraneous-class": [
        "error",
        { allowWithDecorator: true },
      ],
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_" },
      ],
      "rxjs-x/no-unsafe-takeuntil": "error",
      "rxjs-x/no-floating-observables": "error",
      "rxjs-x/no-unbound-methods": "error",
      "rxjs-x/no-subject-value": "error",
      "rxjs-x/finnish": "warn",
    },
  },
  {
    files: ["src/app/shared/spartan/**/*.ts", "src/app/shared/spartan/**/*.html"],
    rules: {
      "@angular-eslint/directive-selector": "off",
      "@angular-eslint/component-selector": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@angular-eslint/no-input-rename": "off",
      "@typescript-eslint/array-type": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
    },
  }
]);
````

## File: karma.conf.js
````javascript
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/book-club-fe'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
      exclude: ['**/spartan/**'],
      check: {
        global: { statements: 75, branches: 60, functions: 75, lines: 75 },
      },
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
````

## File: postcss.config.json
````json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
````

## File: refactor_opus.md
````markdown
# Refactor Opus — Angular 20 Book-Club FE

> Раунди R1–R6. Кожен завершується `npm run lint && npm run test && npm run build` + git commit.

---

## R1 — RxJS Antipattern Cleanup

**Мета:** Ліквідувати останні `subscribe()` без cleanup та архаїчний `OnInit/OnDestroy + destroy$`.

**Scope:**
- `src/app/layout/header/header.component.ts:51` — `translate.use(next).subscribe()` → `firstValueFrom`
- `src/app/shared/components/address-autocomplete/address-autocomplete.component.ts` — `OnInit/OnDestroy + Subject<void> destroy$` + ручний `valueChanges.subscribe()` → `toSignal()` + `takeUntilDestroyed`

**Агент:** general-purpose

**Acceptance:**
- 0 `subscribe()` без cleanup у scope-файлах
- `lint` clean, `test` 53/53, ручна перевірка autocomplete + lang switch

---

## R2 — Decomposition of Large Files

**Мета:** Жоден файл не перевищує 180 LOC (TS) / 220 LOC (HTML).

**Scope:**
- `src/app/shared/components/book-intro/book-intro.component.ts` (297 LOC) → split presentational + container
- `src/app/features/clubs/club-detail/club-detail.component.ts` (258 LOC) → `ClubMembershipActionsService` або inline-actions component
- `src/app/features/clubs/club-detail/club-detail.component.html` (301 LOC) → `ClubHeaderComponent`, `ClubInfoCardComponent`
- `src/app/core/services/club.service.ts` (252 LOC) → `ClubReadService` (queries) + `ClubMembershipService` (mutations)

**Агент:** Plan → general-purpose

**Acceptance:**
- Жоден файл >180 LOC TS / >220 LOC HTML
- Всі тести зелені, lint clean

---

## R3 — Angular 20 Modernization: httpResource / linkedSignal

**Мета:** Використати Angular 20 `httpResource()`, `linkedSignal`, `resource()` замість manual Promise/subscribe HTTP-патернів.

**Scope:**
- `src/app/core/auth/auth.service.ts` — розширити `resource()` → `linkedSignal` для derived stats
- Quiz / Club / Event сервіси — замінити manual signal+Promise на `resource()` де доречно
- Перейти на `httpResource()` для HTTP queries без side-effects

**Агент:** Explore → Plan → general-purpose

**Acceptance:**
- Сервіси без ручного `.subscribe()` для HTTP
- Всі тести проходять, lint clean

---

## R4 — Performance: @defer + NgOptimizedImage + track audit

**Мета:** Зменшити initial bundle, прискорити рендеринг важких компонентів.

**Scope:**
- `@defer` блоки для `quiz-take`, `club-detail`, `randomizer`
- Замінити `<img loading="lazy">` → `NgOptimizedImage`
- Audit `@for` — замінити `track $index` → `track item.id` де є стабільний ключ

**Агент:** general-purpose

**Acceptance:**
- `npm run build` — initial bundle ≤ поточному
- lint clean, всі тести зелені

---

## R5 — Test Coverage Bump

**Мета:** Coverage functions ≥ 75%.

**Компоненти без тестів (14):** `profile`, `randomizer`, `quiz-create`, `quiz-take`, `quiz-list`, `chat-widget`, `social-link-field`, `cover-upload`, `social-badges`, `book-intro`, `qr-code`, `role-selector`, `profile-stats`
**Сервіси без тестів (2):** `book-cover.service`, `upload.service`

Мінімум: smoke-тест (component creates) + 1 інтеграційний сценарій.

**Агент:** general-purpose

**Acceptance:**
- Coverage functions ≥ 75%
- Всі тести зелені

---

## R6 — Polish & Dedup

**Мета:** 0 lint warnings, усунення дрібних дублювань.

**Scope:**
- Barrel-export для spartan/helm: `src/app/shared/spartan/index.ts`
- Dedupe `ApiUserSocials` ↔ `UserSocials` у `core/api/api-mappers.ts`
- Видалити inline `style="font-family:..."` у `club-detail.html`
- `.nonNullable` для всіх FormControl де передбачається non-null
- Виправити `rxjs-x/finnish notation` warnings у `auth.guard.ts` / `auth.interceptor.ts`

**Агент:** general-purpose

**Acceptance:**
- 0 `npm run lint` warnings
- ≤10 LOC дельта на файл
- Всі тести зелені
````

## File: spartan_plan.md
````markdown
# Spartan UI Migration Plan — book-club-fe

## Контекст

Проект Angular 20 з 37 компонентами, власною Tailwind design system (primary/accent токени) і нульовою залежністю від UI-бібліотек. Мета: мігрувати на Spartan UI (@spartan-ng/brain + @spartan-ng/helm) поетапно, зберігши кастомні дизайн-токени та всю Angular 20 Signals логіку.

---

## Структура виконання

Кожен раунд виконується окремою сесією MCP агента. Агент отримує конкретне завдання, після завершення — reviewer перевіряє. Паралельні раунди запускаються одночасно.

### Доступні агенти

| Агент | Модель | Роль у міграції |
|-------|--------|----------------|
| `dev` | claude-sonnet-4-6 | Основна імплементація — Angular 20, Spartan, форми |
| `ui` | claude-haiku-4-5-20251001 | Стилізація, CVA variants, дизайн-токени |
| `reviewer` | claude-haiku-4-5-20251001 | Перевірка коду після кожного раунду |
| `tester` | claude-haiku-4-5-20251001 | Jest-тести для мігрованих компонентів |
| `security` | claude-sonnet-4-6 | Аудит після завершення міграції |

---

## Round 0 — Setup & Infrastructure
**Агент:** `dev`
**Паралельно:** ні (блокуючий)
**Орієнтовно:** 3–4 год

### Завдання
1. Встановити залежності:
   ```bash
   npm install @spartan-ng/brain @spartan-ng/helm @angular/cdk class-variance-authority
   ```
2. Оновити `tailwind.config.ts` — додати Spartan content paths та CSS variables:
   ```ts
   content: [..., './node_modules/@spartan-ng/**/*.{js,mjs}']
   ```
3. Додати Spartan CSS variables до `src/styles.scss`:
   - Змапити `--primary` → `--color-primary` (sky-600)
   - Змапити `--accent` → `--color-accent` (purple-600)
   - Зберегти кастомні `--color-bg`, `--color-surface`, `--color-text`
4. Перевірити `app.config.ts` — `provideZonelessChangeDetection()` вже є, нічого додавати
5. Створити `src/app/shared/spartan/` — директорія для перевикористовуваних hlm-обгорток

### Файли
- `tailwind.config.ts`
- `src/styles.scss`
- `src/app/shared/spartan/` (нова директорія)

### Перевірка
```bash
npm run build  # без помилок
npm run lint   # без попереджень
```

---

## Round 1 — Базові shared компоненти (паралельно: 1A + 1B)
**Паралельно:** Round 1A і Round 1B запускаються одночасно після Round 0

---

### Round 1A — Form primitives
**Агент:** `dev`
**Орієнтовно:** 4–5 год

#### Компоненти
- `form-field` → `HlmFormFieldComponent` + `HlmInputDirective`
- `social-link-field` → `HlmInputDirective` + `HlmLabelDirective`

#### Патерн
```typescript
import { HlmFormFieldComponent, HlmInputDirective, HlmLabelDirective, HlmErrorDirective } from '@spartan-ng/helm/form-field';

@Component({
  imports: [HlmFormFieldComponent, HlmInputDirective, HlmLabelDirective, HlmErrorDirective],
  template: `
    <hlm-form-field>
      <label hlmLabel>{{ label() }}</label>
      <input hlmInput [type]="type()" [formControl]="control()" />
      <hlm-error *ngIf="control().invalid">{{ errorMessage() }}</hlm-error>
    </hlm-form-field>
  `
})
```

#### Файли
- `src/app/shared/components/form-field/form-field.component.ts`
- `src/app/shared/components/social-link-field/social-link-field.component.ts`

---

### Round 1B — Feedback компоненти
**Агент:** `ui`
**Орієнтовно:** 3–4 год

#### Компоненти
- `loading-spinner` → `HlmSpinnerComponent`
- `toast` → `HlmToasterComponent` + `toast()` service
- `empty-state` → `HlmCardComponent` + content slots

#### Патерн для toast
```typescript
import { toast } from '@spartan-ng/helm/sonner';
toast.success('Клуб створено');
toast.error('Помилка збереження');
```

#### Файли
- `src/app/shared/components/loading-spinner/loading-spinner.component.ts`
- `src/app/shared/components/toast/toast.component.ts`
- `src/app/shared/components/empty-state/empty-state.component.ts`

---

### Round 1 Review
**Агент:** `reviewer`
- Перевірити що `input()` / `output()` використовуються скрізь (не `@Input/@Output`)
- Перевірити що дизайн-токени `primary-*` / `accent-*` збережені
- `npm run lint && npm run test`

---

## Round 2 — Button система та Badge
**Агент:** `ui`
**Паралельно:** після Round 1
**Орієнтовно:** 3–4 год

### Завдання
1. Створити `src/app/shared/spartan/button/` — hlm-button з CVA variants:
   ```typescript
   const buttonVariants = cva(
     'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
     {
       variants: {
         variant: {
           default: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
           accent:  'bg-accent-600 hover:bg-accent-700 text-white focus:ring-accent-500',
           outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
           ghost:   'hover:bg-gray-100 text-gray-600',
           danger:  'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
         },
         size: {
           sm:  'px-3 py-1.5 text-sm',
           md:  'px-4 py-2 text-sm',
           lg:  'px-6 py-3 text-base',
           fab: 'w-14 h-14 rounded-full',
         }
       },
       defaultVariants: { variant: 'default', size: 'md' }
     }
   );
   ```
2. Замінити `social-badges` компонент на `HlmBadgeDirective`

### Файли
- `src/app/shared/spartan/button/hlm-button.directive.ts` (новий)
- `src/app/shared/components/social-badges/social-badges.component.ts`

### Перевірка
- Візуально пройти всі сторінки в браузері (light + dark mode)

---

## Round 3 — Auth форми
**Агент:** `dev`
**Паралельно:** після Round 2
**Орієнтовно:** 5–6 год

### Компоненти
- `login.component.ts` (201 рядок → очікувано ~120)
- `register.component.ts` (226 рядків → очікувано ~140)

### Завдання
1. Замінити всі `<input>` на `hlmInput` directive
2. Замінити кнопки на `hlmBtn` directive з variants
3. Зберегти кастомну анімацію `form-slide-in` (inline `<style>` або SCSS)
4. Password strength bar — залишити кастомним (немає аналога в Spartan)
5. `role-selector` у register — залишити кастомним grid

### Файли
- `src/app/features/auth/login/login.component.ts`
- `src/app/features/auth/register/register.component.ts`

### Review
**Агент:** `reviewer`
- Перевірити reactive forms + `HlmErrorDirective` для валідації
- Перевірити password confirmation validator

---

## Round 4 — Club та Event форми (паралельно: 4A + 4B)

---

### Round 4A — Club forms
**Агент:** `dev`
**Орієнтовно:** 5–6 год

#### Компоненти
- `create-club.component.ts` (159 рядків)
- `edit-club.component.ts` (168 рядків)
- `cover-upload.component.ts` — залишити кастомним, лише кнопки через `hlmBtn`

#### Завдання
- Всі `<input>`, `<textarea>` → `hlmInput`
- `<select>` для city-фільтра → `HlmSelectComponent` + `BrnSelectComponent`
- Кнопки → `hlmBtn`

---

### Round 4B — Event forms
**Агент:** `dev`
**Орієнтовно:** 4–5 год

#### Компоненти
- `create-event.component.ts` (162 рядки)
- `event-card.component.ts` (98 рядків) → `HlmCardComponent`
- `club-card.component.ts` (74 рядки) → `HlmCardComponent`

#### Завдання
- Картки → `hlm-card`, `hlm-card-header`, `hlm-card-content`
- Додати `HlmBadgeDirective` для статус-бейджів подій

---

### Round 4 Review
**Агент:** `reviewer` + `tester`
- Jest-тести для form validation
- `npm run test`

---

## Round 5 — Navigation та Tabs
**Агент:** `dev`
**Паралельно:** після Round 4
**Орієнтовно:** 6–8 год

### Компоненти
- `header.component.ts` (356 рядків → очікувано ~220)
- `clubs-list.component.ts` — Tabs
- `events-feed.component.ts` — Tabs

### Завдання Header
1. User dropdown → `BrnMenuTriggerDirective` + `HlmMenuComponent`
2. Mobile hamburger → `BrnSheetComponent` + `HlmSheetComponent`
3. Language switcher — залишити кастомним (2 кнопки, не потребує CDK)

```typescript
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmMenuComponent, HlmMenuItemDirective } from '@spartan-ng/helm/menu';
```

### Завдання Tabs
```typescript
import { BrnTabsComponent, BrnTabsTriggerDirective, BrnTabsContentDirective } from '@spartan-ng/brain/tabs';
import { HlmTabsComponent, HlmTabsListComponent, HlmTabsTriggerDirective } from '@spartan-ng/helm/tabs';
```

### Файли
- `src/app/layout/header/header.component.ts`
- `src/app/features/clubs/clubs-list/clubs-list.component.ts`
- `src/app/features/events/events-feed/events-feed.component.ts`

---

## Round 6 — Quiz Wizard
**Агент:** `dev`
**Паралельно:** після Round 4
**Орієнтовно:** 6–8 год

### Компоненти
- `quiz-create.component.ts` (297 рядків) — 2-step wizard
- `quiz-list.component.ts` (160 рядків)

### Завдання
1. Quiz wizard — Spartan не має wizard, використати власний step-логіку через `signal<number>`
2. Dynamic question list → `HlmCardComponent` для кожного питання
3. Radio buttons для відповідей → `BrnRadioGroupComponent` + `HlmRadioGroupComponent`
4. Tabs для статусів (active/draft) → `BrnTabsComponent`

### Важливо
Wizard логіка залишається кастомною — лише стилізація через Spartan primitives.

---

## Round 7 — Складні custom компоненти
**Агент:** `dev` + `ui`
**Паралельно:** після Round 5
**Орієнтовно:** 6–8 год

### Компоненти та підхід

| Компонент | Підхід |
|-----------|--------|
| `chat-widget` | FAB → `hlmBtn` variant=fab; side panel — **залишити кастомним** |
| `randomizer` | Spin анімація — **залишити кастомною**; кнопка → `hlmBtn` |
| `address-autocomplete` | Перевірити `BrnComboboxComponent`; якщо не підтримує async Google Places — залишити кастомним |
| `qr-code` | `HlmCardComponent` як обгортка |
| `profile` | Форма → `hlmInput` + `hlmBtn` |

---

## Round 8 — Club Detail (найскладніший)
**Агент:** `dev`
**Паралельно:** після Round 5
**Орієнтовно:** 6–8 год

### Компонент
- `club-detail.component.ts` (298 рядків) — 3-column layout

### Завдання
1. Tabs (members/events/quiz) → `BrnTabsComponent`
2. Confirm dialog для leave/delete → `BrnDialogComponent` + `HlmDialogComponent`
3. Member cards → `HlmCardComponent`
4. Кнопки дій → `hlmBtn` variants
5. 3-column CSS grid — **залишити кастомним** (Spartan не надає layout primitives)

---

## Round 9 — Final Review & Audit
**Агент:** `reviewer` + `tester` + `security`
**Паралельно:** після всіх попередніх раундів
**Орієнтовно:** 4–5 год

### reviewer
- [ ] Весь код використовує Angular 20 Signals API (`input()`, `output()`, `viewChild()`)
- [ ] Немає `@Input` / `@Output` декораторів у нових файлах
- [ ] Дизайн-токени `primary-*` / `accent-*` збережені скрізь
- [ ] Немає змішаних підходів (Spartan + старий кастомний) в одному компоненті

### tester
- [ ] Jest unit tests для всіх form components
- [ ] `npm run test` — всі тести проходять
- [ ] Перевірити keyboard navigation у tabs, dropdown, dialog

### security
- [ ] Аудит нових CDK overlay компонентів (focus trap, ARIA)
- [ ] XSS перевірка для `address-autocomplete` (Google Places input)

---

## Критичні файли для міграції

```
src/
├── styles.scss                          # Round 0: CSS variables
├── tailwind.config.ts                   # Round 0: content paths
├── app/
│   ├── shared/
│   │   ├── spartan/                     # Round 0: нова директорія
│   │   │   └── button/hlm-button.directive.ts  # Round 2
│   │   └── components/
│   │       ├── form-field/              # Round 1A
│   │       ├── loading-spinner/         # Round 1B
│   │       ├── toast/                   # Round 1B
│   │       ├── empty-state/             # Round 1B
│   │       └── social-badges/           # Round 2
│   ├── layout/
│   │   └── header/                      # Round 5
│   └── features/
│       ├── auth/login/ register/        # Round 3
│       ├── clubs/create/ edit/ detail/  # Round 4A, 8
│       ├── events/create/ feed/         # Round 4B, 5
│       ├── quiz/create/ list/           # Round 6
│       └── profile/                     # Round 7
```

---

## Хронологія

```
Round 0  ──────────────────────────────── Setup (блокуючий)
Round 1A ───────────┐
Round 1B ───────────┤ паралельно після Round 0
                    └── Round 1 Review
Round 2  ────────────────────────────────── після Round 1
Round 3  ────────────────────────────────── після Round 2
Round 4A ───────────┐
Round 4B ───────────┤ паралельно після Round 3
                    └── Round 4 Review
Round 5  ───────────┐
Round 6  ───────────┤ паралельно після Round 4
Round 7  ───────────┘
Round 8  ────────────────────────────────── після Round 5
Round 9  ────────────────────────────────── після всіх (фінальний аудит)
```

---

## Загальна оцінка

| Метрика | Значення |
|---------|----------|
| Раундів | 9 (+ 2 паралельні групи) |
| Агент-сесій | ~14 |
| Загальний час | **117–160 год** |
| Компонентів залишаться кастомними | chat-widget, randomizer, wizard-логіка, 3-col layout |
| Очікуване скорочення шаблонів | ~40–55% у простих компонентах |

---

## Що НЕ мігрується (залишається кастомним)

- `chat-widget` — FAB + sliding panel (немає Spartan аналога)
- `randomizer` — spin анімація
- Quiz wizard step-логіка
- 3-column layout у `club-detail`
- Password strength bar у `register`
- Language switcher у `header`
- `address-autocomplete` — якщо `BrnComboboxComponent` не підтримує async Google Places API
````

## File: ui_changes.md
````markdown
# UI Changes Plan: Bento Grid + Glassmorphism Redesign

## Context

Проєкт book-club-fe (Angular 20) потребує повного редизайну під **Bento Grid** та **Glassmorphism** стилістику.
Паралельно є два активних баги:

1. **Порожня сторінка при старті** — замість `/login` відкривається пустий shell
2. **Стилі не застосовуються** — елементи відображаються без стилів після останнього апгрейду

**Мета:** Сучасний, консистентний UI з Bento Grid розмітками на всіх сторінках та glassmorphism-картками/формами, без регресій у функціональності.

---

## Поточний стан (аудит)

### Баги (до редизайну — Round 0)

**Порожня сторінка:** `app.routes.ts:21` — `path: ''` завантажує `ShellComponent` **без гарда**. Дочірній редирект `'' → 'clubs'` (рядок 46) запускає `authGuard` асинхронно, тому користувач бачить порожній shell (~200–500ms) до редиректу на `/login`.

**Стилі зникли:** `styles.scss` та `postcss.config.mjs` налаштовані правильно (`@import "tailwindcss"` + `@tailwindcss/postcss`). Ймовірна причина — зіпсований PostCSS/Vite кеш або зміна у `vite.config.ts`. Потребує діагностики при старті Round 0.

### Що вже є (не ламати)
- Glassmorphism частково: `backdrop-blur-md`, `bg-white/85` у auth + header
- CSS Grid на clubs-list (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Design tokens у `@theme` (primary sky-blue, accent purple) у `styles.scss:5–34`
- Spartan UI (HLM) компоненти: button, card, input, field, badge, sheet, spinner у `src/app/shared/spartan/`
- Dark mode через `.dark` CSS змінні у `styles.scss:65–90`

---

## MCP Агенти

| Агент | Модель | Роль у плані |
|-------|--------|--------------|
| **dev** | claude-sonnet-4-6 | Основна реалізація Angular — routing, компоненти, логіка |
| **ui** | claude-haiku-4-5-20251001 | HTML/CSS редизайн, Bento Grid верстка, glassmorphism стилі |
| **reviewer** | claude-haiku-4-5-20251001 | Code review перед кожним комітом, перевірка регресій |
| **tester** | claude-haiku-4-5-20251001 | Візуальна регресія, перевірка стилів після кожного раунду |

---

## Раунди

---

### Round 0 — Hotfix: Баги (пріоритет №1)

**Ціль:** Виправити обидва баги до початку редизайну.

**Агенти:** `dev`

#### Задача 0.1 — Порожня сторінка

**Файл:** `src/app/app.routes.ts`

**Фікс:** Додати `canActivate: [authGuard]` на кореневий маршрут ShellComponent (рядок 20–22):

```typescript
{
  path: '',
  component: ShellComponent,
  canActivate: [authGuard],   // ← додати
  children: [ ... ]
}
```

Це змусить `authGuard` спрацювати **до** рендеру ShellComponent — user одразу отримає redirect на `/login`.

**Перевірка:** Відкрити `http://localhost:4200/` без токену → має одразу редиректити на `/login` без порожнього флешу.

#### Задача 0.2 — Діагностика стилів

**Агент:** `dev`

**Кроки:**
1. `rm -rf .angular/cache node_modules/.cache` — очистити Vite/Angular кеш
2. `npm start` — перевірити чи завантажуються стилі
3. Якщо не допомогло — перевірити `vite.config.ts` на наявність кастомних postcss налаштувань що конфліктують з `postcss.config.mjs`
4. Перевірити чи `@import "tailwindcss"` у `styles.scss:1` генерує CSS у DevTools (Network → styles.scss)

**Можливі причини:**
- Конфлікт між `postcss.config.mjs` та `vite.config.ts` (якщо там є вбудований postcss)
- `angular.json` не вказує на правильний `styles.scss` (перевірити рядки 32–34)
- `@spartan-ng/brain/hlm-tailwind-preset.css` файл не існує після апгрейду (перевірити `node_modules/@spartan-ng/brain/`)

---

### Round 1 — Design Tokens + Global Foundation

**Ціль:** Встановити глобальну дизайн-систему для Bento Grid + Glassmorphism.

**Агенти:** `ui` (верстка), `dev` (TypeScript утиліти)

#### Задача 1.1 — Glassmorphism токени у styles.scss

**Файл:** `src/styles.scss`

Додати у `@theme` блок (після рядка 34):

```scss
@theme {
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.12);
  --glass-bg-strong: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.20);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --glass-blur: blur(12px);
  --glass-blur-strong: blur(20px);

  /* Bento Grid spacing */
  --bento-gap: 1rem;
  --bento-gap-lg: 1.5rem;
  --bento-radius: 1.25rem;
  --bento-radius-lg: 1.75rem;
}
```

#### Задача 1.2 — Reusable Tailwind utility classes

**Файл:** `src/styles.scss` (додати після design tokens)

```scss
@layer utilities {
  /* Glassmorphism card */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--bento-radius);
    box-shadow: var(--glass-shadow);
  }

  .glass-card-strong {
    background: var(--glass-bg-strong);
    backdrop-filter: var(--glass-blur-strong);
    -webkit-backdrop-filter: var(--glass-blur-strong);
    border: 1px solid var(--glass-border);
    border-radius: var(--bento-radius-lg);
    box-shadow: var(--glass-shadow);
  }

  /* Bento grid layouts */
  .bento-grid {
    display: grid;
    gap: var(--bento-gap);
    grid-template-columns: repeat(4, 1fr);
  }

  .bento-grid-3 {
    display: grid;
    gap: var(--bento-gap);
    grid-template-columns: repeat(3, 1fr);
  }

  /* Bento cell sizes */
  .bento-span-2 { grid-column: span 2; }
  .bento-span-3 { grid-column: span 3; }
  .bento-span-row-2 { grid-row: span 2; }

  /* Glass input */
  .glass-input {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(4px);
  }
}
```

#### Задача 1.3 — Dark mode glassmorphism

У `.dark` блок (`styles.scss:65`) додати override для glass:

```scss
.dark {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-bg-strong: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.40);
}
```

#### Задача 1.4 — HLM Card override

**Файл:** `src/app/shared/spartan/ui-card-helm/src/lib/hlm-card.directive.ts`

Переглянути поточні класи HlmCard, додати variant `glass` через CVA або просто оновити базові класи щоб вони включали `rounded-[var(--bento-radius)]`.

**Перевірка R1:** `npm start` → перевірити у DevTools що `.glass-card` та `.bento-grid` класи доступні.

---

### Round 2 — Clubs: Bento Grid (найбільший impact)

**Ціль:** Clubs List та Club Detail — основні сторінки користувача.

**Агенти:** `dev` (логіка), `ui` (HTML/CSS шаблони)

#### Задача 2.1 — Clubs List: Bento Grid розмітка

**Файл:** `src/app/features/clubs/clubs-list/clubs-list.component.html`

**Поточно:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` — однакові карточки.

**Нове:** Перша карточка (featured) займає `span 2` (ширша), решта — стандартні. На мобайлі — linear stack.

```html
<!-- Hero section з glassmorphism -->
<section class="relative overflow-hidden min-h-[280px] rounded-[var(--bento-radius-lg)] glass-card-strong px-8 py-10 mb-6">
  <div class="absolute inset-0 bg-gradient-to-br from-primary-600/40 to-accent-600/40 -z-10"></div>
  <!-- search + title -->
</section>

<!-- Bento Grid -->
<div class="bento-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  <!-- Featured club (span 2) -->
  @if (clubs()[0]) {
    <div class="bento-span-2 bento-span-row-2">
      <app-club-card [club]="clubs()[0]" variant="featured" />
    </div>
  }
  <!-- Regular clubs -->
  @for (club of clubs().slice(1); track club.id) {
    <app-club-card [club]="club" />
  }
</div>
```

#### Задача 2.2 — ClubCardComponent: glassmorphism + featured variant

**Файл:** `src/app/features/clubs/clubs-list/club-card/club-card.component.ts`

Додати `@Input() variant: 'default' | 'featured' = 'default'`. У HTML:
- Default: `glass-card p-4 hover:scale-[1.02] transition-transform`
- Featured: `glass-card-strong p-6 flex flex-col justify-between` + більший текст заголовку

#### Задача 2.3 — Club Detail: Bento layout

**Файл:** `src/app/features/clubs/club-detail/club-detail.component.html`

**Поточно:** `flex flex-col lg:flex-row gap-6`

**Нове:** Справжній Bento Grid для desktop:

```
[ Book Cover + Info (span 2, row 2) ] [ Members (span 2) ]
                                       [ Schedule (span 2) ]
[ Description (span 4) ]
[ Upcoming Events — bento grid всередині (span 4) ]
```

- Всі секції отримують `glass-card` клас
- Hero: `glass-card-strong` з gradient overlay

#### Задача 2.4 — ClubEventCard: glassmorphism refinement

**Файл:** `src/app/features/clubs/club-detail/club-event-card/club-event-card.component.html` та `.scss`

Замінити `.parchment-card` на glassmorphism стиль (прибрати старий parchment ефект). Зберегти `@keyframes card-appear` анімацію — вона хороша.

**Перевірка R2:** Відкрити `/clubs` — перевірити що featured card ширша, всі карточки з glass ефектом, hover анімації працюють. Пройти в club detail.

---

### Round 3 — Events Feed: Bento по датах

**Ціль:** Events Feed з glassmorphism групуванням по датах.

**Агенти:** `ui` (розмітка), `dev` (логіка групування якщо треба змінювати)

#### Задача 3.1 — Events Feed layout

**Файл:** `src/app/features/events/events-feed/events-feed.component.html`

**Нове:** Кожна дата-група — окремий Bento Grid. Перший event у групі — featured (span 2), решта — стандартні.

- Фільтр міста: `glass-card` pill-стиль
- Date header: glassmorphism sticky pill `glass-card px-4 py-1.5 text-sm font-medium sticky top-20 z-10`

#### Задача 3.2 — EventCard: glassmorphism

**Файл:** `src/app/features/events/event-card/event-card.component.html`

Замінити поточні Tailwind класи на `glass-card` + hover ефект. Зберегти всю логіку.

**Перевірка R3:** Відкрити `/events` — перевірити групи по датах, featured event.

---

### Round 4 — Auth Forms: Glassmorphism Polish

**Ціль:** Login/Register — консистентний glassmorphism з backdrop.

**Агенти:** `ui`

#### Задача 4.1 — Login page

**Файл:** `src/app/features/auth/login/login.component.html`

**Поточно:** вже має `bg-white/85 backdrop-blur-md` — хороший старт.

**Нове:**
- Прибрати inline `<style>` блок — перенести в component SCSS файл (або Tailwind)
- Фон: `bg-gradient-to-br from-primary-900 via-accent-900 to-primary-800` + animated mesh
- Карточка: `glass-card-strong max-w-md w-full mx-auto`
- Inputs: `glass-input` клас
- Submit button: gradient `from-primary-500 to-accent-500`

#### Задача 4.2 — Register page

**Файл:** `src/app/features/auth/register/register.component.html`

Аналогічно до login — консистентний стиль.

**Перевірка R4:** Відкрити `/login` та `/register` — glassmorphism форма на темному gradient фоні.

---

### Round 5 — Profile: Bento Sections

**Ціль:** Profile page — секційний Bento Grid замість вертикального стека.

**Агенти:** `ui`, `dev`

#### Задача 5.1 — Profile layout

**Файл:** `src/app/features/profile/profile.component.html`

**Нове Bento Grid для desktop:**

```
[ Avatar + Name + Role (span 2, row 2) ] [ Stats (span 2) ]
                                          [ Social Links (span 2) ]
[ Edit Form (span 4) ]
```

- Кожна секція: `glass-card`
- Avatar: ring з `ring-2 ring-primary-400/50`

#### Задача 5.2 — Profile Stats

**Файл:** `src/app/features/profile/profile-stats/profile-stats.component.html`

Bento мікро-grid 2×2 для stats карточок (books read, clubs joined, events attended тощо).

**Перевірка R5:** Відкрити `/profile` — секції як bento, stats карточки.

---

### Round 6 — Secondary Pages + Shared

**Ціль:** Quiz, Randomizer, Shared компоненти — уніфікувати.

**Агенти:** `ui`

#### Задача 6.1 — Quiz List

**Файл:** `src/app/features/quiz/quiz-list/quiz-list.component.html`

Замінити `space-y-4` вертикальний стек на `bento-grid-3` — quiz карточки як bento cells.

#### Задача 6.2 — Shared компоненти

- `empty-state` → `glass-card` стиль
- `loading-spinner` → зберегти, але обгорнути у glass-overlay якщо використовується як page-level loader
- `form-field` → оновити border/focus стилі під glassmorphism (більш subtle)

#### Задача 6.3 — Header refinement

**Файл:** `src/app/layout/header/header.component.html`

Header вже має `backdrop-blur` — перевірити консистентність з рештою, можливо посилити `bg-white/10` → `glass-card` стиль.

**Перевірка R6:** Пройтись по всіх сторінках — візуальна консистентність.

---

### Round 7 — Review + Visual Regression

**Ціль:** Фінальна перевірка якості коду та відсутності регресій.

**Агенти:** `reviewer`, `tester`

#### Задача 7.1 — Code Review

**Агент:** `reviewer`

Перевірити всі змінені файли на:
- Відсутність inline styles (все у SCSS або Tailwind)
- Правильне використання `glass-card` / `bento-grid` класів
- Відсутність дублювання стилів
- Angular 20 best practices (OnPush, signals, standalone)

#### Задача 7.2 — Visual Regression Tests

**Агент:** `tester`

Playwright screenshots для кожної сторінки:
- `/login`, `/register`
- `/clubs`, `/clubs/:id`
- `/events`
- `/profile`

Порівняти до/після — зафіксувати як baseline для майбутніх змін.

#### Задача 7.3 — Unit Tests

**Агент:** `tester`

Запустити `npm run test` — всі 53 тести мають проходити (регресій не повинно бути, якщо тільки змінювались HTML/CSS).

---

## Критичні файли

| Файл | Зміни |
|------|-------|
| `src/styles.scss` | R1: glass/bento токени + utility classes |
| `src/app/app.routes.ts:20` | R0: додати `canActivate: [authGuard]` |
| `src/app/features/clubs/clubs-list/clubs-list.component.html` | R2: bento grid |
| `src/app/features/clubs/clubs-list/club-card/club-card.component.html` | R2: glassmorphism + featured variant |
| `src/app/features/clubs/club-detail/club-detail.component.html` | R2: bento layout |
| `src/app/features/clubs/club-detail/club-event-card/club-event-card.component.html` | R2: glass cards |
| `src/app/features/events/events-feed/events-feed.component.html` | R3: bento by date |
| `src/app/features/auth/login/login.component.html` | R4: glass form + move inline styles |
| `src/app/features/auth/register/register.component.html` | R4: glass form |
| `src/app/features/profile/profile.component.html` | R5: bento sections |
| `src/app/shared/spartan/ui-card-helm/` | R1: glass variant |

---

## Технічні обмеження

- **Tailwind v4**: немає `tailwind.config.ts` — конфіг через `@theme` у `styles.scss`. Кастомні утиліти через `@layer utilities`.
- **Spartan UI (HLM)**: HlmCard/HlmButton використовують CVA — розширювати через `className` input або додатковий variant, не переписувати базові компоненти.
- **OnPush**: всі компоненти з `ChangeDetectionStrategy.OnPush` — нові `@Input()` variants мають бути чистими значеннями.
- **Angular animations**: поточні SCSS `@keyframes` (card-appear, shimmer, winner-pop) — зберегти, не замінювати.
- **Dark mode**: всі нові glass стилі мають мати `.dark` override.

---

## Порядок виконання

```
Round 0 (Hotfix)   → Round 1 (Foundation) → Round 2 (Clubs)
     → Round 3 (Events) → Round 4 (Auth) → Round 5 (Profile)
          → Round 6 (Secondary) → Round 7 (Review)
```

Round 0 є блокуючим — без нього редизайн не починати (баги ускладнять тестування).
Round 1 є блокуючим для всіх наступних — design tokens мають бути визначені першими.
Round 2–6 можна частково паралелізувати (різні feature-директорії незалежні).
````

## File: .github/workflows/bundle-size.yml
````yaml
name: Bundle Size
on:
  pull_request:
    branches: [main, develop]
permissions:
  contents: read
  pull-requests: write
jobs:
  bundle-size:
    name: Check Bundle Size
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Check compressed size
        uses: preactjs/compressed-size-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          build-script: build -- --configuration=production
          pattern: ./dist/book-club-fe/browser/**/*.{js,css}
          strip-hash: true
````

## File: .github/workflows/ci.yml
````yaml
name: CI
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Install dependencies
        run: npm ci
      - name: Run tests (ChromeHeadless)
        run: npm run test:ci -- --code-coverage
      - name: Upload coverage artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
          retention-days: 7
  build:
    name: Build
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Install dependencies
        run: npm ci
      - name: Build (production)
        run: npm run build -- --configuration=production
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Install dependencies
        run: npm ci
      - name: Audit dependencies
        run: npm audit --audit-level=high
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Install dependencies
        run: npm ci
      - name: Type check
        run: npx tsc --noEmit -p tsconfig.app.json
  sonarcloud:
    name: SonarCloud
    runs-on: ubuntu-latest
    needs: [test]
    permissions:
      contents: read
      pull-requests: read
      security-events: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Download coverage artifact
        continue-on-error: true
        uses: actions/download-artifact@v4
        with:
          name: coverage
          path: coverage
      - name: SonarCloud Scan
        uses: SonarSource/sonarqube-scan-action@v6.0.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      - name: Wait for SonarCloud analysis to complete
        if: github.event_name == 'push'
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: |
          TASK_ID=$(grep ceTaskId .scannerwork/report-task.txt | cut -d= -f2)
          echo "Waiting for SonarCloud task: $TASK_ID"
          for i in $(seq 1 60); do
            STATUS=$(curl -s -H "Authorization: Bearer $SONAR_TOKEN" "https://sonarcloud.io/api/ce/task?id=$TASK_ID" | python3 -c "import json,sys; print(json.load(sys.stdin)['task']['status'])")
            echo "Attempt $i: $STATUS"
            if [ "$STATUS" = "SUCCESS" ]; then
              echo "Analysis complete."
              exit 0
            fi
            if [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
              echo "SonarCloud analysis failed with status: $STATUS"
              exit 1
            fi
            sleep 5
          done
          echo "Timed out waiting for SonarCloud analysis"
          exit 1
      - name: Export SonarCloud issues as SARIF
        if: github.event_name == 'push'
        run: |
          curl -s -u "${{ secrets.SONAR_TOKEN }}:" \
            "https://sonarcloud.io/api/issues/search?projectKeys=leo477_book-club-fe&resolved=false&ps=500" \
            -o sonar-issues.json
          node -e "
            const data = require('./sonar-issues.json');
            const sarif = {
              version: '2.1.0',
              '\$schema': 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
              runs: [{
                tool: {
                  driver: {
                    name: 'SonarCloud',
                    informationUri: 'https://sonarcloud.io',
                    rules: []
                  }
                },
                results: (data.issues || []).map(issue => ({
                  ruleId: issue.rule,
                  message: { text: issue.message },
                  level: issue.severity === 'BLOCKER' || issue.severity === 'CRITICAL' ? 'error' :
                         issue.severity === 'MAJOR' ? 'warning' : 'note',
                  locations: [{
                    physicalLocation: {
                      artifactLocation: { uri: issue.component.split(':').pop() },
                      region: {
                        startLine: issue.textRange ? issue.textRange.startLine : 1,
                        endLine: issue.textRange ? issue.textRange.endLine : 1
                      }
                    }
                  }]
                }))
              }]
            };
            require('fs').writeFileSync('sonar.sarif', JSON.stringify(sarif, null, 2));
            console.log('SARIF generated with ' + sarif.runs[0].results.length + ' issues');
          "
      - name: Upload SARIF to GitHub Code Scanning
        if: github.event_name == 'push'
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: sonar.sarif
          category: sonarcloud
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: [lint, test, build, security, typecheck, sonarcloud]
    if: github.event_name == 'push'
    permissions:
      contents: read
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }}
      url: ${{ steps.deploy.outputs.url }}
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel project settings
        run: vercel pull --yes --environment=${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build project via Vercel
        run: vercel build ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy to Vercel
        id: deploy
        run: |
          DEPLOY_URL=$(vercel deploy --prebuilt ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$DEPLOY_URL" >> $GITHUB_OUTPUT
          echo "Deployed to: $DEPLOY_URL"
````

## File: .github/workflows/lighthouse.yml
````yaml
name: Lighthouse CI
on:
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: lighthouse-${{ github.ref }}
  cancel-in-progress: true
jobs:
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Cache npm and Angular cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            .angular/cache
          key: ${{ runner.os }}-node20-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node20-
      - name: Install dependencies
        run: npm ci
      - name: Build (production)
        run: npm run build -- --configuration=production
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: .lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
````

## File: .github/workflows/pr-review.yml
````yaml
name: pr-review
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - develop
      - main
permissions:
  contents: read
  pull-requests: write
  statuses: write
concurrency:
  group: pr-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true
jobs:
  lint:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - name: Cache Angular cache
        uses: actions/cache@v4
        with:
          path: .angular/cache
          key: ${{ runner.os }}-angular-${{ hashFiles('package-lock.json') }}
      - run: npm ci
      - run: npm run lint
  typecheck:
    name: typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - name: Cache Angular cache
        uses: actions/cache@v4
        with:
          path: .angular/cache
          key: ${{ runner.os }}-angular-${{ hashFiles('package-lock.json') }}
      - run: npm ci
      - run: npx tsc --noEmit -p tsconfig.app.json
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - name: Cache Angular cache
        uses: actions/cache@v4
        with:
          path: .angular/cache
          key: ${{ runner.os }}-angular-${{ hashFiles('package-lock.json') }}
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage artifact
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage
  build:
    name: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - name: Cache Angular cache
        uses: actions/cache@v4
        with:
          path: .angular/cache
          key: ${{ runner.os }}-angular-${{ hashFiles('package-lock.json') }}
      - run: npm ci
      - run: npm run build -- --configuration=production
  gate:
    name: gate
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test, build]
    if: always()
    steps:
      - name: Check job results and post PR comment
        id: gate
        uses: actions/github-script@v7
        env:
          NEEDS: ${{ toJson(needs) }}
        with:
          script: |
            const needs = JSON.parse(process.env.NEEDS);
            const failed = Object.entries(needs)
              .filter(([name, job]) => job.result === 'failure' || job.result === 'cancelled')
              .map(([name]) => name);
            let body;
            if (failed.length > 0) {
              body = `❌ The following jobs failed or were cancelled:\n\n${failed.map(j => `- ${j}`).join('\n')}\n\nPlease check the logs and fix the issues.`;
              core.setFailed('Some jobs failed or were cancelled.');
            } else {
              body = '✅ All automated checks passed — ready for human review';
            }
            core.setOutput('body', body);
      - name: Create or update PR comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.pull_request.number }}
          body: ${{ steps.gate.outputs.body }}
          comment-tag: pr-review-gate
````

## File: src/app/core/api/api-error.util.ts
````typescript
import { HttpErrorResponse } from '@angular/common/http';
export function extractApiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: unknown; detail?: unknown } | null;
    if (typeof body?.error === 'string') return body.error;
    const detail = body?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return (detail[0] as { msg?: string })?.msg ?? err.message ?? 'Unknown error';
    if (detail && typeof detail === 'object') return (detail as { error?: string }).error ?? err.message ?? 'Unknown error';
    return err.message ?? 'Unknown error';
  }
  return 'Unknown error';
}
````

## File: src/app/core/models/club.model.ts
````typescript
import { UserSocials } from './user.model';
import { AfterMeetingVenue } from './event.model';
export type BanDuration = 1 | 3 | 5 | 'permanent';
export type ClubStatus = 'active' | 'paused' | 'cancelled';
export interface CurrentBook {
  title: string;
  author: string;
  description: string;
}
export interface BanRecord {
  userId: string;
  clubId: string;
  bannedAt: string;
  duration: BanDuration;
  bannedBy: string;
}
export interface Club {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  organizerId: string;
  isPublic: boolean;
  memberCount: number;
  memberPreviews: string[];
  createdAt: string;
  city: string;
  nextMeetingDate: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  currentBook: CurrentBook | null;
  status: ClubStatus;
  tags: string[];
  meetingDurationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  cancelledAt?: string;
}
export interface ClubMember {
  clubId: string;
  userId: string;
  role: 'member' | 'organizer';
  joinedAt: string;
}
export interface ClubMemberDetail {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'member' | 'organizer';
  socials?: UserSocials;
  socialsPublic: boolean;
}
````

## File: src/app/core/services/book-cover.service.ts
````typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
interface OpenLibraryResponse {
  docs: { cover_i?: number }[];
}
@Injectable({ providedIn: 'root' })
export class BookCoverService {
  private readonly http = inject(HttpClient);
  fetchCover$(title: string): Observable<string | null> {
    const params = `q=${encodeURIComponent(title)}&fields=cover_i&limit=1`;
    return this.http
      .get<OpenLibraryResponse>(`https://openlibrary.org/search.json?${params}`)
      .pipe(
        map(res => {
          const coverId = res.docs[0]?.cover_i;
          return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
        }),
        catchError(() => of(null)),
      );
  }
}
````

## File: src/app/core/services/book-vote.service.ts
````typescript
import { Injectable, signal } from '@angular/core';
import { BookOption, BookVoteRound } from '../models/book-vote.model';
@Injectable({ providedIn: 'root' })
export class BookVoteService {
  private readonly _rounds = signal<Record<string, BookVoteRound>>({});
  getRound(clubId: string): BookVoteRound | null {
    return this._rounds()[clubId] ?? null;
  }
  createRound(clubId: string): void {
    const round: BookVoteRound = {
      id: crypto.randomUUID(),
      clubId,
      status: 'open',
      options: [],
      totalVotes: 0,
      winnerId: null,
    };
    this._rounds.update(r => ({ ...r, [clubId]: round }));
  }
  addOption(clubId: string, title: string, author: string): void {
    this._patchRound(clubId, round => ({
      ...round,
      options: [
        ...round.options,
        { id: crypto.randomUUID(), title: title.trim(), author: author.trim(), votes: 0, hasVoted: false },
      ],
    }));
  }
  removeOption(clubId: string, optionId: string): void {
    this._patchRound(clubId, round => {
      const removed = round.options.find(o => o.id === optionId);
      const options = round.options.filter(o => o.id !== optionId);
      const totalVotes = round.totalVotes - (removed?.votes ?? 0);
      return { ...round, options, totalVotes };
    });
  }
  vote(clubId: string, optionId: string): void {
    this._patchRound(clubId, round => {
      const options = round.options.map((o): BookOption => {
        if (o.hasVoted && o.id !== optionId) return { ...o, votes: Math.max(0, o.votes - 1), hasVoted: false };
        if (o.id === optionId && !o.hasVoted) return { ...o, votes: o.votes + 1, hasVoted: true };
        return o;
      });
      return { ...round, options, totalVotes: options.reduce((s, o) => s + o.votes, 0) };
    });
  }
  unvote(clubId: string, optionId: string): void {
    this._patchRound(clubId, round => {
      const options = round.options.map((o): BookOption =>
        o.id === optionId ? { ...o, votes: Math.max(0, o.votes - 1), hasVoted: false } : o,
      );
      return { ...round, options, totalVotes: options.reduce((s, o) => s + o.votes, 0) };
    });
  }
  closeRound(clubId: string): void {
    this._patchRound(clubId, round => {
      const winner = [...round.options].sort((a, b) => b.votes - a.votes)[0] ?? null;
      return { ...round, status: 'closed', winnerId: winner?.id ?? null };
    });
  }
  clearRound(clubId: string): void {
    this._rounds.update(r => Object.fromEntries(Object.entries(r).filter(([k]) => k !== clubId)));
  }
  private _patchRound(clubId: string, fn: (r: BookVoteRound) => BookVoteRound): void {
    const current = this._rounds()[clubId];
    if (!current) return;
    this._rounds.update(r => ({ ...r, [clubId]: fn(current) }));
  }
}
````

## File: src/app/core/services/geocoding.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface GeocodeSuggestion {
  label: string;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
}
@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  autocomplete$(q: string, lang = 'uk', limit = 5): Observable<GeocodeSuggestion[]> {
    return this.http.get<GeocodeSuggestion[]>(`${environment.apiUrl}/geocode/autocomplete`, {
      params: { q, lang, limit: String(limit) },
    });
  }
}
````

## File: src/app/core/services/upload.service.ts
````typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  uploadCover$(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<{ url: string }>(`${environment.apiUrl}/upload/cover`, form)
      .pipe(map(r => r.url));
  }
}
````

## File: src/app/features/auth/login/login.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, BookIntroComponent, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly bookOpen = signal(false);
  readonly formVisible = signal(false);
  constructor() {
    this.seo.setPageI18n('SEO.login_title');
    setTimeout(() => this.formVisible.set(true), 700);
  }
  onBookAnimationDone(): void {
    this.router.navigate(['/clubs']);
  }
  readonly form = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);
    this.isSubmitting.set(false);
    if (error) {
      this.errorMessage.set(error);
    } else {
      this.bookOpen.set(true);
    }
  }
}
````

## File: src/app/features/clubs/club-detail/club-event-card/club-event-card.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { ClubEvent } from '../../../../core/models/event.model';
import { HlmButton } from '../../../../shared/spartan/button/src';
@Component({
  selector: 'app-club-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe, HlmButton],
  templateUrl: './club-event-card.component.html',
  styleUrl: './club-event-card.component.scss',
})
export class ClubEventCardComponent {
  readonly event = input.required<ClubEvent>();
  readonly isAuthenticated = input<boolean>(false);
  readonly attending = input<boolean>(false);
  readonly index = input<number>(0);
  readonly attend = output<void>();
  readonly cancelAttend = output<void>();
}
````

## File: src/app/features/clubs/club-detail/club-sidebar-right/club-sidebar-right.component.html
````html
<div class="flex flex-col gap-4">
@if (organizerProfile()) {
  <div hlmCard class="glass-card-subtle p-4 gap-3">
    <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
      {{ 'CLUB_DETAIL.organizer_title' | translate }}
    </h3>
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0" aria-hidden="true">
        {{ organizerProfile()!.displayName | initials }}
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ organizerProfile()!.displayName }}</p>
        <span class="text-xs text-accent-600 dark:text-accent-400">{{ 'CLUB_DETAIL.organizer_badge' | translate }}</span>
      </div>
    </div>
    @if (organizerProfile()!.socialsPublic && organizerProfile()!.socials) {
      <div class="mt-3 flex flex-wrap gap-2">
        @if (organizerProfile()!.socials!.telegram) {
          <a [href]="'https://t.me/' + organizerProfile()!.socials!.telegram" target="_blank" rel="noopener noreferrer"
             class="text-blue-500 hover:text-blue-600 text-lg" aria-label="Telegram">✈️</a>
        }
        @if (organizerProfile()!.socials!.instagram) {
          <a [href]="'https://instagram.com/' + organizerProfile()!.socials!.instagram" target="_blank" rel="noopener noreferrer"
             class="text-pink-500 hover:text-pink-600 text-lg" aria-label="Instagram">📸</a>
        }
        @if (organizerProfile()!.socials!.github) {
          <a [href]="'https://github.com/' + organizerProfile()!.socials!.github" target="_blank" rel="noopener noreferrer"
             class="text-gray-700 dark:text-gray-300 hover:text-gray-900 text-lg" aria-label="GitHub">🐙</a>
        }
        @if (organizerProfile()!.socials!.goodreads) {
          <a [href]="'https://goodreads.com/' + organizerProfile()!.socials!.goodreads" target="_blank" rel="noopener noreferrer"
             class="text-amber-600 hover:text-amber-700 text-lg" aria-label="Goodreads">📚</a>
        }
      </div>
    }
  </div>
}
@if (club().afterMeetingVenue) {
  <div hlmCard class="glass-card-subtle p-4 gap-3">
    <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
      {{ 'CLUB_DETAIL.after_meeting_title' | translate }}
    </h3>
    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ club().afterMeetingVenue!.name }}</p>
    @if (club().afterMeetingVenue!.address) {
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 {{ club().afterMeetingVenue!.address }}</p>
    }
    @if (club().afterMeetingVenue!.description) {
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{{ club().afterMeetingVenue!.description }}</p>
    }
  </div>
}
</div>
````

## File: src/app/features/clubs/club-detail/club-sidebar-right/club-sidebar-right.component.ts
````typescript
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { HlmCard } from '../../../../shared/spartan/card/src';
import { Club } from '../../../../core/models/club.model';
import { UserProfile } from '../../../../core/models/user.model';
@Component({
  selector: 'app-club-sidebar-right',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsPipe, HlmCard],
  templateUrl: './club-sidebar-right.component.html',
})
export class ClubSidebarRightComponent {
  readonly club = input.required<Club>();
  readonly organizerProfile = input<UserProfile | null>(null);
}
````

## File: src/app/features/clubs/club-detail/header/club-header.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { HlmButton } from '../../../../shared/spartan/button/src';
@Component({
  selector: 'app-club-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, LoadingSpinnerComponent, HlmButton],
  templateUrl: './club-header.component.html',
})
export class ClubHeaderComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwner = input.required<boolean>();
  readonly isAuthenticated = input.required<boolean>();
  readonly isActionLoading = input.required<boolean>();
  readonly leave = output<void>();
}
````

## File: src/app/features/clubs/club-detail/manage-panel/club-manage-panel.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HlmCard } from '../../../../shared/spartan/card/src';
@Component({
  selector: 'app-club-manage-panel',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, HlmCard],
  templateUrl: './club-manage-panel.component.html',
})
export class ClubManagePanelComponent {
  readonly clubId = input.required<string>();
}
````

## File: src/app/features/clubs/clubs.routes.ts
````typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { ClubsListComponent } from './clubs-list/clubs-list.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { CreateClubComponent } from './create-club/create-club.component';
export const CLUBS_ROUTES: Routes = [
  {
    path: '',
    component: ClubsListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'create',
    component: CreateClubComponent,
    canActivate: [authGuard, roleGuard('organizer')],
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        component: ClubDetailComponent,
        canActivate: [authGuard],
      },
      {
        path: 'randomizer',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('../randomizer/randomizer.component').then(
            m => m.RandomizerComponent,
          ),
      },
      {
        path: 'quizzes',
        loadChildren: () =>
          import('../quiz/quiz.routes').then(m => m.QUIZ_ROUTES),
      },
      {
        path: 'events/create',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('../events/create-event/create-event.component').then(
            m => m.CreateEventComponent,
          ),
      },
      {
        path: 'edit',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('./edit-club/edit-club.component').then(m => m.EditClubComponent),
      },
    ],
  },
];
````

## File: src/app/features/profile/profile.component.html
````html
<div class="min-h-screen bg-gradient-to-br from-primary-950/30 via-transparent to-accent-950/20">
  <div class="max-w-2xl mx-auto space-y-5 py-8 px-4">
    <section
      aria-labelledby="profile-heading"
      class="glass-card-strong p-8 text-center"
    >
      <div
        class="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-brand
               flex items-center justify-center text-white text-3xl font-bold select-none
               shadow-lg ring-4 ring-white/20"
        aria-hidden="true"
      >
        {{ userInitials() }}
      </div>
      <h1 id="profile-heading" class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ auth.currentUser()?.displayName }}
      </h1>
      <span
        class="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
        [class]="auth.currentUser()?.role === 'organizer'
          ? 'bg-accent-100/80 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
          : 'bg-primary-100/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'"
      >
        {{ auth.currentUser()?.role === 'organizer' ? '🎯' : '📖' }}
        {{ auth.currentUser()?.role === 'organizer' ? ('PROFILE.role_organizer' | translate) : ('PROFILE.role_reader' | translate) }}
      </span>
      @if (joinedDate()) {
        <p class="mt-3 text-sm text-gray-400 dark:text-gray-500">
          {{ 'PROFILE.member_since' | translate }} {{ joinedDate() }}
        </p>
      }
    </section>
    <section aria-labelledby="edit-name-heading" class="glass-card p-6">
      <h2 id="edit-name-heading" class="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span aria-hidden="true">✏️</span> {{ 'PROFILE.edit_profile' | translate }}
      </h2>
      <form [formGroup]="nameForm" (ngSubmit)="saveName()" novalidate>
        <div class="space-y-4">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {{ 'PROFILE.display_name_label' | translate }}
            </label>
            <input
              hlmInput
              id="displayName"
              type="text"
              formControlName="displayName"
              autocomplete="nickname"
              class="w-full"
              [placeholder]="'PROFILE.display_name_placeholder' | translate"
              [attr.aria-invalid]="nameForm.controls.displayName.invalid && nameForm.controls.displayName.touched"
              aria-describedby="displayName-error"
            />
            @if (nameForm.controls.displayName.invalid && nameForm.controls.displayName.touched) {
              <p id="displayName-error" role="alert" class="mt-1.5 text-xs text-red-600 dark:text-red-400">
                @if (nameForm.controls.displayName.hasError('required')) {
                  {{ 'PROFILE.display_name_required' | translate }}
                } @else if (nameForm.controls.displayName.hasError('minlength')) {
                  {{ 'PROFILE.display_name_min' | translate }}
                }
              </p>
            }
          </div>
          <div class="flex items-center gap-3">
            <button
              hlmBtn
              type="submit"
              [disabled]="nameForm.invalid || isSavingName()"
              class="bg-gradient-brand text-white border-0 hover:opacity-90"
            >
              @if (isSavingName()) {
                {{ 'PROFILE.saving' | translate }}
              } @else {
                {{ 'PROFILE.save_name' | translate }}
              }
            </button>
          </div>
        </div>
      </form>
    </section>
    <section aria-labelledby="role-heading" class="glass-card p-6">
      <h2 id="role-heading" class="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
        <span aria-hidden="true">🔖</span> {{ 'PROFILE.role_title' | translate }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
        {{ 'PROFILE.role_subtitle' | translate }}
      </p>
      <app-profile-role-selector
        [currentRole]="auth.currentUser()?.role ?? 'user'"
        (roleChange)="changeRole($event)"
      />
    </section>
    <section aria-labelledby="stats-heading" class="glass-card p-6">
      <h2 id="stats-heading" class="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span aria-hidden="true">📊</span> {{ 'PROFILE.stats_title' | translate }}
      </h2>
      <app-profile-stats [stats]="auth.userStats()" />
    </section>
    <section aria-labelledby="socials-heading" class="glass-card p-6">
      <h2 id="socials-heading" class="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span aria-hidden="true">🌐</span> {{ 'PROFILE.socials_title' | translate }}
      </h2>
      <div class="flex items-center gap-3 mb-4 p-3 rounded-[var(--bento-radius)] glass-card-subtle">
        <label class="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            [formControl]="socialsPublicControl"
            (change)="onSocialsPublicChange(socialsPublicControl.value)"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          {{ 'PROFILE.socials_public_label' | translate }}
        </label>
      </div>
      @if (
        userSocials().telegram  ||
        userSocials().instagram ||
        userSocials().twitter   ||
        userSocials().linkedin  ||
        userSocials().github    ||
        userSocials().goodreads
      ) {
        <div class="flex flex-wrap gap-2 mb-6">
          <app-social-badges [socials]="userSocials()" />
        </div>
      }
      <form [formGroup]="socialsForm" (ngSubmit)="submitSocials()" novalidate class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (social of socialFields; track social.key) {
            <app-social-link-field [config]="social" [form]="socialsForm" />
          }
        </div>
        <div class="flex items-center gap-3 pt-1">
          <button hlmBtn type="submit" class="bg-gradient-brand text-white border-0 hover:opacity-90">
            {{ 'PROFILE.save' | translate }}
          </button>
        </div>
      </form>
    </section>
  </div>
</div>
````

## File: src/app/features/profile/profile.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserSocials } from '../../core/models/user.model';
import { SeoService } from '../../core/services/seo.service';
import { SocialLinkFieldComponent, SocialField } from '../../shared/components/social-link-field/social-link-field.component';
import { SocialBadgesComponent } from '../../shared/components/social-badges/social-badges.component';
import { ProfileStatsComponent } from './stats/profile-stats.component';
import { ProfileRoleSelectorComponent } from './role-selector/profile-role-selector.component';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmInput } from '../../shared/spartan/input/src';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, SocialLinkFieldComponent, SocialBadgesComponent, ProfileStatsComponent, ProfileRoleSelectorComponent, HlmButton, HlmInput],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);
  protected readonly socialFields: SocialField[] = [
    {
      key: 'telegram',
      label: 'Telegram',
      labelClass: 'text-blue-600 dark:text-blue-400',
      placeholder: 'username (без @)',
      focusRingClass: 'focus:ring-blue-500',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      labelClass: 'bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent',
      placeholder: 'username (без @)',
      focusRingClass: 'focus:ring-pink-500',
    },
    {
      key: 'twitter',
      label: 'Twitter / X',
      labelClass: 'text-gray-900 dark:text-gray-100',
      placeholder: 'username (без @)',
      focusRingClass: 'focus:ring-gray-800',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      labelClass: 'text-blue-700 dark:text-blue-400',
      placeholder: 'username або повний URL',
      focusRingClass: 'focus:ring-blue-600',
    },
    {
      key: 'github',
      label: 'GitHub',
      labelClass: 'text-gray-800 dark:text-gray-200',
      placeholder: 'username',
      focusRingClass: 'focus:ring-gray-700',
    },
    {
      key: 'goodreads',
      label: 'Goodreads',
      labelClass: 'text-amber-700 dark:text-amber-400',
      placeholder: 'username або повний URL',
      focusRingClass: 'focus:ring-amber-500',
    },
  ];
  protected readonly nameForm = new FormGroup({
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });
  /** Typed reactive form for updating social media links. */
  protected readonly socialsForm = new FormGroup({
    telegram:  new FormControl('', { nonNullable: true }),
    instagram: new FormControl('', { nonNullable: true }),
    twitter:   new FormControl('', { nonNullable: true }),
    linkedin:  new FormControl('', { nonNullable: true }),
    github:    new FormControl('', { nonNullable: true }),
    goodreads: new FormControl('', { nonNullable: true }),
  });
  /** Controls whether socials are visible to all club members. */
  protected readonly socialsPublicControl = new FormControl<boolean>(false, { nonNullable: true });
  /** Tracks the in-flight save state (synchronous here, but keeps the pattern extensible). */
  protected readonly isSavingName = signal(false);
  /** Two-letter initials derived from the current user's display name. */
  protected readonly userInitials = computed<string>(() => {
    const name = this.auth.currentUser()?.displayName ?? '';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });
  /** Human-readable role label shown in the hero badge. */
  protected readonly roleLabel = computed<string>(() =>
    this.auth.currentUser()?.role === 'organizer' ? 'Organizer' : 'Reader',
  );
  protected readonly joinedDate = computed<string>(() => {
    const raw = this.auth.currentUser()?.createdAt;
    if (!raw) return '';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(
      new Date(raw),
    );
  });
  protected readonly userSocials = computed<UserSocials>(
    () => this.auth.currentUser()?.socials ?? {},
  );
  constructor() {
    this.seo.setPageI18n('SEO.profile_title');
    const user = this.auth.currentUser();
    if (user) {
      this.nameForm.patchValue({ displayName: user.displayName });
      this.socialsPublicControl.setValue(user.socialsPublic ?? false);
      if (user.socials) {
        this.socialsForm.patchValue({
          telegram:  user.socials.telegram  ?? '',
          instagram: user.socials.instagram ?? '',
          twitter:   user.socials.twitter   ?? '',
          linkedin:  user.socials.linkedin  ?? '',
          github:    user.socials.github    ?? '',
          goodreads: user.socials.goodreads ?? '',
        });
      }
    }
  }
  /** Switch the user's role and show a transient success toast. */
  protected async changeRole(role: UserRole): Promise<void> {
    try {
      await this.auth.updateRole(role);
      toast.success(this.translate.instant('PROFILE.role_changed'));
    } catch {  }
  }
  protected async saveName(): Promise<void> {
    if (this.nameForm.invalid) return;
    this.isSavingName.set(true);
    const { displayName } = this.nameForm.getRawValue();
    try {
      await this.auth.updateDisplayName(displayName);
      toast.success(this.translate.instant('PROFILE.name_updated'));
    } catch {  }
    finally {
      this.isSavingName.set(false);
    }
  }
  protected async submitSocials(): Promise<void> {
    const raw = this.socialsForm.getRawValue();
    const socials: UserSocials = {
      ...(raw.telegram  ? { telegram:  raw.telegram  } : {}),
      ...(raw.instagram ? { instagram: raw.instagram } : {}),
      ...(raw.twitter   ? { twitter:   raw.twitter   } : {}),
      ...(raw.linkedin  ? { linkedin:  raw.linkedin  } : {}),
      ...(raw.github    ? { github:    raw.github    } : {}),
      ...(raw.goodreads ? { goodreads: raw.goodreads } : {}),
    };
    try {
      await this.auth.updateSocials(socials);
      toast.success(this.translate.instant('PROFILE.socials_saved'));
    } catch {  }
  }
  protected async onSocialsPublicChange(value: boolean): Promise<void> {
    try {
      await this.auth.setSocialsPublic(value);
    } catch {  }
  }
}
````

## File: src/app/features/quiz/quiz-create/quiz-create.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizQuestion } from '../../../core/models/quiz.model';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
interface MetaForm {
  title: FormControl<string>;
  description: FormControl<string>;
}
interface QuestionForm {
  question: FormControl<string>;
  option0: FormControl<string>;
  option1: FormControl<string>;
  option2: FormControl<string>;
  option3: FormControl<string>;
  correctIndex: FormControl<number>;
}
type LocalQuestion = Omit<QuizQuestion, 'id' | 'quizId'>;
@Component({
  selector: 'app-quiz-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ...HlmFieldImports, HlmInput, HlmButton, ...HlmCardImports],
  templateUrl: './quiz-create.component.html',
})
export class QuizCreateComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly localQuestions = signal<LocalQuestion[]>([]);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  readonly id = input<string>('');
  readonly optionIndices: readonly number[] = [0, 1, 2, 3];
  protected readonly metaForm = new FormGroup<MetaForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });
  protected readonly questionForm = new FormGroup<QuestionForm>({
    question: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
    }),
    option0: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option1: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option2: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option3: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    correctIndex: new FormControl<number>(0, { nonNullable: true }),
  });
  protected isInvalidTouched(ctrl: AbstractControl): boolean {
    return ctrl.invalid && ctrl.touched;
  }
  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
  }
  protected nextStep(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      return;
    }
    this.currentStep.set(2);
  }
  protected previousStep(): void {
    this.currentStep.set(1);
    this.errorMessage.set('');
  }
  protected addQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const { question, option0, option1, option2, option3, correctIndex } =
      this.questionForm.getRawValue();
    const newQuestion: LocalQuestion = {
      question: question.trim(),
      options: [option0.trim(), option1.trim(), option2.trim(), option3.trim()],
      correctIndex,
    };
    this.localQuestions.update(prev => [...prev, newQuestion]);
    this.questionForm.reset({ correctIndex: 0 });
  }
  protected removeQuestion(index: number): void {
    this.localQuestions.update(prev => prev.filter((_, i) => i !== index));
  }
  protected saveQuiz(): void {
    const questions = this.localQuestions();
    if (questions.length === 0) return;
    this.isSaving.set(true);
    this.errorMessage.set('');
    const { title, description } = this.metaForm.getRawValue();
    const clubId = this.id();
    this.quizService
      .createQuiz({ clubId, title: title.trim(), description: description.trim() })
      .then(async quiz => {
        for (const q of questions) {
          await this.quizService.addQuestion(quiz.id, q);
        }
        this.isSaving.set(false);
        this.router.navigate(['/clubs', clubId, 'quizzes']);
      })
      .catch(err => {
        this.isSaving.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
}
````

## File: src/app/features/quiz/quiz-leaderboard/leaderboard-podium/leaderboard-podium.component.html
````html
<div class="flex items-end justify-center gap-3 px-4 py-6">
  <div class="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
    @if (second()) {
      <div class="w-12 h-12 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 overflow-hidden">
        @if (second()!.avatarUrl) {
          <img [src]="second()!.avatarUrl" [alt]="second()!.displayName" class="w-full h-full object-cover" />
        } @else {
          {{ second()!.displayName | initials }}
        }
      </div>
      <p class="text-xs text-gray-700 dark:text-gray-300 font-medium text-center truncate w-full px-1">{{ second()!.displayName }}</p>
      <span class="inline-flex items-center rounded-full bg-gray-200/80 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 text-xs font-bold border border-gray-300 dark:border-gray-600">
        {{ second()!.score }}/{{ second()!.totalQuestions }}
      </span>
    } @else {
      <div class="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-300 dark:text-gray-600 text-lg">—</div>
      <p class="text-xs text-gray-400 dark:text-gray-600 text-center">2nd</p>
    }
    <div class="w-full h-24 rounded-t-xl flex items-center justify-center text-2xl bg-gradient-to-t from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600">
      🥈
    </div>
  </div>
  <div class="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
    @if (first()) {
      <div class="w-14 h-14 rounded-full ring-4 ring-yellow-400 dark:ring-yellow-500 bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-base font-bold text-yellow-700 dark:text-yellow-300 overflow-hidden">
        @if (first()!.avatarUrl) {
          <img [src]="first()!.avatarUrl" [alt]="first()!.displayName" class="w-full h-full object-cover" />
        } @else {
          {{ first()!.displayName | initials }}
        }
      </div>
      <p class="text-xs text-gray-900 dark:text-white font-bold text-center truncate w-full px-1">{{ first()!.displayName }}</p>
      <span class="inline-flex items-center rounded-full bg-yellow-400 text-yellow-900 px-2.5 py-0.5 text-xs font-bold border border-yellow-500">
        {{ first()!.score }}/{{ first()!.totalQuestions }}
      </span>
    } @else {
      <div class="w-14 h-14 rounded-full border-2 border-dashed border-yellow-300 dark:border-yellow-700 flex items-center justify-center text-yellow-300 dark:text-yellow-700 text-xl">—</div>
      <p class="text-xs text-gray-400 dark:text-gray-600 text-center">1st</p>
    }
    <div class="w-full h-32 rounded-t-xl flex items-center justify-center text-3xl bg-gradient-to-t from-yellow-300 to-yellow-100 dark:from-yellow-600/60 dark:to-yellow-400/30">
      🥇
    </div>
  </div>
  <div class="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
    @if (third()) {
      <div class="w-12 h-12 rounded-full ring-2 ring-amber-500 dark:ring-amber-600 bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300 overflow-hidden">
        @if (third()!.avatarUrl) {
          <img [src]="third()!.avatarUrl" [alt]="third()!.displayName" class="w-full h-full object-cover" />
        } @else {
          {{ third()!.displayName | initials }}
        }
      </div>
      <p class="text-xs text-amber-800 dark:text-amber-300 font-medium text-center truncate w-full px-1">{{ third()!.displayName }}</p>
      <span class="inline-flex items-center rounded-full bg-amber-600/80 text-white px-2.5 py-0.5 text-xs font-bold border border-amber-500">
        {{ third()!.score }}/{{ third()!.totalQuestions }}
      </span>
    } @else {
      <div class="w-12 h-12 rounded-full border-2 border-dashed border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-300 dark:text-amber-700 text-lg">—</div>
      <p class="text-xs text-gray-400 dark:text-gray-600 text-center">3rd</p>
    }
    <div class="w-full h-20 rounded-t-xl flex items-center justify-center text-2xl bg-gradient-to-t from-amber-600/70 to-amber-400/40 dark:from-amber-700/60 dark:to-amber-500/30">
      🥉
    </div>
  </div>
</div>
````

## File: src/app/features/quiz/quiz-leaderboard/leaderboard-podium/leaderboard-podium.component.ts
````typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizLeaderboardEntry } from '../../../../core/models/quiz.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
@Component({
  selector: 'app-leaderboard-podium',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InitialsPipe],
  templateUrl: './leaderboard-podium.component.html',
})
export class LeaderboardPodiumComponent {
  readonly first  = input<QuizLeaderboardEntry | null>(null);
  readonly second = input<QuizLeaderboardEntry | null>(null);
  readonly third  = input<QuizLeaderboardEntry | null>(null);
}
````

## File: src/app/features/quiz/quiz-leaderboard/quiz-leaderboard.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
  <div class="max-w-3xl mx-auto space-y-6">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">🏆 Leaderboard</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Auto-refreshes every 30 seconds</p>
      </div>
      <a [routerLink]="['/clubs', id(), 'quizzes']"
         class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
        ← Back to Quizzes
      </a>
    </header>
    @if (isLoadingSession()) {
      <div class="space-y-4">
        <div class="glass-card h-48 animate-pulse"></div>
        <div class="glass-card h-32 animate-pulse"></div>
      </div>
    } @else {
      @if (!session()) {
        <div class="glass-card p-12 text-center">
          <p class="text-4xl mb-3">🎯</p>
          <h2 class="text-gray-700 dark:text-gray-300 font-semibold text-lg">No active session</h2>
          <p class="text-gray-400 dark:text-gray-500 mt-1 text-sm">
            The quiz session hasn't started yet.
          </p>
        </div>
      } @else {
        @if (leaderboard().length === 0 && !isLeaderboardLoading()) {
          <div class="glass-card p-12 text-center">
            <p class="text-4xl mb-3">⏳</p>
            <p class="text-gray-500 dark:text-gray-400">No participants yet.</p>
          </div>
        } @else {
          <div class="glass-card overflow-hidden">
            <app-leaderboard-podium
              [first]="podiumFirst()"
              [second]="podiumSecond()"
              [third]="podiumThird()"
            />
          </div>
          @if (rest().length > 0) {
            <app-leaderboard-rest-table [entries]="rest()" />
          }
        }
      }
    }
  </div>
</div>
````

## File: src/app/features/quiz/quiz-leaderboard/quiz-leaderboard.component.ts
````typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { LeaderboardPodiumComponent } from './leaderboard-podium/leaderboard-podium.component';
import { LeaderboardRestTableComponent } from './leaderboard-rest-table/leaderboard-rest-table.component';
import { LeaderboardBaseComponent } from './leaderboard-base.component';
@Component({
  selector: 'app-quiz-leaderboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...HlmCardImports, InitialsPipe, LeaderboardPodiumComponent, LeaderboardRestTableComponent],
  templateUrl: './quiz-leaderboard.component.html',
})
export class QuizLeaderboardComponent extends LeaderboardBaseComponent implements OnInit {
  ngOnInit(): void {
    this.quizService
      .getActiveSession(this.quizId())
      .then(s => {
        this.session.set(s);
        this.isLoadingSession.set(false);
      });
    this.startPolling(30_000);
  }
}
````

## File: src/app/features/quiz/quiz-preview/quiz-preview.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { QuizDetailBaseComponent } from '../quiz-detail-base.component';
@Component({
  selector: 'app-quiz-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...HlmCardImports, HlmButton],
  templateUrl: './quiz-preview.component.html',
})
export class QuizPreviewComponent extends QuizDetailBaseComponent {
  private readonly router = inject(Router);
  readonly currentIndex = signal(0);
  readonly currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  readonly isFirstQuestion = computed(() => this.currentIndex() === 0);
  readonly isLastQuestion = computed(
    () => this.currentIndex() === this.questions().length - 1,
  );
  readonly isActivating = signal(false);
  readonly errorMessage = signal('');
  protected readonly optionIndices: readonly number[] = [0, 1, 2, 3];
  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
  }
  protected prev(): void {
    if (!this.isFirstQuestion()) this.currentIndex.update(i => i - 1);
  }
  protected next(): void {
    if (!this.isLastQuestion()) this.currentIndex.update(i => i + 1);
  }
  protected activateQuiz(): void {
    this.isActivating.set(true);
    this.quizService
      .toggleActive(this.quizId(), true)
      .then(() => {
        this.isActivating.set(false);
        this.router.navigate(['/clubs', this.id(), 'quizzes']);
      })
      .catch(err => {
        this.isActivating.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
}
````

## File: src/app/layout/shell/shell.component.html
````html
<app-header />
    <main class="min-h-screen">
      <router-outlet />
    </main>
    @defer (on idle) {
      <app-chat-widget />
    } @placeholder {
      <div class="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent-500/30 animate-pulse" aria-hidden="true"></div>
    }
    <app-footer />
````

## File: src/app/shared/components/cover-upload/cover-upload.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  input,
  effect,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../../core/services/upload.service';
@Component({
  selector: 'app-cover-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-2">
      @if (previewUrl() || externalUrl()) {
        <div class="relative rounded-xl overflow-hidden h-28 bg-gray-100 dark:bg-gray-700">
          <img
            [src]="previewUrl() || externalUrl()"
            alt="Cover preview"
            class="w-full h-full object-cover"
            (error)="clearPreview()"
          />
          <button
            type="button"
            (click)="clearPreview()"
            class="absolute top-1 right-1 rounded-full bg-black/50 text-white text-xs px-2 py-0.5 hover:bg-black/70 transition-colors"
          >✕</button>
        </div>
      }
      <div class="flex gap-2">
        <button
          type="button"
          (click)="fileInput.click()"
          [disabled]="isUploading()"
          class="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          @if (isUploading()) {
            <span class="animate-spin">⏳</span> Uploading…
          } @else {
            📁 Upload image
          }
        </button>
        <button
          type="button"
          (click)="showUrlInput.set(!showUrlInput())"
          class="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          🔗 {{ showUrlInput() ? 'Hide URL' : 'Enter URL' }}
        </button>
      </div>
      @if (showUrlInput()) {
        <input
          type="url"
          [formControl]="control()"
          placeholder="https://example.com/cover.jpg"
          class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      }
      @if (uploadError()) {
        <p class="text-xs text-red-600 dark:text-red-400">{{ uploadError() }}</p>
      }
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
})
export class CoverUploadComponent {
  readonly control = input.required<FormControl<string>>();
  private readonly uploadService = inject(UploadService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isUploading = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly showUrlInput = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly externalUrl = signal<string>('');
  constructor() {
    effect(onCleanup => {
      const ctrl = this.control();
      this.externalUrl.set(ctrl.value);
      const sub = ctrl.valueChanges.subscribe(v => this.externalUrl.set(v ?? ''));
      onCleanup(() => sub.unsubscribe());
    });
  }
  clearPreview(): void {
    this.previewUrl.set(null);
    this.control().setValue('');
  }
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.previewUrl.set(URL.createObjectURL(file));
    this.uploadError.set(null);
    this.isUploading.set(true);
    this.uploadService.uploadCover$(file).subscribe({
      next: url => {
        this.control().setValue(url);
        this.isUploading.set(false);
      },
      error: () => {
        this.uploadError.set('Upload failed. Please try again or use a URL.');
        this.isUploading.set(false);
        this.previewUrl.set(null);
      },
    });
  }
}
````

## File: src/app/shared/spartan/index.ts
````typescript
export * from './badge/src';
export * from './button/src';
export * from './card/src';
export * from './dropdown-menu/src';
export * from './field/src';
export * from './icon/src';
export * from './input/src';
export * from './sheet/src';
export * from './sonner/src';
export * from './spinner/src';
export * from './tabs/src';
export * from './utils/src';
````

## File: src/app/app.routes.ts
````typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './layout/shell/shell.component';
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // Protected: any authenticated user
      {
        path: 'clubs',
        canActivate: [authGuard],
        loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
      },
      {
        path: 'events',
        canActivate: [authGuard],
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
      },
      {
        path: 'manage',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('./features/clubs/clubs-list/clubs-list.component').then(
            m => m.ClubsListComponent,
          ),
      },
      { path: '', redirectTo: 'clubs', pathMatch: 'full' },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      { path: '**', redirectTo: 'clubs' },
    ],
  },
];
````

## File: postcss.config.mjs
````javascript
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    tailwindcss({ base: __dirname }),
  ],
};
````

## File: sonar-project.properties
````
# Replace YOUR_ORG with your actual SonarCloud organization slug
sonar.projectKey=leo477_book-club-fe
sonar.organization=leo477
sonar.projectName=Book Club Frontend
sonar.projectVersion=1.0

sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.exclusions=**/node_modules/**,**/*.spec.ts,src/assets/**,src/environments/**

sonar.typescript.lcov.reportPaths=coverage/book-club-fe/lcov.info

# Exclude non-testable and currently untested files from coverage requirements
sonar.coverage.exclusions=\
  **/*.html,\
  **/*.spec.ts,\
  **/mocks/**,\
  **/*.model.ts,\
  **/*.interface.ts,\
  **/*.config.ts,\
  **/environments/**,\
  src/app/features/**,\
  src/app/layout/**,\
  src/app/shared/spartan/**

sonar.sourceEncoding=UTF-8
````

## File: tsconfig.json
````json
{
  "compileOnSave": false,
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "preserve",
    "paths": {
      "@spartan-ng/helm/button": [
        "./src/app/shared/spartan/button/src/index.ts"
      ],
      "@spartan-ng/helm/utils": [
        "./src/app/shared/spartan/utils/src/index.ts"
      ],
      "@spartan-ng/helm/badge": [
        "./src/app/shared/spartan/badge/src/index.ts"
      ],
      "@spartan-ng/helm/field": [
        "./src/app/shared/spartan/field/src/index.ts"
      ],
      "@spartan-ng/helm/label": [
        "./src/app/shared/spartan/label/src/index.ts"
      ],
      "@spartan-ng/helm/separator": [
        "./src/app/shared/spartan/separator/src/index.ts"
      ],
      "@spartan-ng/helm/input": [
        "./src/app/shared/spartan/input/src/index.ts"
      ],
      "@spartan-ng/helm/spinner": [
        "./src/app/shared/spartan/spinner/src/index.ts"
      ],
      "@spartan-ng/helm/sonner": [
        "./src/app/shared/spartan/sonner/src/index.ts"
      ],
      "@spartan-ng/helm/card": [
        "./src/app/shared/spartan/card/src/index.ts"
      ],
      "@spartan-ng/helm/tabs": [
        "./src/app/shared/spartan/tabs/src/index.ts"
      ],
      "@spartan-ng/helm/icon": [
        "./src/app/shared/spartan/icon/src/index.ts"
      ],
      "@spartan-ng/helm/sheet": [
        "./src/app/shared/spartan/sheet/src/index.ts"
      ],
      "@spartan-ng/helm/dropdown-menu": [
        "./src/app/shared/spartan/dropdown-menu/src/index.ts"
      ]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
````

## File: vercel.json
````json
{

  "buildCommand": "npm run build -- --configuration=production",
  "outputDirectory": "dist/book-club-fe/browser",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://vercel.live https://book-club-be.onrender.com wss://*.pusher.com https://*.pusher.com https://*.pusherapp.com; frame-src https://vercel.live; frame-ancestors 'none';" }
      ]
    }
  ]
}
````

## File: src/app/core/interceptors/auth.interceptor.ts
````typescript
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { catchError, throwError } from 'rxjs';
import { TokenStore } from '../auth/token.store';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next$) => {
  const router = inject(Router);
  const tokenStore = inject(TokenStore);
  const token = tokenStore.snapshot();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next$(authedReq).pipe(
    catchError((error: unknown) => {
      const httpError = error instanceof HttpErrorResponse ? error : null;
      if (httpError?.status === 401 && token) {
        tokenStore.clear();
        router.navigate(['/login']);
      } else if (httpError?.status === 403) {
        router.navigate(['/clubs']);
      } else if (httpError && httpError.status >= 500) {
        if (!environment.production) {
          console.error('[HTTP] Server error', httpError.status, httpError.url, httpError);
        }
        toast.error('A server error occurred. Please try again later.');
      }
      return throwError(() => error);
    }),
  );
};
````

## File: src/app/core/services/chat.service.ts
````typescript
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { environment } from '../../../environments/environment';
interface ApiChatRoom {
  id: string;
  name: string;
}
interface ApiChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private readonly _rooms = signal<ChatRoom[]>([]);
  private readonly _messages = signal<Record<string, ChatMessage[]>>({});
  private readonly _activeRoomId = signal<string | null>(null);
  private readonly _unreadCount = signal<number>(0);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _hasNewMessage = signal<boolean>(false);
  private readonly _mutedUserIds = signal<Set<string>>(new Set());
  private currentUserId: string | null = null;
  readonly rooms = this._rooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly activeRoomId = this._activeRoomId.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasNewMessage = this._hasNewMessage.asReadonly();
  readonly mutedUserIds = this._mutedUserIds.asReadonly();
  readonly activeRoom = computed(() =>
    this._rooms().find(r => r.id === this._activeRoomId()) ?? null,
  );
  readonly activeMessages = computed(() => {
    const msgs = this._messages()[this._activeRoomId() ?? ''] ?? [];
    const muted = this._mutedUserIds();
    return msgs.map(m => ({ ...m, isMuted: muted.has(m.senderId) }));
  });
  // ── Public API ────────────────────────────────────────────────────────────
  /** Fetch chat rooms for a given club and seed the rooms signal. */
  loadRooms(clubId: string, userId?: string): void {
    if (userId !== undefined) {
      this.currentUserId = userId;
    }
    firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${clubId}/chat/rooms`))
      .then(raw => {
        const rooms: ChatRoom[] = raw.map(r => ({ id: r.id, name: r.name, clubId }));
        this._rooms.set(rooms);
        const currentId = this._activeRoomId();
        if (!currentId || !rooms.some(r => r.id === currentId)) {
          const first = rooms[0];
          if (first) {
            this._activeRoomId.set(first.id);
            this.loadMessages(first.id);
          }
        }
      })
      .catch((err: unknown) => console.error('[ChatService] loadRooms error', err));
  }
  loadAllClubRooms(clubs: { id: string; name: string }[], userId?: string): void {
    if (userId !== undefined) this.currentUserId = userId;
    const multipleClubs = clubs.length > 1;
    const requests = clubs.map(club =>
      firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${club.id}/chat/rooms`))
        .then(raw => raw.map(r => ({
          id: r.id,
          name: multipleClubs ? `${club.name} · ${r.name}` : r.name,
          clubId: club.id,
        })))
        .catch(() => [] as ChatRoom[]),
    );
    Promise.all(requests).then(results => {
      const allRooms = results.flat();
      this._rooms.set(allRooms);
      const currentId = this._activeRoomId();
      if (!currentId || !allRooms.some(r => r.id === currentId)) {
        const first = allRooms[0];
        if (first) {
          this._activeRoomId.set(first.id);
          this.loadMessages(first.id);
        }
      }
    }).catch((err: unknown) => console.error('[ChatService] loadAllClubRooms error', err));
  }
  loadMessages(roomId: string, params?: { before?: string; limit?: number }): void {
    const query: Record<string, string> = {};
    if (params?.before) query['before'] = params.before;
    if (params?.limit != null) query['limit'] = String(params.limit);
    firstValueFrom(
      this.http.get<ApiChatMessage[]>(`${this.api}/chat/rooms/${roomId}/messages`, {
        params: query,
      }),
    )
      .then(raw => {
        const msgs: ChatMessage[] = raw.map(m => this.mapMessage(m));
        this._messages.update(map => ({ ...map, [roomId]: msgs }));
      })
      .catch((err: unknown) => console.error('[ChatService] loadMessages error', err));
  }
  toggleOpen(): void {
    this._isOpen.update(v => !v);
    if (this._isOpen()) {
      this.markAsRead();
    }
  }
  openRoom(roomId: string): void {
    this._activeRoomId.set(roomId);
    this.loadMessages(roomId);
    this.markAsRead();
  }
  markAsRead(): void {
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
  }
  clearRooms(): void {
    this._rooms.set([]);
    this._messages.set({});
    this._activeRoomId.set(null);
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
    this._isOpen.set(false);
    this._mutedUserIds.set(new Set());
    this.currentUserId = null;
  }
  muteUser(userId: string): void {
    this._mutedUserIds.update(set => new Set([...set, userId]));
  }
  unmuteUser(userId: string): void {
    this._mutedUserIds.update(set => {
      const next = new Set(set);
      next.delete(userId);
      return next;
    });
  }
  sendMessage(text: string, currentUser: { id: string; displayName: string }): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    this.currentUserId = currentUser.id;
    firstValueFrom(
      this.http.post<ApiChatMessage>(`${this.api}/chat/rooms/${roomId}/messages`, { text }),
    )
      .then(() => {
        this.loadMessages(roomId);
      })
      .catch((err: unknown) => console.error('[ChatService] sendMessage error', err));
  }
  deleteMessage(messageId: string): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    firstValueFrom(
      this.http.delete(`${this.api}/chat/rooms/${roomId}/messages/${messageId}`),
    )
      .then(() => {
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.id !== messageId),
        }));
      })
      .catch((err: unknown) => console.error('[ChatService] deleteMessage error', err));
  }
  banUserFromChat(userId: string, durationSeconds: number): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    firstValueFrom(
      this.http.post(`${this.api}/chat/rooms/${roomId}/ban`, {
        user_id: userId,
        duration_seconds: durationSeconds,
      }),
    )
      .then(() => {
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.senderId !== userId),
        }));
      })
      .catch((err: unknown) => console.error('[ChatService] banUserFromChat error', err));
  }
  createRoom(clubId: string, name: string): void {
    firstValueFrom(
      this.http.post<ApiChatRoom>(`${this.api}/clubs/${clubId}/chat/rooms`, { name }),
    )
      .then(raw => {
        const room: ChatRoom = { id: raw.id, name: raw.name, clubId };
        this._rooms.update(rooms => [...rooms, room]);
      })
      .catch((err: unknown) => console.error('[ChatService] createRoom error', err));
  }
  private mapMessage(m: ApiChatMessage): ChatMessage {
    return {
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderName,
      text: m.text,
      timestamp: new Date(m.timestamp),
      isOwn: m.senderId === this.currentUserId,
    };
  }
}
````

## File: src/app/core/services/quiz.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { Quiz, QuizAttempt, QuizQuestion, QuizStatus, QuizSession, QuizLeaderboardEntry } from '../models/quiz.model';
import { ClubEvent } from '../models/event.model';
interface ApiQuiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
  status: string;
}
interface ApiQuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
}
interface ApiAttemptResponse {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  total: number;
  answers: number[];
}
interface ApiQuizSession {
  id: string;
  quizId: string;
  eventId: string;
  startedBy: string;
  startedAt: string;
  closedAt: string | null;
  participantCount: number;
}
interface ApiLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  totalQuestions: number;
  hasAttempted: boolean;
}
function mapQuiz(raw: ApiQuiz): Quiz {
  return {
    id: raw.id,
    clubId: raw.clubId,
    createdBy: raw.createdBy,
    title: raw.title,
    description: raw.description,
    status: (raw.status as QuizStatus) ?? 'draft',
    isActive: raw.isActive,
  };
}
function mapQuestion(raw: ApiQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    quizId: raw.quizId,
    question: raw.question,
    options: raw.options,
    correctIndex: raw.correctIndex,
  };
}
function mapAttempt(raw: ApiAttemptResponse): QuizAttempt {
  return {
    id: raw.id,
    quizId: raw.quizId,
    userId: raw.userId,
    score: raw.score,
    total: raw.total,
    answers: raw.answers,
  };
}
function mapSession(raw: ApiQuizSession): QuizSession {
  return { ...raw };
}
function mapLeaderboardEntry(raw: ApiLeaderboardEntry): QuizLeaderboardEntry {
  return { ...raw };
}
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private readonly _quizzes = signal<Quiz[]>([]);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _session = signal<QuizSession | null>(null);
  private readonly _leaderboard = signal<QuizLeaderboardEntry[]>([]);
  readonly quizzes = this._quizzes.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly session = this._session.asReadonly();
  readonly leaderboard = this._leaderboard.asReadonly();
  readonly activeQuiz = computed(() => this._quizzes().find(q => q.isActive) ?? null);
  async loadQuizzes(clubId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuiz[]>(`${this.api}/clubs/${clubId}/quizzes`),
      );
      this._quizzes.set(raw.map(mapQuiz));
    } catch (err) {
      throw new Error(extractApiError(err));
    } finally {
      this._isLoading.set(false);
    }
  }
  async createQuiz(data: {
    clubId: string;
    title: string;
    description: string;
  }): Promise<Quiz> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiQuiz>(`${this.api}/clubs/${data.clubId}/quizzes`, {
          title: data.title,
          description: data.description || null,
        }),
      );
      const quiz = mapQuiz(raw);
      this._quizzes.update(prev => [quiz, ...prev]);
      return quiz;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async addQuestion(
    quizId: string,
    q: Omit<QuizQuestion, 'id' | 'quizId'>,
  ): Promise<void> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiQuizQuestion>(`${this.api}/quizzes/${quizId}/questions`, {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        }),
      );
      this._questions.update(prev => [...prev, mapQuestion(raw)]);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async loadQuestions(quizId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuizQuestion[]>(`${this.api}/quizzes/${quizId}/questions`),
      );
      this._questions.set(raw.map(mapQuestion));
    } catch (err) {
      throw new Error(extractApiError(err));
    } finally {
      this._isLoading.set(false);
    }
  }
  async submitAttempt(quizId: string, answers: number[]): Promise<QuizAttempt> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiAttemptResponse>(`${this.api}/quizzes/${quizId}/attempts`, { answers }),
      );
      return mapAttempt(raw);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async toggleActive(quizId: string, isActive: boolean): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.api}/quizzes/${quizId}/active`, { isActive }),
      );
      this._quizzes.update(prev =>
        prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuiz>(`${this.api}/quizzes/${quizId}`),
      );
      return mapQuiz(raw);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuizQuestion[]>(`${this.api}/quizzes/${quizId}/questions`),
      );
      return raw.map(mapQuestion);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async updateQuiz(
    quizId: string,
    data: { title: string; description: string },
  ): Promise<Quiz> {
    try {
      const raw = await firstValueFrom(
        this.http.patch<ApiQuiz>(`${this.api}/quizzes/${quizId}`, data),
      );
      const quiz = mapQuiz(raw);
      this._quizzes.update(prev => prev.map(q => (q.id === quizId ? quiz : q)));
      return quiz;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async updateQuestion(
    quizId: string,
    questionId: string,
    q: Partial<Omit<QuizQuestion, 'id' | 'quizId'>>,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.api}/quizzes/${quizId}/questions/${questionId}`,
          q,
        ),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(
          `${this.api}/quizzes/${quizId}/questions/${questionId}`,
        ),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async reorderQuestions(quizId: string, orderedIds: string[]): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.api}/quizzes/${quizId}/questions/order`, {
          order: orderedIds,
        }),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async startSession(quizId: string, eventId: string): Promise<QuizSession> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiQuizSession>(
          `${this.api}/quizzes/${quizId}/sessions`,
          { eventId },
        ),
      );
      const session = mapSession(raw);
      this._session.set(session);
      return session;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async getActiveSession(quizId: string): Promise<QuizSession | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuizSession>(
          `${this.api}/quizzes/${quizId}/sessions/active`,
        ),
      );
      return mapSession(raw);
    } catch {
      return null;
    }
  }
  async getLeaderboard(
    quizId: string,
    sessionId: string,
  ): Promise<QuizLeaderboardEntry[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<{ entries: ApiLeaderboardEntry[] }>(
          `${this.api}/quizzes/${quizId}/sessions/${sessionId}/leaderboard`,
        ),
      );
      return raw.entries.map(mapLeaderboardEntry);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async endSession(quizId: string, sessionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.api}/quizzes/${quizId}/sessions/${sessionId}/close`,
          {},
        ),
      );
      this._session.set(null);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async getClubQuizzes(clubId: string): Promise<Quiz[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuiz[]>(`${this.api}/clubs/${clubId}/quizzes`),
      );
      return raw.map(mapQuiz);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
  async loadClubEvents(clubId: string): Promise<ClubEvent[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ClubEvent[]>(`${this.api}/clubs/${clubId}/events`),
      );
      return raw;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
}
````

## File: src/app/features/auth/login/login.component.html
````html
<div class="auth-page-wrapper">
  <app-book-intro [open]="bookOpen()" (animationDone)="onBookAnimationDone()" />
  <main class="auth-form-container">
    @if (formVisible()) {
      <div class="w-full max-w-md animate-form-in">
        <div class="text-center mb-8">
          <h1 class="font-display text-3xl font-bold text-white drop-shadow-sm">📚 Book Club</h1>
          <p class="text-white/70 mt-2">{{ 'AUTH.welcome_back' | translate }}</p>
        </div>
        <div class="glass-card-strong p-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ 'AUTH.sign_in_h2' | translate }}</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
            <fieldset class="border-0 p-0 m-0">
              <legend class="sr-only">{{ 'AUTH.sign_in_h2' | translate }}</legend>
              <hlm-field>
                <label hlmFieldLabel for="login-email">{{ 'AUTH.email' | translate }}</label>
                <input hlmInput id="login-email" type="email" placeholder="you@example.com" [formControl]="form.controls.email" />
                <hlm-field-error validator="required">{{ 'FORM_ERRORS.required' | translate }}</hlm-field-error>
                <hlm-field-error validator="email">{{ 'FORM_ERRORS.email' | translate }}</hlm-field-error>
              </hlm-field>
              <hlm-field>
                <label hlmFieldLabel for="login-password">{{ 'AUTH.password' | translate }}</label>
                <input hlmInput id="login-password" type="password" placeholder="••••••••" [formControl]="form.controls.password" />
                <hlm-field-error validator="required">{{ 'FORM_ERRORS.required' | translate }}</hlm-field-error>
                <hlm-field-error validator="minlength">{{ 'FORM_ERRORS.minlength' | translate: {requiredLength: 8} }}</hlm-field-error>
              </hlm-field>
            </fieldset>
            @if (errorMessage()) {
              <div class="flex items-start gap-2 glass-card-subtle px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
                <span class="mt-0.5 shrink-0">⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }
            <button
              hlmBtn
              type="submit"
              [disabled]="isSubmitting()"
              class="mt-2 w-full bg-gradient-brand text-white border-0 hover:opacity-90 focus-visible:ring-primary-500"
            >
              @if (isSubmitting()) {
                <hlm-spinner aria-label="Loading" />
                {{ 'AUTH.signing_in' | translate }}
              } @else {
                {{ 'AUTH.submit_login' | translate }}
              }
            </button>
          </form>
          <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {{ 'AUTH.no_account' | translate }}
            <a routerLink="/register" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              {{ 'AUTH.register_title' | translate }}
            </a>
          </p>
        </div>
        <p class="mt-6 text-center text-sm">
          <a
            routerLink="/"
            class="inline-flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            {{ 'NAV.back_home' | translate }}
          </a>
        </p>
      </div>
    }
  </main>
</div>
````

## File: src/app/features/auth/register/register.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value as string;
  const confirmPassword = group.get('confirmPassword')?.value as string;
  return password === confirmPassword ? null : { passwordMismatch: true };
};
interface RegisterForm {
  displayName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  role: FormControl<UserRole>;
}
@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, BookIntroComponent, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly successMessage = signal(false);
  readonly registeredEmail = signal('');
  readonly selectedRole = signal<UserRole>('user');
  readonly bookOpen = signal(false);
  readonly formVisible = signal(false);
  constructor() {
    this.seo.setPageI18n('SEO.register_title');
    setTimeout(() => this.formVisible.set(true), 700);
  }
  onBookAnimationDone(): void {
  }
  readonly form = new FormGroup<RegisterForm>(
    {
      displayName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      role: new FormControl<UserRole>('user', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordMatchValidator },
  );
  private readonly _passwordValue = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });
  readonly passwordStrength = computed<'weak' | 'medium' | 'strong' | null>(() => {
    const pw = this._passwordValue();
    if (!pw || pw.length === 0) return null;
    if (pw.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 2) return 'strong';
    if (score === 1) return 'medium';
    return 'weak';
  });
  setRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.form.controls.role.setValue(role);
    this.form.controls.role.markAsTouched();
  }
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const { displayName, email, password, role } = this.form.getRawValue();
    const { error } = await this.auth.signUp(email, password, displayName, role);
    this.isSubmitting.set(false);
    if (error) {
      this.errorMessage.set(error);
    } else {
      this.registeredEmail.set(email);
      this.successMessage.set(true);
      this.bookOpen.set(true);
    }
  }
}
````

## File: src/app/features/clubs/club-detail/club-event-card/club-event-card.component.html
````html
<article
  class="parchment-card glass-card flex flex-col overflow-hidden h-full"
  [style.animation-delay]="index() * 80 + 'ms'"
>
  @if (event().coverUrl) {
    <div class="h-28 overflow-hidden flex-shrink-0">
      <img [src]="event().coverUrl" [alt]="event().title" class="w-full h-full object-cover" loading="lazy" />
    </div>
  } @else {
    <div class="h-1 w-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 flex-shrink-0"></div>
  }
  @if (event().status !== 'scheduled') {
    <div
      class="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm border z-10"
      [class]="event().status === 'active'
        ? 'bg-green-100/80 border-green-400 dark:bg-green-900/50 dark:border-green-600'
        : event().status === 'cancelled'
          ? 'bg-red-100/80 border-red-400 dark:bg-red-900/50 dark:border-red-600'
          : 'bg-yellow-100/80 border-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-600'"
      [attr.title]="event().status"
    >
      {{ event().status === 'active' ? '🟢' : event().status === 'cancelled' ? '🔴' : '🟡' }}
    </div>
  }
  <div class="flex flex-col flex-1 p-4 gap-3">
    <div>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-primary-100/80 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700/60 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
        📅 {{ event().date | formatDate }}
      </span>
    </div>
    <a
      [routerLink]="['/events', event().id]"
      class="block font-display text-base font-semibold leading-snug text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
    >
      {{ event().title }}
    </a>
    @if (event().city) {
      <p class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <span aria-hidden="true">📍</span>
        <span>{{ event().address || event().city }}</span>
      </p>
    }
    @if (event().theme || event().tags.length > 0) {
      <div class="flex flex-wrap gap-1.5">
        @if (event().theme) {
          <span class="rune-pill rounded-full bg-accent-100/80 dark:bg-accent-900/40 border border-accent-200 dark:border-accent-700/60 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:text-accent-300">
            ✨ {{ event().theme }}
          </span>
        }
        @for (tag of event().tags.slice(0, 2); track tag) {
          <span class="rune-pill rounded-full bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400">
            🏷 {{ tag }}
          </span>
        }
      </div>
    }
    <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/20 dark:border-white/10">
      <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        👥 {{ event().attendeeCount }} {{ 'CLUB_DETAIL.rsvp_attending' | translate }}
      </span>
      <div class="flex items-center gap-2">
        @if (isAuthenticated() && event().status !== 'cancelled') {
          @if (event().isAttending) {
            <button
              hlmBtn
              size="sm"
              type="button"
              [disabled]="attending()"
              (click)="cancelAttend.emit()"
              class="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              @if (attending()) { ⏳ } @else { {{ 'CLUB_DETAIL.rsvp_going' | translate }} }
            </button>
          } @else {
            <button
              hlmBtn
              size="sm"
              type="button"
              [disabled]="attending()"
              (click)="attend.emit()"
              class="bg-primary-600 hover:bg-primary-700 text-white text-xs"
            >
              @if (attending()) { ⏳ } @else { {{ 'CLUB_DETAIL.rsvp_join' | translate }} }
            </button>
          }
        } @else {
          <a
            hlmBtn
            variant="outline"
            size="sm"
            [routerLink]="['/events', event().id]"
            class="text-xs"
          >
            {{ 'CLUB_DETAIL.rsvp_view' | translate }} →
          </a>
        }
      </div>
    </div>
  </div>
</article>
````

## File: src/app/features/clubs/club-detail/members/club-members-list.component.html
````html
<section hlmCard [attr.aria-label]="'MEMBERS.title' | translate" class="glass-card px-6 gap-4">
  <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
    {{ 'MEMBERS.title' | translate }} ({{ members().length }})
  </h2>
  @if (members().length === 0) {
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'MEMBERS.empty' | translate }}</p>
  } @else {
    <ul class="divide-y divide-gray-100 dark:divide-gray-700">
      @for (member of members(); track member.userId) {
        <li class="flex items-center gap-4 py-3 relative">
          <div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0" aria-hidden="true">
            {{ member.displayName | initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ member.displayName }}
            </p>
            @if (member.role === 'organizer') {
              <span class="inline-block text-xs font-medium text-accent-600 dark:text-accent-400">
                {{ 'MEMBERS.organizer' | translate }}
              </span>
            } @else {
              <span class="inline-block text-xs text-gray-400 dark:text-gray-500">
                {{ 'MEMBERS.member' | translate }}
              </span>
            }
          </div>
          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            @if (canSeeSocials(member)) {
              @if (member.socials?.telegram) {
                <a [href]="'https://t.me/' + member.socials!.telegram" target="_blank" rel="noopener noreferrer"
                   class="text-blue-500 hover:text-blue-600 text-lg" [attr.aria-label]="'Telegram: @' + member.socials!.telegram" title="Telegram">
                  ✈️
                </a>
              }
              @if (member.socials?.instagram) {
                <a [href]="'https://instagram.com/' + member.socials!.instagram" target="_blank" rel="noopener noreferrer"
                   class="text-pink-500 hover:text-pink-600 text-lg" [attr.aria-label]="'Instagram: @' + member.socials!.instagram" title="Instagram">
                  📸
                </a>
              }
              @if (member.socials?.github) {
                <a [href]="'https://github.com/' + member.socials!.github" target="_blank" rel="noopener noreferrer"
                   class="text-gray-700 dark:text-gray-300 hover:text-gray-900 text-lg" [attr.aria-label]="'GitHub: ' + member.socials!.github" title="GitHub">
                  🐙
                </a>
              }
              @if (member.socials?.goodreads) {
                <a [href]="'https://goodreads.com/' + member.socials!.goodreads" target="_blank" rel="noopener noreferrer"
                   class="text-amber-600 hover:text-amber-700 text-lg" title="Goodreads">
                  📚
                </a>
              }
              @if (member.socials && (member.socials.telegram || member.socials.instagram || member.socials.github || member.socials.goodreads)) {
                <button
                  hlmBtn
                  variant="secondary"
                  size="sm"
                  type="button"
                  (click)="toggleQr(member.userId)"
                  class="ml-1 text-xs"
                  [attr.aria-expanded]="showQrForUser() === member.userId"
                  [attr.aria-label]="'MEMBERS.show_qr' | translate"
                >
                  <span aria-hidden="true">⊡</span> {{ 'MEMBERS.show_qr' | translate }}
                </button>
                @if (showQrForUser() === member.userId) {
                  <dialog class="absolute right-0 top-full mt-2 z-20 rounded-2xl glass-card-strong shadow-xl p-4 flex flex-col items-center gap-2"
                       aria-modal="false" [attr.aria-label]="member.displayName + ' QR'">
                    <p class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ member.displayName }}</p>
                    @defer (on idle) {
                      <app-qr-code [value]="buildQrValue(member)" [size]="160" />
                    } @placeholder {
                      <div class="h-40 w-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" aria-hidden="true"></div>
                    }
                    <button hlmBtn variant="ghost" size="sm" type="button" (click)="toggleQr(member.userId)"
                            class="mt-1 text-xs text-gray-400">{{ 'CLUB_DETAIL.close_qr' | translate }}</button>
                  </dialog>
                }
              }
            } @else {
              <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                🔒 {{ 'MEMBERS.socials_hidden' | translate }}
              </span>
            }
            @if (isOwner() && member.role !== 'organizer') {
              <div class="flex items-center gap-1 ml-2 flex-shrink-0 relative">
                <button hlmBtn variant="destructive" size="xs" type="button" (click)="kick.emit(member.userId)"
                         [attr.aria-label]="'MEMBERS.kick' | translate">
                  {{ 'MEMBERS.kick' | translate }}
                </button>
                <button hlmBtn variant="ghost" size="xs" type="button" (click)="toggleBanMenu(member.userId)"
                        class="text-orange-600 hover:text-orange-700"
                        [attr.aria-expanded]="showBanMenu() === member.userId">
                  {{ 'MEMBERS.ban' | translate }}
                </button>
                @if (showBanMenu() === member.userId) {
                  <menu class="absolute right-0 top-full mt-1 z-30 rounded-xl glass-card-strong shadow-xl py-1 min-w-36">
                    @for (duration of banDurations; track duration) {
                      <li>
                        <button hlmBtn variant="ghost" type="button" (click)="emitBan(member.userId, duration)"
                                class="w-full justify-start px-4 text-sm">
                          @if (duration === 1) { {{ 'MEMBERS.ban_1' | translate }} }
                          @else if (duration === 3) { {{ 'MEMBERS.ban_3' | translate }} }
                          @else if (duration === 5) { {{ 'MEMBERS.ban_5' | translate }} }
                          @else { {{ 'MEMBERS.ban_permanent' | translate }} }
                        </button>
                      </li>
                    }
                  </menu>
                }
              </div>
            }
          </div>
        </li>
      }
    </ul>
  }
</section>
````

## File: src/app/features/events/event-card/event-card.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubEvent } from '../../../core/models/event.model';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmBadge } from '../../../shared/spartan/badge/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
@Component({
  selector: 'app-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe, ...HlmCardImports, HlmButton, HlmBadge, HlmSpinner],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  readonly event = input.required<ClubEvent>();
  readonly isAuthenticated = input<boolean>(false);
  readonly attending = input<boolean>(false);
  readonly attend = output<void>();
  readonly cancelAttend = output<void>();
}
````

## File: src/app/features/quiz/quiz-edit/quiz-edit.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  linkedSignal,
  signal,
} from '@angular/core';
import { inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { QuizDetailBaseComponent } from '../quiz-detail-base.component';
interface MetaForm {
  title: FormControl<string>;
  description: FormControl<string>;
}
interface QuestionForm {
  question: FormControl<string>;
  option0: FormControl<string>;
  option1: FormControl<string>;
  option2: FormControl<string>;
  option3: FormControl<string>;
  correctIndex: FormControl<number>;
}
interface EditableQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}
@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ...HlmFieldImports, HlmInput, HlmButton, ...HlmCardImports],
  templateUrl: './quiz-edit.component.html',
})
export class QuizEditComponent extends QuizDetailBaseComponent {
  private readonly router = inject(Router);
  readonly isDraft = computed(() => (this.quiz()?.status ?? 'draft') === 'draft');
  readonly localQuestions = linkedSignal<EditableQuestion[]>(
    () =>
      (this._questionsResource.value() ?? []).map(q => ({
        id: q.id,
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
      })),
  );
  private readonly _deletedIds = signal<string[]>([]);
  readonly currentStep = signal<1 | 2>(1);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly canSave = computed(
    () => this.localQuestions().length > 0 && !this.isSaving() && this.isDraft(),
  );
  readonly optionIndices: readonly number[] = [0, 1, 2, 3];
  readonly metaForm = new FormGroup<MetaForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });
  readonly questionForm = new FormGroup<QuestionForm>({
    question: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
    }),
    option0: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option1: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option2: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option3: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    correctIndex: new FormControl<number>(0, { nonNullable: true }),
  });
  private readonly _syncEffect = effect(() => {
    const quiz = this._quizResource.value();
    if (quiz) {
      this.metaForm.patchValue({
        title: quiz.title,
        description: quiz.description ?? '',
      });
      if (quiz.status !== 'draft') {
        this.metaForm.disable();
      }
    }
  });
  protected isInvalidTouched(ctrl: AbstractControl): boolean {
    return ctrl.invalid && ctrl.touched;
  }
  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
  }
  protected nextStep(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      return;
    }
    this.currentStep.set(2);
  }
  protected previousStep(): void {
    this.currentStep.set(1);
    this.errorMessage.set('');
  }
  protected addQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const { question, option0, option1, option2, option3, correctIndex } =
      this.questionForm.getRawValue();
    this.localQuestions.update(prev => [
      ...prev,
      {
        question: question.trim(),
        options: [option0.trim(), option1.trim(), option2.trim(), option3.trim()],
        correctIndex,
      },
    ]);
    this.questionForm.reset({ correctIndex: 0 });
  }
  protected removeQuestion(index: number): void {
    const q = this.localQuestions()[index];
    const qId = q.id;
    if (qId) {
      this._deletedIds.update(ids => [...ids, qId]);
    }
    this.localQuestions.update(prev => prev.filter((_, i) => i !== index));
  }
  protected saveChanges(): void {
    if (!this.canSave()) return;
    this.isSaving.set(true);
    this.errorMessage.set('');
    const qId = this.quizId();
    const { title, description } = this.metaForm.getRawValue();
    (async () => {
      await this.quizService.updateQuiz(qId, {
        title: title.trim(),
        description: description.trim(),
      });
      for (const id of this._deletedIds()) {
        await this.quizService.deleteQuestion(qId, id);
      }
      for (const q of this.localQuestions()) {
        if (q.id) {
          await this.quizService.updateQuestion(qId, q.id, {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          });
        } else {
          await this.quizService.addQuestion(qId, {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          });
        }
      }
      this.isSaving.set(false);
      this.router.navigate(['/clubs', this.id(), 'quizzes']);
    })().catch(err => {
      this.isSaving.set(false);
      this.errorMessage.set((err as Error).message);
    });
  }
}
````

## File: src/app/features/quiz/quiz-list/quiz-list.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
  <div class="max-w-3xl mx-auto space-y-6">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">🧠 Quizzes</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Test your knowledge of the books you've read.
        </p>
      </div>
      <div class="flex items-center gap-3">
        @if (authService.isOrganizer()) {
          <a hlmBtn [routerLink]="['/clubs', id(), 'quizzes', 'create']"
             class="bg-gradient-brand text-white border-0 hover:opacity-90">
            + Create Quiz
          </a>
        }
        <nav aria-label="Breadcrumb">
          <a [routerLink]="['/clubs', id()]"
             class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
            ← Club
          </a>
        </nav>
      </div>
    </header>
    @if (quizService.isLoading()) {
      <div class="bento-grid-3">
        @for (_ of [1, 2, 3]; track $index) {
          <div class="h-28 glass-card-subtle animate-pulse"></div>
        }
      </div>
    } @else {
      @if (quizService.quizzes().length === 0) {
        <div class="glass-card p-12 text-center">
          <p class="text-4xl mb-3">📝</p>
          <h2 class="text-gray-700 dark:text-gray-300 font-semibold text-lg">No quizzes yet</h2>
          @if (authService.isOrganizer()) {
            <p class="text-gray-400 dark:text-gray-500 mt-1 text-sm">
              Create your first quiz to engage the club.
            </p>
          } @else {
            <p class="text-gray-400 dark:text-gray-500 mt-1 text-sm">
              The organizer hasn't created any quizzes yet.
            </p>
          }
        </div>
      } @else {
        <div class="bento-grid-3">
          @for (quiz of quizService.quizzes(); track quiz.id) {
            <div class="glass-card p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <h2 class="text-gray-900 dark:text-white font-semibold truncate">
                      {{ quiz.title }}
                    </h2>
                    @switch (quiz.status) {
                      @case ('live') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-700/60 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                          Live
                        </span>
                      }
                      @case ('active') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/60 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                          Active
                        </span>
                      }
                      @case ('closed') {
                        <span class="inline-flex rounded-full bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 px-2.5 py-0.5 text-xs text-gray-400 dark:text-gray-500">
                          Closed
                        </span>
                      }
                      @default {
                        <span class="inline-flex rounded-full bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 px-2.5 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                          Draft
                        </span>
                      }
                    }
                  </div>
                  @if (quiz.description) {
                    <p class="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                      {{ quiz.description }}
                    </p>
                  }
                </div>
              </div>
              <div class="flex items-center gap-2 mt-auto flex-wrap">
                @if (authService.isOrganizer()) {
                  <a hlmBtn size="sm" variant="outline"
                     [routerLink]="['/clubs', id(), 'quizzes', quiz.id, 'preview']">
                    {{ 'QUIZ.preview' | translate }}
                  </a>
                  @if (quiz.status === 'draft') {
                    <a hlmBtn size="sm" variant="ghost"
                       [routerLink]="['/clubs', id(), 'quizzes', quiz.id, 'edit']">
                      {{ 'QUIZ.edit' | translate }}
                    </a>
                  }
                  @if (quiz.status !== 'draft' && quiz.status !== 'closed') {
                    <a hlmBtn size="sm"
                       class="bg-gradient-brand text-white border-0 hover:opacity-90"
                       [routerLink]="['/clubs', id(), 'quizzes', quiz.id, 'session']">
                      {{ 'QUIZ.manage_session' | translate }}
                    </a>
                  }
                  @if (quiz.status === 'draft' || quiz.status === 'active') {
                    <button
                      hlmBtn
                      type="button"
                      size="sm"
                      [variant]="quiz.isActive ? 'secondary' : 'outline'"
                      (click)="toggleActive(quiz.id, !quiz.isActive)"
                      [disabled]="togglingId() === quiz.id"
                    >
                      {{ quiz.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  }
                } @else if (quiz.isActive || quiz.status === 'live' || quiz.status === 'active') {
                  <button
                    hlmBtn
                    type="button"
                    size="sm"
                    (click)="takeQuiz(quiz.id)"
                    class="w-full bg-gradient-brand text-white border-0 hover:opacity-90"
                  >
                    Take Quiz →
                  </button>
                }
                @if (quiz.status === 'live') {
                  <a hlmBtn size="sm" variant="outline"
                     [routerLink]="['/clubs', id(), 'quizzes', quiz.id, 'leaderboard']">
                    {{ 'QUIZ.leaderboard' | translate }}
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    }
    @if (errorMessage()) {
      <div class="glass-card px-4 py-3 text-red-700 dark:text-red-400 text-sm" role="alert">
        ⚠️ {{ errorMessage() }}
      </div>
    }
  </div>
</div>
````

## File: src/app/features/quiz/quiz-list/quiz-list.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { HlmButton } from '../../../shared/spartan/button/src';
@Component({
  selector: 'app-quiz-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, ...HlmCardImports, HlmButton],
  templateUrl: './quiz-list.component.html',
})
export class QuizListComponent {
  protected readonly quizService = inject(QuizService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly togglingId = signal<string | null>(null);
  protected readonly errorMessage = signal('');
  readonly id = input<string>('');
  private readonly _quizzesResource = resource({
    params: () => this.id(),
    loader: ({ params: clubId }) =>
      clubId ? this.quizService.loadQuizzes(clubId) : Promise.resolve(undefined),
  });
  readonly isLoading = computed(() => this._quizzesResource.isLoading());
  protected toggleActive(quizId: string, isActive: boolean): void {
    this.togglingId.set(quizId);
    this.errorMessage.set('');
    this.quizService
      .toggleActive(quizId, isActive)
      .then(() => this.togglingId.set(null))
      .catch(err => {
        this.togglingId.set(null);
        this.errorMessage.set((err as Error).message);
      });
  }
  protected takeQuiz(quizId: string): void {
    this.router.navigate(['/clubs', this.id(), 'quizzes', quizId]);
  }
}
````

## File: src/app/features/quiz/quiz-session/quiz-session.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
  <div class="max-w-3xl mx-auto space-y-6">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">🎮 Quiz Session</h1>
      <a [routerLink]="['/clubs', id(), 'quizzes']"
         class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
        ← Back to Quizzes
      </a>
    </header>
    @if (isLoadingSession()) {
      <div class="glass-card h-32 animate-pulse"></div>
    } @else {
      @if (!session()) {
        <div class="glass-card p-6 space-y-5">
          <h2 class="font-semibold text-gray-900 dark:text-white text-lg">Start a Session</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            Select an event — attendees will be enrolled as participants automatically.
          </p>
          <div class="space-y-2">
            <label for="event-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Event</label>
            <select
              id="event-select"
              class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              [value]="selectedEventId()"
              (change)="selectedEventId.set($any($event.target).value)"
            >
              <option value="" disabled selected>Select event…</option>
              @for (event of clubEvents(); track event.id) {
                <option [value]="event.id">
                  {{ event.title }} — {{ event.date | date:'mediumDate' }}
                </option>
              }
            </select>
            @if (clubEvents().length === 0) {
              <p class="text-xs text-yellow-600 dark:text-yellow-400">No events found for this club.</p>
            }
          </div>
          <button
            hlmBtn
            type="button"
            (click)="startSession()"
            [disabled]="!selectedEventId() || isStarting()"
            class="bg-gradient-brand text-white border-0 hover:opacity-90"
          >
            {{ isStarting() ? '⏳ Starting…' : '🚀 Start Session' }}
          </button>
        </div>
      }
      @if (session(); as s) {
        <div class="space-y-6">
          <div class="glass-card p-5 flex items-center gap-4 flex-wrap">
            <span class="inline-flex items-center gap-2 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-700/60 px-3 py-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
              <span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Live
            </span>
            <span class="text-gray-500 dark:text-gray-400 text-sm">
              Started {{ s.startedAt | date:'medium' }}
            </span>
            <span class="text-gray-700 dark:text-gray-300 text-sm font-medium">
              👥 {{ s.participantCount }} participants enrolled
            </span>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900 dark:text-white text-lg">🏆 Live Leaderboard</h2>
              <button
                hlmBtn
                type="button"
                variant="outline"
                size="sm"
                (click)="manualRefresh()"
                [disabled]="isLeaderboardLoading()"
              >
                {{ isLeaderboardLoading() ? '↻ Refreshing…' : '↻ Refresh' }}
              </button>
            </div>
            @if (leaderboard().length === 0 && !isLeaderboardLoading()) {
              <div class="glass-card p-8 text-center">
                <p class="text-2xl mb-2">⏳</p>
                <p class="text-gray-500 dark:text-gray-400 text-sm">No participants yet. Waiting for responses…</p>
              </div>
            } @else {
              <app-leaderboard-podium
                [first]="podiumFirst()"
                [second]="podiumSecond()"
                [third]="podiumThird()"
              />
              @if (rest().length > 0) {
                <app-leaderboard-rest-table [entries]="rest()" />
              }
            }
          </div>
          <div class="flex justify-end pt-2">
            <button
              hlmBtn
              type="button"
              (click)="endSession()"
              [disabled]="isEnding()"
              class="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {{ isEnding() ? '⏳ Ending…' : '🔴 End Session' }}
            </button>
          </div>
        </div>
      }
      @if (errorMessage()) {
        <div class="glass-card px-4 py-3 text-red-700 dark:text-red-400 text-sm" role="alert">
          ⚠️ {{ errorMessage() }}
        </div>
      }
    }
  </div>
</div>
````

## File: src/app/features/quiz/quiz-session/quiz-session.component.ts
````typescript
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { ClubEvent } from '../../../core/models/event.model';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { LeaderboardPodiumComponent } from '../quiz-leaderboard/leaderboard-podium/leaderboard-podium.component';
import { LeaderboardRestTableComponent } from '../quiz-leaderboard/leaderboard-rest-table/leaderboard-rest-table.component';
import { LeaderboardBaseComponent } from '../quiz-leaderboard/leaderboard-base.component';
@Component({
  selector: 'app-quiz-session',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ...HlmCardImports, HlmButton, LeaderboardPodiumComponent, LeaderboardRestTableComponent],
  templateUrl: './quiz-session.component.html',
})
export class QuizSessionComponent extends LeaderboardBaseComponent implements OnInit {
  private readonly router = inject(Router);
  readonly clubEvents = signal<ClubEvent[]>([]);
  readonly selectedEventId = signal('');
  readonly isStarting = signal(false);
  readonly isEnding = signal(false);
  readonly errorMessage = signal('');
  ngOnInit(): void {
    Promise.all([
      this.quizService
        .getActiveSession(this.quizId())
        .then(s => this.session.set(s)),
      this.quizService
        .loadClubEvents(this.id())
        .then(e => this.clubEvents.set(e))
        .catch(() => undefined),
    ]).finally(() => this.isLoadingSession.set(false));
    this.startPolling(15_000);
  }
  protected startSession(): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.isStarting.set(true);
    this.errorMessage.set('');
    this.quizService
      .startSession(this.quizId(), eventId)
      .then(s => {
        this.session.set(s);
        this.isStarting.set(false);
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.isStarting.set(false);
      });
  }
  protected endSession(): void {
    const s = this.session();
    if (!s) return;
    this.isEnding.set(true);
    this.errorMessage.set('');
    this.quizService
      .endSession(this.quizId(), s.id)
      .then(() => {
        this.isEnding.set(false);
        this.router.navigate(['/clubs', this.id(), 'quizzes']);
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.isEnding.set(false);
      });
  }
  protected manualRefresh(): void {
    this._refreshTick.update(n => n + 1);
  }
}
````

## File: src/app/shared/chat/chat-widget/chat-widget.component.html
````html
@if (auth.isAuthenticated()) {
  <button
    hlmBtn
    type="button"
    [class]="'fixed z-50 w-14 h-14 rounded-full bg-accent-500 text-white shadow-lg hover:shadow-xl ' + fabPositionClass()"
    [class.animate-bounce]="isBouncing()"
    [attr.aria-label]="(chat.isOpen() ? 'CHAT.close' : 'CHAT.open') | translate"
    (click)="chat.toggleOpen()"
  >
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
    @if (chat.unreadCount() > 0) {
      <div class="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
        {{ chat.unreadCount() > 9 ? '9+' : (chat.unreadCount() | number) }}
      </div>
    }
  </button>
  @if (chat.isOpen()) {
    <div
      [class]="'fixed z-40 w-80 max-h-[480px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 chat-panel ' + panelPositionClass()"
    >
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ 'CHAT.title' | translate }}
        </h2>
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          type="button"
          [attr.aria-label]="'CHAT.close' | translate"
          (click)="chat.toggleOpen()"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      </div>
      @if (chat.rooms().length > 1 || auth.isOrganizer()) {
        <div class="flex items-center border-b border-gray-100 dark:border-gray-700 px-3 py-2 gap-2">
          <div class="flex overflow-x-auto gap-2 flex-1 min-w-0">
            @for (room of chat.rooms(); track room.id) {
              <button
                class="px-3 py-1.5 rounded-lg whitespace-nowrap font-medium text-sm transition-colors duration-200 flex-shrink-0"
                [ngClass]="{
                  'bg-accent-500 text-white': chat.activeRoomId() === room.id,
                  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700': chat.activeRoomId() !== room.id
                }"
                role="tab"
                [attr.aria-selected]="chat.activeRoomId() === room.id"
                (click)="chat.openRoom(room.id)"
              >
                {{ room.name }}
              </button>
            }
          </div>
          @if (auth.isOrganizer()) {
            <button
              type="button"
              class="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-accent-100 hover:text-accent-600 flex items-center justify-center transition-colors text-lg leading-none"
              [attr.aria-label]="'CHAT.add_room' | translate"
              (click)="toggleCreateRoom()"
            >+</button>
          }
        </div>
      }
      @if (isCreatingRoom()) {
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <input
            hlmInput
            type="text"
            [ngModel]="newRoomName()"
            (ngModelChange)="newRoomName.set($event)"
            (keydown)="onRoomNameKeydown($event)"
            [placeholder]="'CHAT.room_name_placeholder' | translate"
            class="flex-1 text-sm rounded-lg h-8 px-3"
          />
          <button
            hlmBtn
            size="sm"
            type="button"
            class="bg-accent-500 text-white text-xs px-2 h-8"
            [disabled]="!newRoomName().trim()"
            (click)="submitCreateRoom()"
          >{{ 'CHAT.create_room' | translate }}</button>
        </div>
      }
      @if (chat.rooms().length === 0) {
        <div class="flex items-center justify-center flex-1 text-gray-400 dark:text-gray-500 text-sm px-4">
          {{ 'CHAT.no_rooms' | translate }}
        </div>
      } @else {
        <div
          class="flex-1 overflow-y-auto p-3 space-y-2 messages-scroll"
          role="log"
          aria-live="polite"
        >
          @if (chat.activeMessages().length === 0) {
            <div class="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              {{ 'CHAT.no_messages' | translate }}
            </div>
          } @else {
            @for (message of chat.activeMessages(); track message.id) {
              @if (!message.isMuted || auth.isOrganizer()) {
                <div
                  class="relative group"
                  [ngClass]="{ 'flex justify-end': message.isOwn, 'flex justify-start': !message.isOwn }"
                >
                  <div class="flex flex-col max-w-[75%]">
                    @if (!message.isOwn) {
                      <div class="flex items-center gap-1 px-3 mb-1">
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ message.senderName }}</span>
                        @if (message.isMuted) {
                          <span class="text-xs text-red-400 italic">{{ 'CHAT.muted_label' | translate }}</span>
                        }
                      </div>
                    }
                    <div
                      class="px-4 py-2 rounded-2xl transition-opacity"
                      [class.opacity-40]="message.isMuted"
                      [ngClass]="{
                        'bg-accent-500 text-white rounded-br-sm': message.isOwn,
                        'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm': !message.isOwn
                      }"
                    >
                      {{ message.text }}
                    </div>
                    <span class="text-xs text-gray-400 px-3 mt-1"
                          [class.text-right]="message.isOwn">
                      {{ message.timestamp | date: 'HH:mm' }}
                    </span>
                  </div>
                  @if (auth.isOrganizer() && !message.isOwn) {
                    <div class="relative self-center ml-1">
                      <button
                        type="button"
                        class="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        [attr.aria-label]="'moderation'"
                        (click)="toggleMenu(message.id)"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                      </button>
                      @if (openMenuId() === message.id) {
                        <div class="absolute left-full top-0 ml-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-[130px]">
                          @if (!message.isMuted) {
                            <button
                              type="button"
                              class="w-full text-left px-3 py-1.5 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              (click)="muteUser(message.senderId)"
                            >{{ 'CHAT.mute' | translate }}</button>
                          } @else {
                            <button
                              type="button"
                              class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              (click)="unmuteUser(message.senderId)"
                            >{{ 'CHAT.unmute' | translate }}</button>
                          }
                          <button
                            type="button"
                            class="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            (click)="banUser(message.senderId, 600)"
                          >{{ 'CHAT.ban_600s' | translate }}</button>
                          <div class="my-0.5 border-t border-gray-100 dark:border-gray-700"></div>
                          <button
                            type="button"
                            class="w-full text-left px-3 py-1.5 text-xs text-red-700 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                            (click)="deleteMessage(message.id)"
                          >{{ 'CHAT.delete_message' | translate }}</button>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            }
          }
          <div #messagesEnd></div>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700 p-3 flex gap-2">
          <input
            hlmInput
            type="text"
            [(ngModel)]="messageText"
            (keydown)="onKeydown($event)"
            [placeholder]="'CHAT.placeholder' | translate"
            [attr.aria-label]="'CHAT.placeholder' | translate"
            class="flex-1 rounded-full px-4"
          />
          <button
            hlmBtn
            type="button"
            class="w-10 h-10 rounded-full bg-accent-500 text-white"
            [disabled]="!messageText().trim()"
            (click)="sendMessage()"
            [attr.aria-label]="'CHAT.send' | translate"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16584166 C3.50612381,0.9087443 2.40999006,1.01484963 1.77946707,1.4861418 C0.994623095,2.11535496 0.837654326,3.20500913 1.15159189,3.9904961 L3.03521743,10.4314891 C3.03521743,10.5885864 3.19218622,10.7456838 3.50612381,10.7456838 L16.6915026,11.5311707 C16.6915026,11.5311707 17.1624089,11.5311707 17.1624089,12.0024628 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
            </svg>
          </button>
        </div>
      }
    </div>
  }
}
````

## File: src/app/shared/chat/chat-widget/chat-widget.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ClubService } from '../../../core/services/club.service';
import { HlmButton } from '../../spartan/button/src';
import { HlmInput } from '../../spartan/input/src';
@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, FormsModule, DatePipe, HlmButton, HlmInput],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  private readonly clubService = inject(ClubService);
  protected readonly messageText = signal('');
  protected readonly isBouncing = signal(false);
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly isCreatingRoom = signal(false);
  protected readonly newRoomName = signal('');
  protected readonly fabPositionClass = computed(() =>
    this.auth.isOrganizer() ? 'bottom-24 right-6' : 'bottom-6 right-6'
  );
  protected readonly panelPositionClass = computed(() =>
    this.auth.isOrganizer() ? 'bottom-40 right-6' : 'bottom-24 right-6'
  );
  private _clubsLoadTriggered = false;
  constructor() {
    effect(() => {
      if (this.chat.hasNewMessage()) {
        this.isBouncing.set(true);
        setTimeout(() => this.isBouncing.set(false), 1000);
      }
    });
    effect(() => {
      const user = this.auth.currentUser();
      if (!user) {
        this._clubsLoadTriggered = false;
        this.chat.clearRooms();
        return;
      }
      const clubs = this.clubService.myClubs();
      if (clubs.length > 0) {
        this._clubsLoadTriggered = false;
        this.chat.loadAllClubRooms(clubs, user.id);
      } else if (!this._clubsLoadTriggered) {
        this._clubsLoadTriggered = true;
        this.clubService.loadMyClubs().catch(() => undefined);
      }
    });
  }
  protected sendMessage(): void {
    const text = this.messageText().trim();
    if (!text) return;
    const user = this.auth.currentUser();
    if (!user) return;
    this.chat.sendMessage(text, { id: user.id, displayName: user.displayName });
    this.messageText.set('');
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  protected toggleMenu(msgId: string): void {
    this.openMenuId.update(id => (id === msgId ? null : msgId));
  }
  protected muteUser(userId: string): void {
    this.chat.muteUser(userId);
    this.openMenuId.set(null);
  }
  protected unmuteUser(userId: string): void {
    this.chat.unmuteUser(userId);
    this.openMenuId.set(null);
  }
  protected deleteMessage(messageId: string): void {
    this.chat.deleteMessage(messageId);
    this.openMenuId.set(null);
  }
  protected banUser(userId: string, durationSeconds: number): void {
    this.chat.banUserFromChat(userId, durationSeconds);
    this.openMenuId.set(null);
  }
  protected toggleCreateRoom(): void {
    this.isCreatingRoom.update(v => !v);
    this.newRoomName.set('');
  }
  protected submitCreateRoom(): void {
    const name = this.newRoomName().trim();
    const clubId = this.chat.activeRoom()?.clubId;
    if (!name || !clubId) return;
    this.chat.createRoom(clubId, name);
    this.newRoomName.set('');
    this.isCreatingRoom.set(false);
  }
  protected onRoomNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.submitCreateRoom(); }
    if (event.key === 'Escape') { this.isCreatingRoom.set(false); }
  }
}
````

## File: src/app/shared/spartan/tabs/src/lib/hlm-tabs-paginated-list.ts
````typescript
import { CdkObserveContent } from '@angular/cdk/observers';
import {
	ChangeDetectionStrategy,
	Component,
	type ElementRef,
	computed,
	contentChildren,
	input,
	viewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { type BrnPaginatedTabHeaderItem, BrnTabsPaginatedList, BrnTabsTrigger } from '@spartan-ng/brain/tabs';
import { buttonVariants } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { classes, hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
import type { Observable } from 'rxjs';
import { listVariants } from './hlm-tabs-list';
@Component({
	selector: 'hlm-paginated-tabs-list',
	imports: [CdkObserveContent, NgIcon, HlmIcon],
	providers: [provideIcons({ lucideChevronRight, lucideChevronLeft })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'tabs-paginated-list',
	},
	template: `
		<button
			#previousPaginator
			data-pagination="previous"
			type="button"
			aria-hidden="true"
			tabindex="-1"
			[class.flex]="showPaginationControls()"
			[class.hidden]="!showPaginationControls()"
			[class]="_paginationButtonClass()"
			[disabled]="disableScrollBefore || null"
			(click)="_handlePaginatorClick('before')"
			(mousedown)="_handlePaginatorPress('before', $event)"
			(touchend)="_stopInterval()"
		>
			<ng-icon hlm size="base" name="lucideChevronLeft" />
		</button>
		<div #tabListContainer class="z-[1] flex grow overflow-hidden" tabindex="0" (keydown)="_handleKeydown($event)">
			<div class="relative grow transition-transform" #tabList role="tablist" (cdkObserveContent)="_onContentChanges()">
				<div #tabListInner [class]="_tabListClass()">
					<ng-content />
				</div>
			</div>
		</div>
		<button
			#nextPaginator
			data-pagination="next"
			type="button"
			aria-hidden="true"
			tabindex="-1"
			[class.flex]="showPaginationControls()"
			[class.hidden]="!showPaginationControls()"
			[class]="_paginationButtonClass()"
			[disabled]="disableScrollAfter || null"
			(click)="_handlePaginatorClick('after')"
			(mousedown)="_handlePaginatorPress('after', $event)"
			(touchend)="_stopInterval()"
		>
			<ng-icon hlm size="base" name="lucideChevronRight" />
		</button>
	`,
})
export class HlmTabsPaginatedList extends BrnTabsPaginatedList {
	constructor() {
		super();
		classes(() => 'relative flex flex-shrink-0 gap-1 overflow-hidden');
	}
	public readonly items = contentChildren(BrnTabsTrigger, { descendants: false });
	public readonly itemsChanges: Observable<ReadonlyArray<BrnPaginatedTabHeaderItem>> = toObservable(this.items);
	public readonly tabListContainer = viewChild.required<ElementRef<HTMLElement>>('tabListContainer');
	public readonly tabList = viewChild.required<ElementRef<HTMLElement>>('tabList');
	public readonly tabListInner = viewChild.required<ElementRef<HTMLElement>>('tabListInner');
	public readonly nextPaginator = viewChild.required<ElementRef<HTMLElement>>('nextPaginator');
	public readonly previousPaginator = viewChild.required<ElementRef<HTMLElement>>('previousPaginator');
	public readonly tabListClass = input<ClassValue>('', { alias: 'tabListClass' });
	protected readonly _tabListClass = computed(() => hlm(listVariants(), this.tabListClass()));
	public readonly paginationButtonClass = input<ClassValue>('', { alias: 'paginationButtonClass' });
	protected readonly _paginationButtonClass = computed(() =>
		hlm(
			'relative z-[2] select-none disabled:cursor-default',
			buttonVariants({ variant: 'ghost', size: 'icon' }),
			this.paginationButtonClass(),
		),
	);
	protected _itemSelected(event: KeyboardEvent) {
		event.preventDefault();
	}
}
````

## File: angular.json
````json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "book-club-fe": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "allowedCommonJsDependencies": [
              "qrcode"
            ],
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": [
              "src/styles.css"
            ]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "4kB",
                  "maximumError": "8kB"
                }
              ],
              "outputHashing": "all",
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "book-club-fe:build:production"
            },
            "development": {
              "buildTarget": "book-club-fe:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular/build:extract-i18n"
        },
        "test": {
          "builder": "@angular/build:karma",
          "options": {
            "karmaConfig": "karma.conf.js",
            "codeCoverageExclude": ["src/app/shared/spartan/**"],
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": [
              "src/styles.css"
            ]
          }
        },
        "lint": {
          "builder": "@angular-eslint/builder:lint",
          "options": {
            "lintFilePatterns": [
              "src/**/*.ts",
              "src/**/*.html"
            ]
          }
        }
      }
    }
  },
  "cli": {
    "schematicCollections": [
      "angular-eslint"
    ],
    "analytics": "8ad34ae9-0dc3-4f68-98df-e83bac937e51"
  }
}
````

## File: src/app/core/auth/auth.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { ApiUserProfile, ApiUserStats, mapUserProfile, mapUserStats } from '../api/api-mappers';
import { TokenStore } from './token.store';
import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUserProfile;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStore = inject(TokenStore);
  private readonly _currentUser = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isOrganizer = computed(() => this._currentUser()?.role === 'organizer');
  private readonly _statsResource = rxResource<UserStats | null, string | null>({
    params: () => this._currentUser()?.id ?? null,
    stream: ({ params: userId }) => {
      if (!userId) return of(null as UserStats | null);
      return this.http.get<ApiUserStats>(`${environment.apiUrl}/users/me/stats`).pipe(
        map(raw => mapUserStats(raw)),
        catchError(() => of(null)),
      );
    },
  });
  readonly userStats = computed<UserStats | null>(() => this._statsResource.value() ?? null);
  constructor() {
    const token = this.tokenStore.snapshot();
    if (token) {
      firstValueFrom(
        this.http.get<ApiUserProfile>(`${environment.apiUrl}/auth/me`).pipe(
          catchError(() => {
            this.tokenStore.clear();
            return of(null);
          }),
        ),
      ).then(raw => {
        this._currentUser.set(raw ? mapUserProfile(raw) : null);
        this._isLoading.set(false);
      });
    } else {
      this._isLoading.set(false);
    }
  }
  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ): Promise<{ error: string | null }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
          email,
          password,
          displayName,
          role,
        }),
      );
      this.tokenStore.set(resp.accessToken);
      this.tokenStore.setRefresh(resp.refreshToken);
      this._currentUser.set(mapUserProfile(resp.user));
      return { error: null };
    } catch (err) {
      return { error: extractApiError(err) };
    }
  }
  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }),
      );
      this.tokenStore.set(resp.accessToken);
      this.tokenStore.setRefresh(resp.refreshToken);
      this._currentUser.set(mapUserProfile(resp.user));
      return { error: null };
    } catch (err) {
      return { error: extractApiError(err) };
    }
  }
  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
    } catch {  }
    this.tokenStore.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
  async updateRole(role: UserRole): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me/role`, { role }),
    );
    this._currentUser.set({ ...user, role });
  }
  async updateDisplayName(name: string): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me`, { displayName: name }),
    );
    this._currentUser.set({ ...user, displayName: name });
  }
  async updateSocials(socials: UserSocials): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me/socials`, socials),
    );
    this._currentUser.set({ ...user, socials });
  }
  async setSocialsPublic(value: boolean): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me/socials-visibility`, {
        socialsPublic: value,
      }),
    );
    this._currentUser.set({ ...user, socialsPublic: value });
  }
}
````

## File: src/app/core/models/event.model.ts
````typescript
export type EventStatus = 'scheduled' | 'active' | 'held' | 'cancelled' | 'rescheduled' | 'upcoming';
export interface AfterMeetingVenue {
  name: string;
  address: string;
  description?: string;
  lat?: number;
  lng?: number;
}
export interface ClubEvent {
  id: string;
  clubId: string;
  clubName: string;
  organizerId: string;
  title: string;
  description: string | null;
  date: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: EventStatus;
  cancelledAt?: string;
  coverUrl: string | null;
  theme: string | null;
  tags: string[];
  durationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  attendeeCount: number;
  isAttending: boolean;
  bookTitle?: string | null;
  quizId?: string | null;
}
````

## File: src/app/features/auth/register/register.component.html
````html
<div class="auth-page-wrapper">
  <app-book-intro [open]="bookOpen()" (animationDone)="onBookAnimationDone()" />
  <main class="auth-form-container">
    @if (formVisible()) {
      <div class="w-full max-w-md animate-form-in">
        <div class="text-center mb-8">
          <h1 class="font-display text-3xl font-bold text-white drop-shadow-sm">📚 Book Club</h1>
          <p class="text-white/70 mt-2">{{ 'AUTH.create_account_subtitle' | translate }}</p>
        </div>
        @if (successMessage()) {
          <div class="glass-card-strong p-8 text-center">
            <div class="text-5xl mb-4">🎉</div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ 'AUTH.account_created' | translate }}</h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              {{ 'AUTH.welcome_message' | translate }} <strong>{{ registeredEmail() }}</strong>.
            </p>
            <a routerLink="/login"
               class="mt-6 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
              {{ 'AUTH.back_to_login' | translate }}
            </a>
          </div>
        } @else {
          <div class="glass-card-strong p-8">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ 'AUTH.create_account_h2' | translate }}</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
              <fieldset class="border-0 p-0 m-0">
                <legend class="sr-only">{{ 'AUTH.create_account_h2' | translate }}</legend>
                <hlm-field>
                  <label hlmFieldLabel for="reg-display-name">{{ 'AUTH.display_name' | translate }}</label>
                  <input hlmInput id="reg-display-name" type="text" placeholder="Ada Lovelace" [formControl]="form.controls.displayName" />
                  <hlm-field-error validator="required">{{ 'FORM_ERRORS.required' | translate }}</hlm-field-error>
                  <hlm-field-error validator="minlength">{{ 'FORM_ERRORS.minlength' | translate: {requiredLength: 2} }}</hlm-field-error>
                </hlm-field>
                <hlm-field>
                  <label hlmFieldLabel for="reg-email">{{ 'AUTH.email' | translate }}</label>
                  <input hlmInput id="reg-email" type="email" placeholder="you@example.com" [formControl]="form.controls.email" />
                  <hlm-field-error validator="required">{{ 'FORM_ERRORS.required' | translate }}</hlm-field-error>
                  <hlm-field-error validator="email">{{ 'FORM_ERRORS.email' | translate }}</hlm-field-error>
                </hlm-field>
                <hlm-field>
                  <label hlmFieldLabel for="reg-password">{{ 'AUTH.password' | translate }}</label>
                  <input hlmInput id="reg-password" type="password" placeholder="••••••••" [formControl]="form.controls.password" />
                  <hlm-field-error validator="required">{{ 'FORM_ERRORS.required' | translate }}</hlm-field-error>
                  <hlm-field-error validator="minlength">{{ 'FORM_ERRORS.minlength' | translate: {requiredLength: 8} }}</hlm-field-error>
                </hlm-field>
                @if (passwordStrength()) {
                  <div class="flex items-center gap-2 -mt-2">
                    <div class="flex gap-1 flex-1">
                      <div class="h-1 flex-1 rounded-full transition-colors"
                           [class]="passwordStrength() !== null ? 'bg-red-400' : 'bg-gray-200'"></div>
                      <div class="h-1 flex-1 rounded-full transition-colors"
                           [class]="passwordStrength() === 'medium' || passwordStrength() === 'strong' ? 'bg-yellow-400' : 'bg-gray-200'"></div>
                      <div class="h-1 flex-1 rounded-full transition-colors"
                           [class]="passwordStrength() === 'strong' ? 'bg-green-500' : 'bg-gray-200'"></div>
                    </div>
                    <span class="text-xs font-medium"
                          [class]="passwordStrength() === 'strong' ? 'text-green-600' :
                                   passwordStrength() === 'medium' ? 'text-yellow-600' : 'text-red-500'">
                      {{ passwordStrength() === 'strong' ? ('AUTH.password_strong' | translate) :
                         passwordStrength() === 'medium' ? ('AUTH.password_medium' | translate) :
                         ('AUTH.password_weak' | translate) }}
                    </span>
                  </div>
                }
                <hlm-field>
                  <label hlmFieldLabel for="reg-confirm-password">{{ 'AUTH.confirm_password' | translate }}</label>
                  <input hlmInput id="reg-confirm-password" type="password" placeholder="••••••••" [formControl]="form.controls.confirmPassword" />
                  <hlm-field-error validator="required">{{ 'FORM_ERRORS.required' | translate }}</hlm-field-error>
                </hlm-field>
                @if (form.hasError('passwordMismatch') && form.controls.confirmPassword.touched) {
                  <p class="text-xs text-red-500 -mt-3">{{ 'AUTH.passwords_no_match' | translate }}</p>
                }
                <fieldset class="border-0 p-0 m-0">
                  <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">{{ 'AUTH.want_to' | translate }}</legend>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      (click)="setRole('user')"
                      [attr.aria-pressed]="selectedRole() === 'user'"
                      class="p-4 rounded-[var(--bento-radius)] border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      [class]="selectedRole() === 'user'
                        ? 'glass-card-subtle border-primary-400 ring-2 ring-primary-400/50'
                        : 'glass-card-subtle border-white/20 hover:border-primary-300'"
                    >
                      <div class="text-2xl mb-1">📖</div>
                      <div class="font-medium text-sm text-gray-900 dark:text-white">{{ 'AUTH.role_reader_label' | translate }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ 'AUTH.role_reader_desc' | translate }}</div>
                    </button>
                    <button
                      type="button"
                      (click)="setRole('organizer')"
                      [attr.aria-pressed]="selectedRole() === 'organizer'"
                      class="p-4 rounded-[var(--bento-radius)] border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      [class]="selectedRole() === 'organizer'
                        ? 'glass-card-subtle border-accent-400 ring-2 ring-accent-400/50'
                        : 'glass-card-subtle border-white/20 hover:border-accent-300'"
                    >
                      <div class="text-2xl mb-1">🎯</div>
                      <div class="font-medium text-sm text-gray-900 dark:text-white">{{ 'AUTH.role_organizer_label' | translate }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ 'AUTH.role_organizer_desc' | translate }}</div>
                    </button>
                  </div>
                  @if (form.controls.role.invalid && form.controls.role.touched) {
                    <p class="text-xs text-red-500 mt-0.5">{{ 'AUTH.select_role_error' | translate }}</p>
                  }
                </fieldset>
                @if (errorMessage()) {
                  <div class="flex items-start gap-2 glass-card-subtle px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
                    <span class="mt-0.5 shrink-0">⚠️</span>
                    <span>{{ errorMessage() }}</span>
                  </div>
                }
                <button
                  hlmBtn
                  type="submit"
                  [disabled]="isSubmitting()"
                  class="mt-2 w-full bg-gradient-brand text-white border-0 hover:opacity-90 focus-visible:ring-primary-500"
                >
                  @if (isSubmitting()) {
                    <hlm-spinner aria-label="Loading" />
                    {{ 'AUTH.creating_account' | translate }}
                  } @else {
                    {{ 'AUTH.create_account_h2' | translate }}
                  }
                </button>
              </fieldset>
            </form>
            <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {{ 'AUTH.have_account' | translate }}
              <a routerLink="/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                {{ 'AUTH.sign_in_h2' | translate }}
              </a>
            </p>
          </div>
        }
        <p class="mt-6 text-center text-sm">
          <a
            routerLink="/"
            class="inline-flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            {{ 'NAV.back_home' | translate }}
          </a>
        </p>
      </div>
    }
  </main>
</div>
````

## File: src/app/features/clubs/club-detail/header/club-header.component.html
````html
<header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
  <div>
    <div class="flex items-center gap-3 flex-wrap">
@if (!club().isPublic) {
        <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          🔒 {{ 'CLUB_DETAIL.private' | translate }}
        </span>
      }
    </div>
  </div>
  @if (isAuthenticated()) {
    @if (!isOwner()) {
      @if (isMember()) {
        <button
          hlmBtn
          variant="outline"
          type="button"
          (click)="leave.emit()"
          [disabled]="isActionLoading()"
          [attr.aria-label]="'CLUB_DETAIL.leave' | translate"
        >
          @if (isActionLoading()) {
            <app-loading-spinner size="sm" />
          }
          {{ 'CLUB_DETAIL.leave' | translate }}
        </button>
      }
    }
  }
</header>
````

## File: src/app/features/clubs/club-detail/manage-panel/club-manage-panel.component.html
````html
<div hlmCard class="glass-card-subtle p-4 gap-3">
  <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{{ 'CLUB_DETAIL.manage_title' | translate }}</h2>
  <div class="grid grid-cols-1 gap-2">
    <a
      [routerLink]="['/clubs', clubId(), 'quizzes']"
      class="flex items-center gap-3 rounded-xl border border-white/20 dark:border-white/10 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
    >
      <span class="text-xl" aria-hidden="true">📝</span>
      <div>
        <p class="font-semibold">{{ 'CLUB_DETAIL.quizzes_title' | translate }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'CLUB_DETAIL.quizzes_desc' | translate }}</p>
      </div>
    </a>
    <a
      [routerLink]="['/clubs', clubId(), 'randomizer']"
      class="flex items-center gap-3 rounded-xl border border-white/20 dark:border-white/10 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
    >
      <span class="text-xl" aria-hidden="true">🎲</span>
      <div>
        <p class="font-semibold">{{ 'CLUB_DETAIL.randomizer_title' | translate }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'CLUB_DETAIL.randomizer_desc' | translate }}</p>
      </div>
    </a>
    <a
      [routerLink]="['/clubs', clubId(), 'edit']"
      class="flex items-center gap-3 rounded-xl border border-white/20 dark:border-white/10 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
    >
      <span class="text-xl" aria-hidden="true">✏️</span>
      <div>
        <p class="font-semibold">{{ 'CLUB_DETAIL.edit_club_title' | translate }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'CLUB_DETAIL.edit_club_desc' | translate }}</p>
      </div>
    </a>
    <a
      [routerLink]="['/clubs', clubId(), 'events', 'create']"
      class="flex items-center gap-3 rounded-xl border border-white/20 dark:border-white/10 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
    >
      <span class="text-xl" aria-hidden="true">📅</span>
      <div>
        <p class="font-semibold">{{ 'CLUB_DETAIL.create_event_title' | translate }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'CLUB_DETAIL.create_event_desc' | translate }}</p>
      </div>
    </a>
  </div>
</div>
````

## File: src/app/features/clubs/edit-club/edit-club.component.html
````html
<main class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-lg">
    <header class="text-center mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">📚 BookClub</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">{{ 'EDIT_CLUB.subtitle' | translate }}</p>
    </header>
    <article class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ 'EDIT_CLUB.title' | translate }}</h2>
      @if (isLoadingClub()) {
        <div class="flex justify-center py-12">
          <hlm-spinner />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
          <hlm-field>
            <label hlmFieldLabel for="club-name">
              {{ 'EDIT_CLUB.name_label' | translate }}
              <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              hlmInput
              id="club-name"
              type="text"
              formControlName="name"
              class="w-full"
              [placeholder]="'EDIT_CLUB.name_placeholder' | translate"
            />
            <hlm-field-error validator="required">{{ 'EDIT_CLUB.name_required' | translate }}</hlm-field-error>
            <hlm-field-error validator="minlength">{{ 'EDIT_CLUB.name_min' | translate }}</hlm-field-error>
            <hlm-field-error validator="maxlength">{{ 'EDIT_CLUB.name_max' | translate }}</hlm-field-error>
          </hlm-field>
          <hlm-field>
            <label hlmFieldLabel for="club-description">{{ 'EDIT_CLUB.description_label' | translate }}</label>
            <textarea
              hlmInput
              id="club-description"
              formControlName="description"
              rows="3"
              class="w-full resize-none"
              [placeholder]="'EDIT_CLUB.description_placeholder' | translate"
            ></textarea>
            <hlm-field-error validator="maxlength">{{ 'EDIT_CLUB.description_max' | translate }}</hlm-field-error>
          </hlm-field>
          <hlm-field>
            <label hlmFieldLabel for="club-city">{{ 'EDIT_CLUB.city_label' | translate }}</label>
            <input
              hlmInput
              id="club-city"
              type="text"
              formControlName="city"
              class="w-full"
              [placeholder]="'EDIT_CLUB.city_placeholder' | translate"
            />
          </hlm-field>
          <div>
            <p class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ 'EDIT_CLUB.cover_url_label' | translate }}
            </p>
            <app-cover-upload [control]="form.controls.coverUrl" />
          </div>
          <fieldset>
            <legend class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ 'EDIT_CLUB.visibility_legend' | translate }}</legend>
            <div class="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'EDIT_CLUB.public_label' | translate }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ 'EDIT_CLUB.public_desc' | translate }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="form.controls.isPublic.value"
                (click)="togglePublic()"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                [class.bg-primary-600]="form.controls.isPublic.value"
                [class.bg-gray-300]="!form.controls.isPublic.value"
                [class.dark:bg-gray-600]="!form.controls.isPublic.value"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                  [class.translate-x-6]="form.controls.isPublic.value"
                  [class.translate-x-1]="!form.controls.isPublic.value"
                ></span>
              </button>
            </div>
          </fieldset>
          @if (errorMessage()) {
            <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
                 role="alert">
              <span class="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
              <span>{{ errorMessage() }}</span>
            </div>
          }
          <div class="flex gap-3 pt-2">
            <button hlmBtn type="button" variant="outline" (click)="cancel()" class="flex-1">
              {{ 'EDIT_CLUB.cancel' | translate }}
            </button>
            <button hlmBtn type="submit" [disabled]="isSubmitting()"
                    class="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
              @if (isSubmitting()) {
                <hlm-spinner class="mr-2" />
                {{ 'EDIT_CLUB.submitting' | translate }}
              } @else {
                {{ 'EDIT_CLUB.submit' | translate }}
              }
            </button>
          </div>
        </form>
      }
    </article>
  </div>
</main>
````

## File: src/app/features/clubs/edit-club/edit-club.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ClubService } from '../../../core/services/club.service';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
interface EditClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  coverUrl: FormControl<string>;
}
@Component({
  selector: 'app-edit-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, CoverUploadComponent, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './edit-club.component.html',
})
export class EditClubComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly _isLoadingClub = signal(true);
  readonly isLoadingClub = this._isLoadingClub.asReadonly();
  private readonly _isSubmitting = signal(false);
  readonly isSubmitting = this._isSubmitting.asReadonly();
  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly form = new FormGroup<EditClubForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    coverUrl: new FormControl('', { nonNullable: true }),
  });
  async ngOnInit(): Promise<void> {
    const club = await this.clubService.getClubById(this.id());
    if (!club) {
      this._errorMessage.set('Club not found.');
      this._isLoadingClub.set(false);
      return;
    }
    this.form.patchValue({
      name: club.name,
      description: club.description ?? '',
      isPublic: club.isPublic,
      city: club.city ?? '',
      coverUrl: club.coverUrl ?? '',
    });
    this._isLoadingClub.set(false);
  }
  togglePublic(): void {
    this.form.controls.isPublic.setValue(!this.form.controls.isPublic.value);
  }
  cancel(): void {
    this.router.navigate(['/clubs', this.id()]);
  }
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this._isSubmitting.set(true);
    this._errorMessage.set(null);
    const { name, description, isPublic, city, coverUrl } = this.form.getRawValue();
    try {
      await this.clubService.updateClub(this.id(), {
        name,
        description,
        isPublic,
        city: city || undefined,
        coverUrl: coverUrl || null,
      });
      toast.success(this.translate.instant('EDIT_CLUB.success'));
      this.router.navigate(['/clubs', this.id()]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to update club');
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
````

## File: src/app/features/events/event-card/event-card.component.html
````html
<article class="parchment-card flex flex-col overflow-hidden h-full
                hover:shadow-[var(--shadow-parchment-lg)] transition-shadow duration-200">
  <div class="flex flex-col flex-1 p-4 gap-3">
    <div class="flex items-start justify-between gap-2">
      <span class="date-badge">
        {{ event().date | formatDate }}
      </span>
      @if (event().status !== 'scheduled') {
        <span hlmBadge
              [variant]="event().status === 'cancelled' ? 'destructive'
                       : event().status === 'active' ? 'default' : 'secondary'"
              class="rounded-full text-xs flex-shrink-0">
          {{ event().status }}
        </span>
      }
    </div>
    <h3 class="font-display font-semibold text-[var(--color-ink)] leading-snug line-clamp-2">
      {{ event().title }}
    </h3>
    <a
      [routerLink]="['/clubs', event().clubId]"
      class="text-xs text-[var(--color-primary-600)] dark:text-[#fbbf24] hover:underline font-medium"
      (click)="$event.stopPropagation()"
    >
      {{ event().clubName }}
    </a>
    @if (event().city) {
      <p class="text-xs text-[var(--color-ink-muted)] flex items-center gap-1">
        <span aria-hidden="true">📍</span>
        <span>{{ event().address || event().city }}</span>
      </p>
    }
    @if (event().theme || event().tags.length > 0) {
      <div class="flex flex-wrap gap-1.5">
        @if (event().theme) {
          <span class="rounded-full
                       bg-[var(--color-accent-100)]/80 dark:bg-[var(--color-accent-900)]/40
                       border border-[var(--color-accent-300)] dark:border-[var(--color-accent-700)]/60
                       px-2.5 py-0.5 text-xs font-medium
                       text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)]">
            {{ event().theme }}
          </span>
        }
        @for (tag of event().tags.slice(0, 2); track tag) {
          <span class="rounded-full
                       bg-[var(--color-surface-raised)]
                       border border-[var(--color-sepia-mid)]
                       px-2.5 py-0.5 text-xs text-[var(--color-ink-muted)]">
            {{ tag }}
          </span>
        }
      </div>
    }
    <div class="flex items-center justify-between mt-auto pt-2
                border-t border-[var(--color-sepia-mid)]">
      <span class="text-xs text-[var(--color-ink-muted)]">
        {{ event().attendeeCount }} attending
      </span>
      <div class="flex gap-2">
        <a hlmBtn variant="outline" size="sm" [routerLink]="['/events', event().id]">
          View
        </a>
        @if (isAuthenticated() && event().status !== 'cancelled') {
          @if (event().isAttending) {
            <button hlmBtn type="button" size="sm" [disabled]="attending()"
                    (click)="cancelAttend.emit()"
                    class="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white">
              @if (attending()) { <hlm-spinner size="xs" /> } @else { ✓ Going }
            </button>
          } @else {
            <button hlmBtn type="button" size="sm" [disabled]="attending()"
                    (click)="attend.emit()"
                    class="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white">
              @if (attending()) { <hlm-spinner size="xs" /> } @else { RSVP }
            </button>
          }
        }
      </div>
    </div>
  </div>
</article>
````

## File: src/app/features/events/events-feed/events-feed.component.html
````html
<div class="min-h-screen">
  <section class="parchment-hero px-4 py-14 text-center">
    <div class="relative z-10">
      <h1 class="font-fantasy text-4xl font-bold tracking-widest uppercase
                 text-[var(--color-ink)] mb-2 drop-shadow-sm">
        {{ 'NAV.events' | translate }}
      </h1>
      <p class="text-[var(--color-ink-muted)] font-display text-lg mb-8">
        Discover and join upcoming book club gatherings
      </p>
      @if (eventService.availableCities().length > 0) {
        <div class="mx-auto max-w-sm">
          <select
            [ngModel]="eventService.cityFilter()"
            (ngModelChange)="eventService.setCityFilter($event || null)"
            class="w-full parchment-input rounded-full px-4 py-2.5 text-sm appearance-none cursor-pointer"
          >
            <option value="">All cities</option>
            @for (city of eventService.availableCities(); track city) {
              <option [value]="city">{{ city }}</option>
            }
          </select>
        </div>
      }
    </div>
  </section>
  <div class="page-container py-8 space-y-8">
    @if (eventService.error()) {
      <div class="flex items-start gap-2 parchment-card px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
        <span aria-hidden="true">⚠️</span>
        <span>{{ eventService.error() }}</span>
      </div>
    }
    @if (auth.isAuthenticated()) {
      <div class="flex justify-center" role="tablist" aria-label="Event filter">
        <div class="relative flex rounded-full p-1
                    bg-[var(--color-surface-sunken)]
                    border border-[var(--color-sepia)]
                    shadow-inner">
          <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full
                      bg-[var(--color-surface-raised)]
                      shadow-[var(--shadow-parchment)]
                      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
               [style.left]="activeTab() === 'upcoming' ? '4px' : '50%'"
               aria-hidden="true">
          </div>
          <button
            role="tab"
            type="button"
            [attr.aria-selected]="activeTab() === 'upcoming'"
            (click)="activeTab.set('upcoming')"
            class="relative z-10 px-7 py-2 rounded-full text-sm font-medium
                   transition-colors duration-300 select-none focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1"
            [class]="activeTab() === 'upcoming'
              ? 'text-[var(--color-primary-700)] dark:text-[#fbbf24] font-semibold'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'"
          >
            Upcoming
          </button>
          <button
            role="tab"
            type="button"
            [attr.aria-selected]="activeTab() === 'my'"
            (click)="activeTab.set('my')"
            class="relative z-10 flex items-center gap-1.5 px-7 py-2 rounded-full text-sm font-medium
                   transition-colors duration-300 select-none focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1"
            [class]="activeTab() === 'my'
              ? 'text-[var(--color-primary-700)] dark:text-[#fbbf24] font-semibold'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'"
          >
            My Events
            @if (eventService.myEvents().length > 0) {
              <span class="inline-flex items-center justify-center
                           h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold leading-none
                           transition-colors duration-300"
                    [class]="activeTab() === 'my'
                      ? 'bg-[var(--color-primary-600)] text-white'
                      : 'bg-[var(--color-ink-muted)]/20 text-[var(--color-ink-muted)]'">
                {{ eventService.myEvents().length }}
              </span>
            }
          </button>
        </div>
      </div>
      @if (activeTab() === 'upcoming') {
        <div class="pt-6" role="tabpanel">
          @if (eventService.isLoading()) {
            <div class="py-16 flex justify-center" aria-busy="true">
              <hlm-spinner />
            </div>
          } @else if (sortedDates().length === 0) {
            <app-empty-state
              icon="📅"
              title="No upcoming events"
              description="No events are scheduled yet. Check back soon!"
            />
          } @else {
            @for (date of sortedDates(); track date) {
              <section [attr.aria-labelledby]="'date-' + date" class="mb-10">
                <div class="date-section-divider mb-5" aria-hidden="true">
                  <h2
                    [id]="'date-' + date"
                    class="date-badge font-fantasy tracking-wider uppercase"
                  >
                    ✦ {{ date }} ✦
                  </h2>
                </div>
                <ul class="bento-grid-3">
                  @for (event of eventService.groupedByDate()[date]; track event.id) {
                    <li>
                      <app-event-card
                        [event]="event"
                        [isAuthenticated]="auth.isAuthenticated()"
                        [attending]="attendingEventId() === event.id"
                        (attend)="onAttend(event)"
                        (cancelAttend)="onCancelAttend(event)"
                      />
                    </li>
                  }
                </ul>
              </section>
            }
          }
        </div>
      }
      @if (activeTab() === 'my') {
        <div class="pt-6" role="tabpanel">
          @if (eventService.isLoading()) {
            <div class="py-16 flex justify-center" aria-busy="true">
              <hlm-spinner />
            </div>
          } @else if (eventService.myEvents().length === 0) {
            <app-empty-state
              icon="📅"
              title="No upcoming events"
              description="Join clubs to see their events here."
            />
          } @else {
            <ul class="bento-grid-3">
              @for (event of eventService.myEvents(); track event.id) {
                <li>
                  <app-event-card
                    [event]="event"
                    [isAuthenticated]="auth.isAuthenticated()"
                    [attending]="attendingEventId() === event.id"
                    (attend)="onAttend(event)"
                    (cancelAttend)="onCancelAttend(event)"
                  />
                </li>
              }
            </ul>
          }
        </div>
      }
    } @else {
      @if (eventService.isLoading()) {
        <div class="py-16 flex justify-center" aria-busy="true">
          <hlm-spinner />
        </div>
      } @else if (sortedDates().length === 0) {
        <app-empty-state
          icon="📅"
          title="No upcoming events"
          description="No events are scheduled yet. Check back soon!"
        />
      } @else {
        @for (date of sortedDates(); track date) {
          <section [attr.aria-labelledby]="'date-' + date" class="mb-10">
            <div class="date-section-divider mb-5" aria-hidden="true">
              <h2
                [id]="'date-' + date"
                class="date-badge font-fantasy tracking-wider uppercase"
              >
                ✦ {{ date }} ✦
              </h2>
            </div>
            <ul class="bento-grid-3">
              @for (event of eventService.groupedByDate()[date]; track event.id) {
                <li>
                  <app-event-card
                    [event]="event"
                    [isAuthenticated]="false"
                    [attending]="false"
                    (attend)="onAttend(event)"
                    (cancelAttend)="onCancelAttend(event)"
                  />
                </li>
              }
            </ul>
          </section>
        }
      }
    }
  </div>
</div>
````

## File: src/app/features/quiz/quiz-create/quiz-create.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
  <div class="max-w-2xl mx-auto space-y-6">
    <header class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900 dark:text-white">
          📝 Create Quiz
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Step {{ currentStep() }} of 2 —
          {{ currentStep() === 1 ? 'Quiz details' : 'Add questions' }}
        </p>
      </div>
      <a [routerLink]="['..']" class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
        ✕ Cancel
      </a>
    </header>
    <div class="flex items-center gap-0">
      @for (step of [1, 2]; track step) {
        <div
          class="flex-1 h-1.5 rounded-full transition-all duration-300"
          [class.bg-primary-500]="currentStep() >= step"
          [class.bg-gray-200]="currentStep() < step"
          [class.dark:bg-gray-700]="currentStep() < step"
        ></div>
        @if (step < 2) {
          <div class="w-3"></div>
        }
      }
    </div>
    @if (currentStep() === 1) {
      <form
        [formGroup]="metaForm"
        (ngSubmit)="nextStep()"
        novalidate
        class="glass-card p-6 space-y-5"
      >
        <hlm-field>
          <label hlmFieldLabel for="quiz-title">
            Quiz title <span class="text-red-500">*</span>
          </label>
          <input
            hlmInput
            id="quiz-title"
            formControlName="title"
            class="w-full"
            placeholder="e.g. The Midnight Library — Chapter 1 Quiz"
          />
          <hlm-field-error validator="required">Title is required.</hlm-field-error>
          <hlm-field-error validator="minlength">Title must be at least 3 characters.</hlm-field-error>
          <hlm-field-error validator="maxlength">Title must not exceed 100 characters.</hlm-field-error>
        </hlm-field>
        <hlm-field>
          <label hlmFieldLabel for="quiz-desc">Description</label>
          <textarea
            hlmInput
            id="quiz-desc"
            formControlName="description"
            rows="3"
            class="w-full resize-none"
            placeholder="A brief description of the quiz…"
          ></textarea>
          <hlm-field-error validator="maxlength">Description must not exceed 500 characters.</hlm-field-error>
        </hlm-field>
        <div class="flex justify-end">
          <button hlmBtn type="submit" [disabled]="metaForm.invalid"
                  class="bg-primary-600 hover:bg-primary-700 text-white">
            Continue →
          </button>
        </div>
      </form>
    }
    @if (currentStep() === 2) {
      <div class="space-y-6">
        @if (localQuestions().length > 0) {
          <div class="space-y-3">
            <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
              Questions ({{ localQuestions().length }})
            </h2>
            @for (q of localQuestions(); track $index) {
              <div hlmCard class="glass-card-subtle px-5 py-4 flex items-start gap-3 rounded-xl">
                <span class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40
                             text-primary-700 dark:text-primary-300 text-xs font-bold flex
                             items-center justify-center flex-shrink-0">
                  {{ $index + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-gray-900 dark:text-white text-sm font-medium">{{ q.question }}</p>
                  <p class="text-green-600 dark:text-green-400 text-xs mt-1">✓ {{ q.options[q.correctIndex] }}</p>
                </div>
                <button
                  type="button"
                  (click)="removeQuestion($index)"
                  class="text-gray-400 hover:text-red-500 transition-colors text-lg flex-shrink-0 ml-auto leading-none"
                  [attr.aria-label]="'Remove question ' + ($index + 1)"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        }
        <form
          [formGroup]="questionForm"
          (ngSubmit)="addQuestion()"
          novalidate
          class="glass-card p-6 space-y-5"
        >
          <h2 class="font-semibold text-gray-900 dark:text-white">
            {{ localQuestions().length === 0 ? 'Add your first question' : 'Add another question' }}
          </h2>
          <hlm-field>
            <label hlmFieldLabel for="q-text">Question <span class="text-red-500">*</span></label>
            <textarea
              hlmInput
              id="q-text"
              formControlName="question"
              rows="2"
              class="w-full resize-none"
              placeholder="What is the main theme of chapter 3?"
            ></textarea>
            <hlm-field-error validator="required">Question is required.</hlm-field-error>
            <hlm-field-error validator="minlength">Question must be at least 5 characters.</hlm-field-error>
          </hlm-field>
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Answer options <span class="text-red-500">*</span>
            </p>
            <div class="space-y-2">
              @for (idx of optionIndices; track idx) {
                <div class="flex items-center gap-3">
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      formControlName="correctIndex"
                      [value]="idx"
                      class="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <span
                      class="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      [class.bg-accent-500]="questionForm.controls.correctIndex.value === idx"
                      [class.text-white]="questionForm.controls.correctIndex.value === idx"
                      [class.bg-gray-100]="questionForm.controls.correctIndex.value !== idx"
                      [class.dark:bg-gray-700]="questionForm.controls.correctIndex.value !== idx"
                      [class.text-gray-600]="questionForm.controls.correctIndex.value !== idx"
                      [class.dark:text-gray-400]="questionForm.controls.correctIndex.value !== idx"
                    >
                      {{ optionLabel(idx) }}
                    </span>
                  </label>
                  <input
                    hlmInput
                    [formControlName]="'option' + idx"
                    [placeholder]="'Option ' + optionLabel(idx)"
                    class="flex-1"
                  />
                </div>
              }
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Select the radio button next to the correct answer.
            </p>
          </div>
          <button
            hlmBtn
            type="submit"
            variant="outline"
            [disabled]="questionForm.invalid"
            class="w-full border-dashed border-primary-400 dark:border-primary-600
                   text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            + Add Question
          </button>
        </form>
        @if (errorMessage()) {
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
            ⚠️ {{ errorMessage() }}
          </div>
        }
        <div class="flex justify-between items-center pb-8">
          <button hlmBtn type="button" variant="ghost" (click)="previousStep()">
            ← Back
          </button>
          <button
            hlmBtn
            type="button"
            (click)="saveQuiz()"
            [disabled]="localQuestions().length === 0 || isSaving()"
            class="bg-accent-600 hover:bg-accent-700 text-white font-bold"
          >
            {{ isSaving() ? '…Saving' : '💾 Save as Draft' }}
            @if (localQuestions().length > 0) {
              ({{ localQuestions().length }}
              {{ localQuestions().length === 1 ? 'question' : 'questions' }})
            }
          </button>
        </div>
      </div>
    }
  </div>
</div>
````

## File: src/app/layout/header/header.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith, firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { HlmDropdownMenuImports } from '../../shared/spartan/dropdown-menu/src';
import { HlmSheetImports } from '../../shared/spartan/sheet/src';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmIconImports } from '../../shared/spartan/icon/src';
@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideSun, lucideMoon })],
  imports: [
    RouterLink, RouterLinkActive, TranslateModule, NgIcon,
    ...HlmIconImports,
    ...HlmDropdownMenuImports, ...HlmSheetImports, HlmButton,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth      = inject(AuthService);
  private readonly translate = inject(TranslateService);
  readonly themeService      = inject(ThemeService);
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;
  readonly currentLang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: 'uk' },
  );
  readonly userInitials = computed(() => {
    const name = this.currentUser()?.displayName ?? '';
    return (
      name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('') || '?'
    );
  });
  switchLang(): void {
    const next = this.currentLang() === 'uk' ? 'en' : 'uk';
    void firstValueFrom(this.translate.use(next));
  }
  async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
````

## File: src/app/shared/components/address-autocomplete/address-autocomplete.component.html
````html
<div class="relative">
  <input
    hlmInput
    [id]="inputId() || undefined"
    [formControl]="control()"
    [placeholder]="placeholder()"
    autocomplete="off"
    (keydown)="onKeydown($event)"
    class="w-full"
    [class.border-red-400]="control().invalid && control().touched"
  />
  @if (isLoading()) {
    <div class="absolute right-3 top-3 flex items-center justify-center">
      <svg class="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>
  }
  @if (isOpen() && suggestions().length > 0) {
    <ul class="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
      @for (s of suggestions(); track s.label; let i = $index) {
        <li
          role="option"
          tabindex="0"
          [attr.aria-selected]="activeIndex() === i"
          (click)="select(s)"
          (keydown.enter)="select(s)"
          (keydown.space)="$event.preventDefault(); select(s)"
          [class.bg-primary-50]="activeIndex() === i"
          [class.dark:bg-primary-900/20]="activeIndex() === i"
          class="cursor-pointer px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >{{ s.label }}</li>
      }
    </ul>
  }
</div>
````

## File: src/app/core/services/event.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEvent, mapEvent } from '../api/api-mappers';
import { AfterMeetingVenue, ClubEvent } from '../models/event.model';
export interface CreateEventPayload {
  title: string;
  description?: string | null;
  date: string;
  city: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  theme?: string | null;
  tags?: string[];
  durationMinutes?: number | null;
  afterMeetingVenue?: AfterMeetingVenue | null;
  coverUrl?: string | null;
  bookTitle?: string | null;
  quizId?: string | null;
}
@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly _allEvents = signal<ClubEvent[]>([]);
  private readonly _myEvents = signal<ClubEvent[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _cityFilter = signal<string | null>(null);
  readonly allEvents = this._allEvents.asReadonly();
  readonly myEvents = this._myEvents.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly cityFilter = this._cityFilter.asReadonly();
  readonly filteredAllEvents = computed(() => {
    const city = this._cityFilter();
    const events = this._allEvents();
    return city ? events.filter(e => e.city === city) : events;
  });
  readonly availableCities = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const e of this._allEvents()) seen.add(e.city);
    return [...seen].sort((a, b) => a.localeCompare(b));
  });
  readonly groupedByDate = computed<Record<string, ClubEvent[]>>(() => {
    return this.filteredAllEvents().reduce<Record<string, ClubEvent[]>>((acc, e) => {
      const day = e.date.slice(0, 10);
      if (!acc[day]) acc[day] = [];
      acc[day].push(e);
      return acc;
    }, {});
  });
  setCityFilter(city: string | null): void {
    this._cityFilter.set(city);
  }
  async loadAllEvents(skip = 0, limit = 50): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiEvent[]>(`${environment.apiUrl}/events`, {
          params: { skip: String(skip), limit: String(limit) },
        }),
      );
      this._allEvents.set(raw.map(mapEvent));
    } catch {
      this._error.set('Failed to load events');
    } finally {
      this._isLoading.set(false);
    }
  }
  async loadMyEvents(): Promise<void> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiEvent[]>(`${environment.apiUrl}/events/my`),
      );
      this._myEvents.set(raw.map(mapEvent));
    } catch {
      this._error.set('Failed to load my events');
    }
  }
  async getEventById(id: string): Promise<ClubEvent | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiEvent>(`${environment.apiUrl}/events/${id}`),
      );
      return mapEvent(raw);
    } catch {
      return null;
    }
  }
  async attendEvent(eventId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/events/${eventId}/attend`, {}),
    );
    this._patchEventAttending(eventId, true);
  }
  async cancelAttendance(eventId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/events/${eventId}/attend`),
    );
    this._patchEventAttending(eventId, false);
  }
  async createEvent(clubId: string, payload: CreateEventPayload): Promise<ClubEvent> {
    const raw = await firstValueFrom(
      this.http.post<ApiEvent>(`${environment.apiUrl}/clubs/${clubId}/events`, payload),
    );
    return mapEvent(raw);
  }
  async rescheduleEvent(eventId: string, newDate: string, newCity?: string, newAddress?: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiEvent>(`${environment.apiUrl}/events/${eventId}/reschedule`, {
        newDate,
        newCity: newCity ?? null,
        newAddress: newAddress ?? null,
      }),
    );
    const updated = mapEvent(raw);
    this._updateEvent(updated);
  }
  async cancelEvent(eventId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiEvent>(`${environment.apiUrl}/events/${eventId}/cancel`, {}),
    );
    const updated = mapEvent(raw);
    this._updateEvent(updated);
  }
  private _patchEventAttending(eventId: string, attending: boolean): void {
    const patch = (list: ClubEvent[]) =>
      list.map(e =>
        e.id === eventId
          ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) }
          : e,
      );
    this._allEvents.update(patch);
    this._myEvents.update(patch);
  }
  private _updateEvent(updated: ClubEvent): void {
    this._allEvents.update(list => list.map(e => (e.id === updated.id ? updated : e)));
    this._myEvents.update(list => list.map(e => (e.id === updated.id ? updated : e)));
  }
}
````

## File: src/app/features/clubs/clubs-list/club-card/club-card.component.html
````html
<div
  class="flex flex-col overflow-hidden h-full"
  [class]="variant() === 'featured'
    ? 'parchment-card-raised'
    : 'parchment-card hover:shadow-[var(--shadow-parchment-lg)] transition-shadow duration-200'"
>
  <div class="relative overflow-hidden flex-shrink-0"
       [class]="variant() === 'featured' ? 'h-48' : 'h-32'">
    @if (club().coverUrl) {
      <img [src]="club().coverUrl" [alt]="''" class="w-full h-full object-cover" aria-hidden="true" loading="lazy" />
    } @else {
      <div class="w-full h-full bg-gradient-fantasy" aria-hidden="true"></div>
    }
    @if (variant() === 'featured') {
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
    }
  </div>
  <div class="flex flex-col flex-1 gap-3"
       [class]="variant() === 'featured' ? 'p-5' : 'p-4'">
    <div>
      <h3
        class="font-display font-semibold text-[var(--color-ink)] leading-snug flex items-center gap-1.5"
        [class]="variant() === 'featured' ? 'text-lg line-clamp-2' : 'text-base line-clamp-1'"
      >
        {{ club().name }}
        @if (isOwned()) {
          <span class="text-xs font-bold text-[var(--color-primary-600)] dark:text-[#fbbf24] flex-shrink-0"
                title="Your club" aria-label="Your club">✦</span>
        }
      </h3>
      @if (club().description) {
        <p
          class="text-xs text-[var(--color-ink-muted)] mt-1.5"
          [class]="variant() === 'featured' ? 'line-clamp-3' : 'line-clamp-2'"
        >
          {{ club().description }}
        </p>
      }
    </div>
    @if (club().memberPreviews.length > 0) {
      <div class="flex items-center gap-1.5">
        @for (url of club().memberPreviews.slice(0, 4); track url) {
          <div
            class="h-7 w-7 rounded-full avatar-gradient flex items-center justify-center
                   text-white text-[10px] font-bold shrink-0 overflow-hidden"
            aria-hidden="true"
          >
            @if (url) {
              <img [src]="url" class="h-full w-full object-cover" alt="" />
            } @else { ? }
          </div>
        }
        @if (club().memberCount > 4) {
          <span class="text-xs text-[var(--color-ink-muted)] ml-1">+{{ club().memberCount - 4 }}</span>
        }
        <span class="text-xs text-[var(--color-ink-muted)] ml-auto">
          {{ club().memberCount }} {{ 'CLUBS.members' | translate }}
        </span>
      </div>
    }
    <hlm-separator />
    <div class="flex items-center gap-2 mt-auto">
      @if (isAuthenticated() && !isMember()) {
        <button
          hlmBtn
          type="button"
          size="sm"
          (click)="join.emit()"
          [disabled]="joining()"
          class="flex-1"
          [attr.aria-label]="('CLUBS.join' | translate) + ' ' + club().name"
        >
          @if (joining()) { <hlm-spinner size="xs" /> } @else { {{ 'CLUBS.join' | translate }} }
        </button>
        <a
          hlmBtn
          variant="outline"
          size="sm"
          [routerLink]="['/clubs', club().id]"
          class="flex-shrink-0"
          [attr.aria-label]="('CLUBS.view' | translate) + ' ' + club().name"
        >
          {{ 'CLUBS.view' | translate }}
        </a>
      } @else if (isAuthenticated() && isMember()) {
        <a
          hlmBtn
          size="sm"
          [routerLink]="['/clubs', club().id]"
          class="flex-1 text-center"
          [attr.aria-label]="('CLUBS.view' | translate) + ' ' + club().name"
        >
          {{ 'CLUBS.view' | translate }}
        </a>
        <span class="rounded-lg
                     bg-[var(--color-accent-100)] dark:bg-[var(--color-accent-900)]/30
                     border border-[var(--color-accent-300)] dark:border-[var(--color-accent-700)]/60
                     px-3 py-1.5 text-xs font-semibold
                     text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)]">
          {{ 'CLUBS.member_badge' | translate }}
        </span>
      } @else {
        <a
          hlmBtn
          size="sm"
          [routerLink]="['/clubs', club().id]"
          class="flex-1 text-center"
          [attr.aria-label]="('CLUBS.view' | translate) + ' ' + club().name"
        >
          {{ 'CLUBS.view' | translate }}
        </a>
      }
    </div>
  </div>
</div>
````

## File: src/app/features/clubs/clubs-list/club-card/club-card.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Club } from '../../../../core/models/club.model';
import { TranslateModule } from '@ngx-translate/core';
import { HlmCardImports } from '../../../../shared/spartan/card/src';
import { HlmButton } from '../../../../shared/spartan/button/src';
import { HlmSeparator } from '../../../../shared/spartan/separator/src';
import { HlmSpinner } from '../../../../shared/spartan/spinner/src';
@Component({
  selector: 'app-club-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, ...HlmCardImports, HlmButton, HlmSeparator, HlmSpinner],
  templateUrl: './club-card.component.html',
})
export class ClubCardComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwned = input<boolean>(false);
  readonly isAuthenticated = input<boolean>(false);
  readonly joining = input<boolean>(false);
  readonly variant = input<'default' | 'featured'>('default');
  readonly join = output<void>();
  protected daysUntil(dateStr: string): number {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.round((target - now) / 86400000);
  }
}
````

## File: src/app/features/events/event-detail/event-detail.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiEvent, mapEvent } from '../../../core/api/api-mappers';
import { ClubEvent } from '../../../core/models/event.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-event-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent {
  readonly id = input.required<string>();
  private readonly http = inject(HttpClient);
  private readonly eventService = inject(EventService);
  readonly auth = inject(AuthService);
  private readonly _eventResource = rxResource<ClubEvent | null, string>({
    params: () => this.id(),
    stream: ({ params: id }) =>
      this.http.get<ApiEvent>(`${environment.apiUrl}/events/${id}`).pipe(
        map(mapEvent),
      ),
  });
  readonly event = computed(() => this._eventResource.value() ?? null);
  readonly isLoading = this._eventResource.isLoading;
  readonly errorMessage = computed(() =>
    !this._eventResource.isLoading() && this._eventResource.error() ? 'EVENT.LOAD_ERROR' : null,
  );
  readonly isActioning = signal(false);
  readonly isOrganizer = computed(
    () => !!this.auth.currentUser() && this.event()?.organizerId === this.auth.currentUser()?.id,
  );
  async onAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      await this.eventService.attendEvent(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }
  async onCancelAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      await this.eventService.cancelAttendance(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }
  async onCancelEvent(): Promise<void> {
    if (!confirm('Cancel this event?')) return;
    this.isActioning.set(true);
    try {
      await this.eventService.cancelEvent(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }
}
````

## File: src/app/features/events/events-feed/events-feed.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ClubEvent } from '../../../core/models/event.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
@Component({
  selector: 'app-events-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, EmptyStateComponent, EventCardComponent, HlmSpinner],
  templateUrl: './events-feed.component.html',
})
export class EventsFeedComponent implements OnInit {
  readonly eventService = inject(EventService);
  readonly auth = inject(AuthService);
  readonly attendingEventId = signal<string | null>(null);
  readonly activeTab = signal<'upcoming' | 'my'>('upcoming');
  readonly sortedDates = computed(() =>
    Object.keys(this.eventService.groupedByDate()).sort((a, b) => a.localeCompare(b)),
  );
  async ngOnInit(): Promise<void> {
    await this.eventService.loadAllEvents();
    if (this.auth.isAuthenticated()) {
      await this.eventService.loadMyEvents();
    }
  }
  async onAttend(event: ClubEvent): Promise<void> {
    this.attendingEventId.set(event.id);
    try {
      await this.eventService.attendEvent(event.id);
    } catch {
    } finally {
      this.attendingEventId.set(null);
    }
  }
  async onCancelAttend(event: ClubEvent): Promise<void> {
    this.attendingEventId.set(event.id);
    try {
      await this.eventService.cancelAttendance(event.id);
    } catch {
    } finally {
      this.attendingEventId.set(null);
    }
  }
}
````

## File: src/app/layout/header/header.component.html
````html
<header
  class="sticky top-0 z-50
         bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/95
         backdrop-blur-[10px]
         border-b border-[var(--color-sepia)]
         shadow-[0_2px_12px_rgba(92,45,10,0.10)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]"
  role="banner"
>
  <div class="page-max-w px-6">
    <div class="flex items-center justify-between h-16">
      <a
        routerLink="/"
        class="font-fantasy text-xl font-bold tracking-widest
               text-[var(--color-primary-600)] dark:text-[#fbbf24]
               hover:text-[var(--color-primary-500)] dark:hover:text-[#fcd34d]
               transition-colors duration-200
               focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 rounded"
        aria-label="BookClub home"
      >
        BookClub
      </a>
      <nav class="hidden md:flex items-center gap-1" aria-label="Main navigation">
        <a
          routerLink="/clubs"
          routerLinkActive="text-[var(--color-primary-600)] dark:text-[#fbbf24] bg-[var(--color-primary-100)]/80 dark:bg-[var(--color-primary-900)]/30 font-semibold"
          class="px-4 py-2 rounded-lg text-sm font-medium
                 text-[var(--color-ink-muted)]
                 hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
        >
          {{ 'NAV.discover' | translate }}
        </a>
        @if (isAuthenticated()) {
          <a
            routerLink="/events"
            routerLinkActive="text-[var(--color-primary-600)] dark:text-[#fbbf24] bg-[var(--color-primary-100)]/80 dark:bg-[var(--color-primary-900)]/30 font-semibold"
            class="px-4 py-2 rounded-lg text-sm font-medium
                   text-[var(--color-ink-muted)]
                   hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                   transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
          >
            {{ 'NAV.events' | translate }}
          </a>
        }
      </nav>
      <div class="hidden md:flex items-center gap-1">
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          type="button"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.isDark()
            ? ('NAV.theme_toggle_light' | translate)
            : ('NAV.theme_toggle_dark'  | translate)"
          [attr.title]="themeService.isDark()
            ? ('NAV.theme_toggle_light' | translate)
            : ('NAV.theme_toggle_dark'  | translate)"
        >
          @if (themeService.isDark()) {
            <ng-icon hlm name="lucideSun"  size="sm" />
          } @else {
            <ng-icon hlm name="lucideMoon" size="sm" />
          }
        </button>
        <button
          hlmBtn
          variant="ghost"
          size="sm"
          type="button"
          (click)="switchLang()"
          [attr.aria-label]="currentLang() === 'uk' ? 'Switch to English' : 'Перейти на українську'"
        >
          {{ currentLang() === 'uk' ? 'EN' : 'UK' }}
        </button>
        @if (isAuthenticated()) {
          <button
            type="button"
            [hlmDropdownMenuTrigger]="userMenu"
            class="flex items-center gap-2 rounded-full p-0.5 transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
            aria-haspopup="menu"
            [attr.aria-label]="'User menu for ' + (currentUser()?.displayName ?? 'User')"
          >
            <div
              class="h-9 w-9 rounded-full avatar-gradient
                     flex items-center justify-center text-white text-sm font-semibold select-none"
              aria-hidden="true"
            >
              {{ userInitials() }}
            </div>
          </button>
          <ng-template #userMenu>
            <div hlmDropdownMenu>
              <hlm-dropdown-menu-label>{{ currentUser()?.displayName }}</hlm-dropdown-menu-label>
              <hlm-dropdown-menu-separator />
              <a hlmDropdownMenuItem [routerLink]="['/profile']">
                {{ 'NAV.profile' | translate }}
              </a>
              <hlm-dropdown-menu-separator />
              <button hlmDropdownMenuItem variant="destructive" (click)="signOut()">
                {{ 'NAV.logout' | translate }}
              </button>
            </div>
          </ng-template>
        } @else {
          <a hlmBtn variant="outline" size="sm" routerLink="/login">
            {{ 'NAV.login' | translate }}
          </a>
          <a hlmBtn size="sm" routerLink="/register"
             class="bg-gradient-fantasy text-white border-0 hover:opacity-90">
            {{ 'NAV.join_free' | translate }}
          </a>
        }
      </div>
      <hlm-sheet class="md:hidden">
        <button
          hlmSheetTrigger
          type="button"
          class="p-2 rounded-lg text-[var(--color-ink-muted)]
                 hover:bg-[var(--color-surface-raised)] transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
          aria-label="Toggle navigation menu"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <ng-template hlmSheetPortal>
          <hlm-sheet-content>
            <hlm-sheet-header>
              <h2 hlmSheetTitle
                  class="font-fantasy font-bold tracking-widest text-[var(--color-primary-600)] dark:text-[#fbbf24]">
                BookClub
              </h2>
            </hlm-sheet-header>
            <nav class="flex flex-col gap-1 px-4 py-2" aria-label="Mobile navigation">
              <button hlmSheetClose [routerLink]="['/clubs']"
                      class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                             text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                             transition-all duration-200 w-full text-left">
                {{ 'NAV.discover' | translate }}
              </button>
              @if (isAuthenticated()) {
                <button hlmSheetClose [routerLink]="['/events']"
                        class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                               text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                               transition-all duration-200 w-full text-left">
                  {{ 'NAV.events' | translate }}
                </button>
              }
              <button
                type="button"
                (click)="themeService.toggle()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                       text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                       transition-all duration-200 w-full text-left"
                [attr.aria-label]="themeService.isDark()
                  ? ('NAV.theme_toggle_light' | translate)
                  : ('NAV.theme_toggle_dark'  | translate)"
              >
                @if (themeService.isDark()) {
                  <ng-icon hlm name="lucideSun"  size="sm" />
                  <span>{{ 'NAV.theme_toggle_light' | translate }}</span>
                } @else {
                  <ng-icon hlm name="lucideMoon" size="sm" />
                  <span>{{ 'NAV.theme_toggle_dark' | translate }}</span>
                }
              </button>
              <button
                type="button"
                (click)="switchLang()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                       text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                       transition-all duration-200 w-full text-left"
                [attr.aria-label]="currentLang() === 'uk' ? 'Switch to English' : 'Перейти на українську'"
              >
                <span>{{ currentLang() === 'uk' ? '🇬🇧 EN' : '🇺🇦 UK' }}</span>
              </button>
              <div class="pt-2 mt-2 border-t border-[var(--color-sepia)] flex flex-col gap-1">
                @if (isAuthenticated()) {
                  <div class="px-4 py-2">
                    <p class="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide">
                      {{ 'NAV.signed_in_as' | translate }}
                    </p>
                    <p class="text-sm font-medium text-[var(--color-ink)] mt-0.5">
                      {{ currentUser()?.displayName }}
                    </p>
                  </div>
                  <button hlmSheetClose [routerLink]="['/profile']"
                          class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                                 text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                                 transition-all duration-200 w-full text-left">
                    {{ 'NAV.profile' | translate }}
                  </button>
                  <button hlmSheetClose type="button" (click)="signOut()"
                          class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                                 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                                 transition-all duration-200">
                    {{ 'NAV.logout' | translate }}
                  </button>
                } @else {
                  <button hlmSheetClose [routerLink]="['/login']"
                          class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                                 text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]
                                 transition-all duration-200 w-full text-left">
                    {{ 'NAV.login' | translate }}
                  </button>
                  <button hlmSheetClose [routerLink]="['/register']"
                          class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                                 bg-gradient-fantasy text-white hover:opacity-90
                                 transition-all duration-200 w-full text-left">
                    {{ 'NAV.join_free' | translate }}
                  </button>
                }
              </div>
            </nav>
          </hlm-sheet-content>
        </ng-template>
      </hlm-sheet>
    </div>
  </div>
</header>
````

## File: public/i18n/en.json
````json
{
  "AUTH": {
    "activate_account": "Click it to activate your account.",
    "back_to_login": "Back to sign in",
    "check_email": "Check your email",
    "confirm_password": "Confirm password",
    "confirmation_sent": "We sent a confirmation link to",
    "create_account_h2": "Create account",
    "create_account_subtitle": "Create your account",
    "creating_account": "Creating account…",
    "display_name": "Display name",
    "email": "Email",
    "have_account": "Already have an account?",
    "no_account": "Don't have an account?",
    "password": "Password",
    "password_medium": "Medium",
    "password_strong": "Strong",
    "password_weak": "Weak",
    "passwords_no_match": "Passwords do not match",
    "register_title": "Register",
    "role_organizer_desc": "Create clubs & build quizzes",
    "role_organizer_label": "Organizer",
    "role_reader_desc": "Join clubs & take quizzes",
    "role_reader_label": "Reader",
    "select_role_error": "Please select a role.",
    "sign_in_h2": "Sign in",
    "signing_in": "Signing in…",
    "submit_login": "Log in",
    "want_to": "I want to…",
    "welcome_back": "Welcome back",
    "login_title": "Log In",
    "submit_register": "Register",
    "password_strength": "Password strength",
    "account_created": "Account created successfully!",
    "welcome_message": "Welcome,"
  },
  "CREATE_CLUB": {
    "subtitle": "Create a new reading community",
    "title": "Create a Club",
    "basic_info_legend": "Basic information",
    "name_label": "Club name",
    "name_placeholder": "e.g. Northern Readers",
    "name_required": "Club name is required.",
    "name_min": "Name must be at least 3 characters.",
    "name_max": "Name must not exceed 100 characters.",
    "description_label": "Description",
    "description_placeholder": "What books will your club read? Who is it for?",
    "description_max": "Description must not exceed 500 characters.",
    "city_label": "City",
    "city_placeholder": "Kyiv",
    "city_required": "City is required.",
    "city_max": "City must not exceed 100 characters.",
    "address_label": "Address",
    "address_placeholder": "1 Khreshchatyk St.",
    "address_max": "Address must not exceed 200 characters.",
    "tags_duration_legend": "Tags & duration",
    "tags_label": "Tags / Genres",
    "tags_placeholder": "Classics, Romance, Fantasy",
    "tags_hint": "Enter genres separated by commas",
    "tags_max": "Tags must not exceed 300 characters.",
    "duration_label": "Meeting duration (min)",
    "duration_placeholder": "90",
    "duration_min": "Duration must be at least 15 minutes.",
    "duration_max": "Duration must not exceed 480 minutes.",
    "visibility_legend": "Visibility",
    "public_label": "Public club",
    "public_desc": "Anyone can discover and join",
    "cover_url_label": "Cover image URL",
    "cover_url_placeholder": "https://example.com/cover.jpg",
    "cover_url_hint": "Paste a public image link (JPG, PNG, WebP)",
    "after_meeting_toggle": "▼ After-meeting venue",
    "after_meeting_hide": "▲ Hide after-meeting venue info",
    "venue_name_label": "Venue name",
    "venue_name_placeholder": "Café Pushkin",
    "venue_name_max": "Name must not exceed 150 characters.",
    "venue_address_label": "Venue address",
    "venue_address_placeholder": "2 Khreshchatyk St.",
    "venue_address_max": "Address must not exceed 200 characters.",
    "venue_notes_label": "Notes",
    "venue_notes_placeholder": "Reservation at 8 pm",
    "venue_notes_max": "Notes must not exceed 300 characters.",
    "cancel": "Cancel",
    "submit": "Create club",
    "submitting": "Creating…"
  },
  "CLUBS": {
    "active": "Active",
    "all": "All Clubs",
    "all_cities": "All cities",
    "cancelled": "Cancelled",
    "create": "Create club",
    "join": "Join",
    "member_badge": "✓ Member",
    "member_singular": "member",
    "members": "members",
    "missed": "Missed",
    "my_clubs": "My Clubs",
    "participated": "Attended",
    "paused": "Paused",
    "search_placeholder": "Search clubs...",
    "search_placeholder_full": "Search by name or description…",
    "subtitle": "Discover communities of readers near you",
    "title": "Book Clubs",
    "view": "View",
    "upcoming": "Upcoming meetings",
    "joined": "You're a member",
    "no_clubs": "No clubs found",
    "book_current": "Current book",
    "days_until": "in {{ days }} days"
  },
  "CLUB_DETAIL": {
    "about": "About",
    "back": "Back to clubs",
    "back_short": "Back",
    "cancel": "Cancel",
    "created": "Created",
    "join": "Join Club",
    "leave": "Leave Club",
    "manage_title": "Club management",
    "new_date": "New meeting date",
    "not_found": "Club not found",
    "organizer_badge": "✨ Organizer",
    "pause": "Pause",
    "private": "Private",
    "quizzes_desc": "Create & manage reading quizzes",
    "quizzes_title": "Quizzes",
    "randomizer_desc": "Pick the next book to read",
    "randomizer_title": "Randomizer",
    "reschedule": "Reschedule",
    "reschedule_submit": "Confirm date",
    "members_title": "Members",
    "tags_title": "Tags",
    "organizer_title": "Organizer",
    "meeting_info_title": "Meeting place & time",
    "duration_label": "Duration",
    "address_label": "Address",
    "view_on_map": "View on map →",
    "after_meeting_title": "After the meeting",
    "deletion_countdown_prefix": "This club has been cancelled —",
    "deletion_countdown_hours": "will be deleted in {{ hours }} h. {{ minutes }} min.",
    "deletion_countdown_minutes": "will be deleted in {{ minutes }} min.",
    "close_qr": "✕ Close",
    "events_title": "Upcoming Events",
    "events_empty": "No upcoming events scheduled.",
    "create_event": "＋ Create Event",
    "sort_nearest": "Nearest",
    "sort_popular": "Most popular",
    "sort_status": "By status",
    "join_cta_title": "Want to join this club?",
    "join_cta_desc": "Join to attend events and meet fellow readers.",
    "rsvp_going": "✓ Going",
    "rsvp_join": "RSVP",
    "rsvp_view": "View",
    "rsvp_attending": "attending",
    "edit_club_title": "Edit Club",
    "edit_club_desc": "Update name, description & settings",
    "create_event_title": "Create Event",
    "create_event_desc": "Schedule a new club event",
    "now_reading": "Now reading"
  },
  "EDIT_CLUB": {
    "title": "Edit Club",
    "subtitle": "Update your reading community's details",
    "submit": "Save changes",
    "submitting": "Saving…",
    "cancel": "Cancel",
    "success": "Club updated successfully!",
    "name_label": "Club name",
    "name_placeholder": "e.g. Northern Readers",
    "name_required": "Club name is required.",
    "name_min": "Name must be at least 3 characters.",
    "name_max": "Name must not exceed 100 characters.",
    "description_label": "Description",
    "description_placeholder": "What books will your club read? Who is it for?",
    "description_max": "Description must not exceed 500 characters.",
    "city_label": "City",
    "city_placeholder": "Kyiv",
    "visibility_legend": "Visibility",
    "public_label": "Public club",
    "public_desc": "Anyone can discover and join",
    "cover_url_label": "Cover image URL",
    "cover_url_placeholder": "https://example.com/cover.jpg",
    "cover_url_hint": "Paste a public image link (JPG, PNG, WebP)"
  },
  "FOOTER": {
    "privacy": "Privacy",
    "rights": "All rights reserved",
    "terms": "Terms"
  },
  "MEMBERS": {
    "empty": "No members yet",
    "member": "Member",
    "organizer": "Organizer",
    "show_qr": "QR",
    "socials_hidden": "Hidden",
    "title": "Members",
    "kick": "Kick",
    "ban": "Ban ▾",
    "ban_1": "1 meeting",
    "ban_3": "3 meetings",
    "ban_5": "5 meetings",
    "ban_permanent": "Permanently"
  },
  "NAV": {
    "back_home": "← Back to home",
    "discover": "Discover",
    "join_free": "Join Free",
    "login": "Log in",
    "logout": "Log out",
    "profile": "Profile",
    "signed_in_as": "Signed in as",
    "clubs": "Clubs",
    "my_clubs": "My Clubs",
    "register": "Register",
    "events": "Events",
    "theme_toggle_dark": "Switch to dark mode",
    "theme_toggle_light": "Switch to light mode"
  },
  "PROFILE": {
    "active_badge": "✓ Active",
    "books_read": "Books read",
    "clubs_joined": "Clubs joined",
    "display_name_label": "Display Name",
    "display_name_min": "Must be at least 2 characters.",
    "display_name_placeholder": "Your display name",
    "display_name_required": "Display name is required.",
    "edit_profile": "Edit Profile",
    "likes_received": "Likes Received",
    "member_since": "Member since",
    "name_updated": "Name updated!",
    "no_stats": "No statistics yet — start joining clubs and taking quizzes!",
    "quizzes_taken": "Quizzes taken",
    "quizzes_won": "Quizzes won",
    "role_changed_prefix": "Role updated to",
    "role_organizer": "Organizer",
    "role_organizer_desc": "Create clubs, run quizzes, and manage members.",
    "role_reader": "Reader",
    "role_reader_desc": "Discover clubs, join discussions, take quizzes.",
    "role_subtitle": "Choose how you participate in book clubs.",
    "role_title": "Your Role",
    "save": "Save",
    "save_name": "Save Name",
    "saving": "Saving…",
    "socials_public_label": "Show social media to all club members",
    "socials_saved": "Social media saved!",
    "socials_title": "Social media",
    "stats_title": "Statistics",
    "title": "My Profile",
    "saved": "Saved!",
    "role": "Role",
    "role_admin": "Administrator",
    "meetings_attended": "Meetings attended",
    "meetings_missed": "Meetings missed",
    "randomizer_wins": "Randomizer wins"
  },
  "RANDOMIZER": {
    "back_to_club": "← Back to club",
    "history_title": "Previous results",
    "members_title": "Members",
    "no_members": "No members in this club yet",
    "purpose_label": "Randomizer purpose",
    "purpose_placeholder": "e.g. Who presents the book?",
    "save": "💾 Save result",
    "saving": "⏳ Saving…",
    "select_all": "Select all",
    "selected": "selected",
    "spin": "🎲 Spin!",
    "spin_hint": "Press 'Spin' to select a member",
    "spinning": "Selecting winner…",
    "spinning_btn": "⏳ Selecting…",
    "subtitle": "Who's next? Let fate decide.",
    "title": "Randomizer",
    "no_history": "No results yet",
    "error_min": "Select at least 2 members",
    "winner": "Winner"
  },
  "QUIZ": {
    "title": "Quizzes",
    "create": "Create quiz",
    "take": "Start",
    "results": "Results",
    "score": "Score",
    "edit": "Edit",
    "edit_title": "Edit Quiz",
    "edit_save": "Save Changes",
    "edit_saving": "Saving…",
    "edit_success": "Quiz updated",
    "edit_active_warning": "This quiz is live and cannot be edited.",
    "question_remove": "Remove",
    "preview": "Preview",
    "preview_title": "Quiz Preview",
    "preview_banner": "Preview Mode — correct answers are shown",
    "preview_correct": "Correct answer",
    "preview_activate": "Activate Quiz",
    "preview_activating": "Activating…",
    "preview_live": "This quiz is currently live",
    "preview_no_questions": "No questions yet. Add some before activating.",
    "manage_session": "Manage Session",
    "session_title": "Quiz Session",
    "session_start": "Start Session",
    "session_starting": "Starting…",
    "session_pick_event": "Select event",
    "session_live": "Live",
    "session_participants": "Participants enrolled",
    "session_completed": "Completed",
    "session_end": "End Session",
    "session_ending": "Ending…",
    "session_refresh": "Refresh",
    "leaderboard": "Leaderboard",
    "leaderboard_title": "Leaderboard",
    "leaderboard_rank": "Rank",
    "leaderboard_player": "Player",
    "leaderboard_score": "Score",
    "leaderboard_completed": "Completed",
    "leaderboard_pending": "Not yet attempted",
    "leaderboard_empty": "No participants yet",
    "leaderboard_1st": "1st Place",
    "leaderboard_2nd": "2nd Place",
    "leaderboard_3rd": "3rd Place"
  },
  "CHAT": {
    "title": "Club Chat",
    "placeholder": "Type a message...",
    "send": "Send",
    "no_messages": "No messages yet",
    "new_message": "New message",
    "close": "Close chat",
    "open": "Open chat",
    "rooms": "Rooms",
    "mute": "Mute",
    "unmute": "Unmute",
    "muted_label": "[muted]",
    "no_rooms": "No chat rooms available",
    "ban_600s": "Ban 600s",
    "delete_message": "Delete message",
    "add_room": "Add room",
    "room_name_placeholder": "Room name...",
    "create_room": "Create"
  },
  "FORM_ERRORS": {
    "required": "This field is required.",
    "email": "Please enter a valid email address.",
    "minlength": "Minimum {{ requiredLength }} characters required.",
    "invalid": "Invalid value."
  },
  "SEO": {
    "clubs_title": "Book Clubs | Book Club",
    "clubs_description": "Find a book club in your city. Book discussions, reader meetups, interest communities.",
    "clubs_og_title": "Book Clubs",
    "login_title": "Sign In | Book Club",
    "register_title": "Register | Book Club",
    "profile_title": "Profile | Book Club",
    "club_detail_title": "{{ name }} | Book Club",
    "club_detail_og_title": "{{ name }}",
    "site_name": "Book Club",
    "site_url": "https://book-club-fe.vercel.app",
    "site_description": "Book Clubs of Ukraine"
  }
}
````

## File: public/i18n/uk.json
````json
{
  "AUTH": {
    "activate_account": "Натисніть, щоб активувати акаунт.",
    "back_to_login": "Назад до входу",
    "check_email": "Перевірте пошту",
    "confirm_password": "Підтвердіть пароль",
    "confirmation_sent": "Ми надіслали посилання підтвердження на",
    "create_account_h2": "Створити акаунт",
    "create_account_subtitle": "Створіть акаунт",
    "creating_account": "Створюємо акаунт…",
    "display_name": "Ім'я користувача",
    "email": "Email",
    "have_account": "Вже є акаунт?",
    "no_account": "Немає акаунту?",
    "password": "Пароль",
    "password_medium": "Середній",
    "password_strong": "Надійний",
    "password_weak": "Слабкий",
    "passwords_no_match": "Паролі не збігаються",
    "register_title": "Реєстрація",
    "role_organizer_desc": "Створювати клуби та проводити квізи",
    "role_organizer_label": "Організатор",
    "role_reader_desc": "Приєднуватись до клубів та проходити квізи",
    "role_reader_label": "Читач",
    "select_role_error": "Будь ласка, оберіть роль.",
    "sign_in_h2": "Увійти",
    "signing_in": "Входимо…",
    "submit_login": "Увійти",
    "want_to": "Я хочу…",
    "welcome_back": "Ласкаво просимо назад",
    "login_title": "Вхід",
    "submit_register": "Зареєструватися",
    "password_strength": "Надійність паролю",
    "account_created": "Акаунт успішно створено!",
    "welcome_message": "Ласкаво просимо,"
  },
  "CREATE_CLUB": {
    "subtitle": "Створіть нову спільноту читачів",
    "title": "Створити клуб",
    "basic_info_legend": "Основна інформація",
    "name_label": "Назва клубу",
    "name_placeholder": "Напр. Північ читачів",
    "name_required": "Назва клубу є обов'язковою.",
    "name_min": "Назва повинна містити щонайменше 3 символи.",
    "name_max": "Назва не повинна перевищувати 100 символів.",
    "description_label": "Опис",
    "description_placeholder": "Які книги буде читати ваш клуб? Для кого він?",
    "description_max": "Опис не повинен перевищувати 500 символів.",
    "city_label": "Місто",
    "city_placeholder": "Київ",
    "city_required": "Місто є обов'язковим.",
    "city_max": "Місто не повинно перевищувати 100 символів.",
    "address_label": "Адреса",
    "address_placeholder": "вул. Хрещатик, 1",
    "address_max": "Адреса не повинна перевищувати 200 символів.",
    "tags_duration_legend": "Теги та тривалість",
    "tags_label": "Теги / Жанри",
    "tags_placeholder": "Класика, Романтика, Фентезі",
    "tags_hint": "Введіть жанри через кому",
    "tags_max": "Теги не повинні перевищувати 300 символів.",
    "duration_label": "Тривалість зустрічі (хв)",
    "duration_placeholder": "90",
    "duration_min": "Тривалість не може бути менше 15 хвилин.",
    "duration_max": "Тривалість не може перевищувати 480 хвилин.",
    "visibility_legend": "Видимість",
    "public_label": "Публічний клуб",
    "public_desc": "Хто завгодно може виявити та приєднатися",
    "cover_url_label": "URL обкладинки",
    "cover_url_placeholder": "https://example.com/cover.jpg",
    "cover_url_hint": "Вставте публічне посилання на зображення (JPG, PNG, WebP)",
    "after_meeting_toggle": "▼ Після зустрічі",
    "after_meeting_hide": "▲ Приховати інформацію про місце після зустрічі",
    "venue_name_label": "Назва місця",
    "venue_name_placeholder": "Кав'ярня «Пушкін»",
    "venue_name_max": "Назва не повинна перевищувати 150 символів.",
    "venue_address_label": "Адреса місця",
    "venue_address_placeholder": "вул. Хрещатик, 2",
    "venue_address_max": "Адреса не повинна перевищувати 200 символів.",
    "venue_notes_label": "Примітки",
    "venue_notes_placeholder": "Бронювання на 20:00",
    "venue_notes_max": "Примітки не повинні перевищувати 300 символів.",
    "cancel": "Скасувати",
    "submit": "Створити клуб",
    "submitting": "Створення…"
  },
  "CLUBS": {
    "active": "Активний",
    "all": "Всі клуби",
    "all_cities": "Всі міста",
    "cancelled": "Скасовано",
    "create": "Створити клуб",
    "join": "Приєднатися",
    "member_badge": "✓ Учасник",
    "member_singular": "учасник",
    "members": "учасників",
    "missed": "Пропущені",
    "my_clubs": "Мої клуби",
    "participated": "Відвідані",
    "paused": "Призупинено",
    "search_placeholder": "Шукати клуби...",
    "search_placeholder_full": "Шукати за назвою або описом…",
    "subtitle": "Знайдіть спільноти читачів поруч",
    "title": "Книжкові клуби",
    "view": "Переглянути",
    "upcoming": "Найближчі зустрічі",
    "joined": "Ви учасник",
    "no_clubs": "Клубів не знайдено",
    "book_current": "Поточна книга",
    "days_until": "за {{ days }} дн."
  },
  "CLUB_DETAIL": {
    "about": "Про клуб",
    "back": "Назад до клубів",
    "back_short": "Назад",
    "cancel": "Скасувати",
    "created": "Створено",
    "join": "Приєднатись до клубу",
    "leave": "Покинути клуб",
    "manage_title": "Управління клубом",
    "new_date": "Нова дата зустрічі",
    "not_found": "Клуб не знайдено",
    "organizer_badge": "✨ Організатор",
    "pause": "Призупинити",
    "private": "Приватний",
    "quizzes_desc": "Створюйте та керуйте квізами",
    "quizzes_title": "Квізи",
    "randomizer_desc": "Обирайте наступну книгу",
    "randomizer_title": "Рандомайзер",
    "reschedule": "Перепланувати",
    "reschedule_submit": "Перенести зустріч",
    "members_title": "Учасники",
    "tags_title": "Теги",
    "organizer_title": "Організатор",
    "meeting_info_title": "Місце та час зустрічі",
    "duration_label": "Тривалість",
    "address_label": "Адреса",
    "view_on_map": "Переглянути на карті →",
    "after_meeting_title": "Після зустрічі",
    "deletion_countdown_prefix": "Цей клуб скасовано —",
    "deletion_countdown_hours": "буде видалено через {{ hours }} год. {{ minutes }} хв.",
    "deletion_countdown_minutes": "буде видалено через {{ minutes }} хв.",
    "close_qr": "✕ Закрити",
    "events_title": "Найближчі події",
    "events_empty": "Немає запланованих подій.",
    "create_event": "＋ Створити подію",
    "sort_nearest": "Найближчі",
    "sort_popular": "Популярні",
    "sort_status": "За статусом",
    "join_cta_title": "Хочеш приєднатись до клубу?",
    "join_cta_desc": "Вступи, щоб відвідувати зустрічі та знайомитись з читачами.",
    "rsvp_going": "✓ Йду",
    "rsvp_join": "Зареєструватись",
    "rsvp_view": "Детальніше",
    "rsvp_attending": "учасників",
    "edit_club_title": "Редагувати клуб",
    "edit_club_desc": "Оновити назву, опис та налаштування",
    "create_event_title": "Створити подію",
    "create_event_desc": "Запланувати нову подію клубу",
    "now_reading": "Читаємо зараз"
  },
  "EDIT_CLUB": {
    "title": "Редагувати клуб",
    "subtitle": "Оновіть дані своєї читацької спільноти",
    "submit": "Зберегти зміни",
    "submitting": "Збереження…",
    "cancel": "Скасувати",
    "success": "Клуб успішно оновлено!",
    "name_label": "Назва клубу",
    "name_placeholder": "Напр. Північ читачів",
    "name_required": "Назва клубу є обов'язковою.",
    "name_min": "Назва повинна містити щонайменше 3 символи.",
    "name_max": "Назва не повинна перевищувати 100 символів.",
    "description_label": "Опис",
    "description_placeholder": "Які книги буде читати ваш клуб? Для кого він?",
    "description_max": "Опис не повинен перевищувати 500 символів.",
    "city_label": "Місто",
    "city_placeholder": "Київ",
    "visibility_legend": "Видимість",
    "public_label": "Публічний клуб",
    "public_desc": "Хто завгодно може виявити та приєднатися",
    "cover_url_label": "URL обкладинки",
    "cover_url_placeholder": "https://example.com/cover.jpg",
    "cover_url_hint": "Вставте публічне посилання на зображення (JPG, PNG, WebP)"
  },
  "FOOTER": {
    "privacy": "Конфіденційність",
    "rights": "Усі права захищені",
    "terms": "Умови"
  },
  "MEMBERS": {
    "empty": "Немає учасників",
    "member": "Учасник",
    "organizer": "Організатор",
    "show_qr": "QR",
    "socials_hidden": "Приховано",
    "title": "Учасники",
    "kick": "Виключити",
    "ban": "Заблокувати ▾",
    "ban_1": "1 зустріч",
    "ban_3": "3 зустрічі",
    "ban_5": "5 зустрічей",
    "ban_permanent": "Назавжди"
  },
  "NAV": {
    "back_home": "← На головну",
    "discover": "Огляд",
    "join_free": "Приєднатись",
    "login": "Увійти",
    "logout": "Вийти",
    "profile": "Профіль",
    "signed_in_as": "Увійшли як",
    "clubs": "Клуби",
    "my_clubs": "Мої клуби",
    "register": "Приєднатись",
    "events": "Події",
    "theme_toggle_dark": "Темна тема",
    "theme_toggle_light": "Світла тема"
  },
  "PROFILE": {
    "active_badge": "✓ Активний",
    "books_read": "Книг прочитано",
    "clubs_joined": "Клубів приєднано",
    "display_name_label": "Ім'я в додатку",
    "display_name_min": "Мінімум 2 символи.",
    "display_name_placeholder": "Ваше ім'я",
    "display_name_required": "Ім'я є обов'язковим.",
    "edit_profile": "Редагувати профіль",
    "likes_received": "Отримано вподобань",
    "member_since": "Учасник з",
    "name_updated": "Ім'я оновлено!",
    "no_stats": "Статистики ще немає — починайте приєднуватись до клубів і проходити квізи!",
    "quizzes_taken": "Квізів пройдено",
    "quizzes_won": "Квізів виграно",
    "role_changed_prefix": "Роль змінено на",
    "role_organizer": "Організатор",
    "role_organizer_desc": "Створюйте клуби, проводьте квізи та керуйте учасниками.",
    "role_reader": "Читач",
    "role_reader_desc": "Відкривайте клуби, беріть участь у дискусіях і проходьте квізи.",
    "role_subtitle": "Оберіть, як ви берете участь у книжкових клубах.",
    "role_title": "Ваша роль",
    "save": "Зберегти",
    "save_name": "Зберегти ім'я",
    "saving": "Збереження…",
    "socials_public_label": "Показувати соціальні мережі всім учасникам клубів",
    "socials_saved": "Соціальні мережі збережено!",
    "socials_title": "Соціальні мережі",
    "stats_title": "Статистика",
    "title": "Особистий кабінет",
    "saved": "Збережено!",
    "role": "Роль",
    "role_admin": "Адміністратор",
    "meetings_attended": "Зустрічей відвідано",
    "meetings_missed": "Зустрічей пропущено",
    "randomizer_wins": "Перемог в рандомайзері"
  },
  "RANDOMIZER": {
    "back_to_club": "← До клубу",
    "history_title": "Попередні результати",
    "members_title": "Учасники",
    "no_members": "У цьому клубі поки немає учасників",
    "purpose_label": "Питання / Мета рандомайзера",
    "purpose_placeholder": "Наприклад: Хто представляє книгу?",
    "save": "💾 Зберегти результат",
    "saving": "⏳ Збереження…",
    "select_all": "Обрати всіх",
    "selected": "обрано",
    "spin": "🎲 Крутити",
    "spin_hint": "Натисніть «Крутити» щоб обрати учасника",
    "spinning": "Вибираємо переможця…",
    "spinning_btn": "⏳ Вибираємо…",
    "subtitle": "Хто наступний? Нехай доля вирішує.",
    "title": "Рандомайзер",
    "no_history": "Немає результатів",
    "error_min": "Оберіть щонайменше 2 учасників",
    "winner": "Переможець"
  },
  "QUIZ": {
    "title": "Квізи",
    "create": "Створити квіз",
    "take": "Почати",
    "results": "Результати",
    "score": "Рахунок",
    "edit": "Редагувати",
    "edit_title": "Редагувати квіз",
    "edit_save": "Зберегти зміни",
    "edit_saving": "Збереження…",
    "edit_success": "Квіз оновлено",
    "edit_active_warning": "Цей квіз активний і не може бути відредагований.",
    "question_remove": "Видалити",
    "preview": "Перегляд",
    "preview_title": "Перегляд квізу",
    "preview_banner": "Режим перегляду — правильні відповіді показані",
    "preview_correct": "Правильна відповідь",
    "preview_activate": "Активувати квіз",
    "preview_activating": "Активація…",
    "preview_live": "Цей квіз зараз активний",
    "preview_no_questions": "Питань ще немає. Додайте їх перед активацією.",
    "manage_session": "Керувати сесією",
    "session_title": "Сесія квізу",
    "session_start": "Почати сесію",
    "session_starting": "Запуск…",
    "session_pick_event": "Оберіть подію",
    "session_live": "Наживо",
    "session_participants": "Учасників зареєстровано",
    "session_completed": "Завершено",
    "session_end": "Завершити сесію",
    "session_ending": "Завершення…",
    "session_refresh": "Оновити",
    "leaderboard": "Таблиця лідерів",
    "leaderboard_title": "Таблиця лідерів",
    "leaderboard_rank": "Місце",
    "leaderboard_player": "Гравець",
    "leaderboard_score": "Рахунок",
    "leaderboard_completed": "Завершено",
    "leaderboard_pending": "Ще не пройдено",
    "leaderboard_empty": "Учасників ще немає",
    "leaderboard_1st": "1-е місце",
    "leaderboard_2nd": "2-е місце",
    "leaderboard_3rd": "3-є місце"
  },
  "CHAT": {
    "title": "Чат клубу",
    "placeholder": "Написати повідомлення...",
    "send": "Надіслати",
    "no_messages": "Поки немає повідомлень",
    "new_message": "Нове повідомлення",
    "close": "Закрити чат",
    "open": "Відкрити чат",
    "rooms": "Кімнати",
    "mute": "Заглушити",
    "unmute": "Зняти мут",
    "muted_label": "[заглушено]",
    "no_rooms": "Кімнати чату недоступні",
    "ban_600s": "Бан 600 сек",
    "delete_message": "Видалити повідомлення",
    "add_room": "Додати кімнату",
    "room_name_placeholder": "Назва кімнати...",
    "create_room": "Створити"
  },
  "FORM_ERRORS": {
    "required": "Це поле є обов'язковим.",
    "email": "Введіть коректну адресу електронної пошти.",
    "minlength": "Мінімум {{ requiredLength }} символів.",
    "invalid": "Некоректне значення."
  },
  "SEO": {
    "clubs_title": "Книжкові клуби | Book Club",
    "clubs_description": "Знайдіть книжковий клуб у вашому місті. Обговорення книг, зустрічі читачів, спільноти за інтересами.",
    "clubs_og_title": "Книжкові клуби",
    "login_title": "Вхід | Book Club",
    "register_title": "Реєстрація | Book Club",
    "profile_title": "Профіль | Book Club",
    "club_detail_title": "{{ name }} | Book Club",
    "club_detail_og_title": "{{ name }}",
    "site_name": "Book Club",
    "site_url": "https://book-club-fe.vercel.app",
    "site_description": "Читацькі клуби України"
  }
}
````

## File: src/app/features/clubs/clubs-list/clubs-list.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';
import { SeoService } from '../../../core/services/seo.service';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ClubCardComponent } from './club-card/club-card.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
@Component({
  selector: 'app-clubs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EmptyStateComponent, TranslateModule, ClubCardComponent, HlmSpinner],
  templateUrl: './clubs-list.component.html',
})
export class ClubsListComponent implements OnInit {
  readonly clubService = inject(ClubService);
  readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  readonly joiningClubId = signal<string | null>(null);
  readonly ownedClubIds = this.clubService.myOwnedClubIds;
  readonly activeTab = signal<'all' | 'my'>('all');
  async ngOnInit(): Promise<void> {
    this.seo.setPageI18n('SEO.clubs_title', {
      descriptionKey: 'SEO.clubs_description',
      ogTitleKey: 'SEO.clubs_og_title',
    });
    this.seo.injectWebSiteJsonLd();
    await this.clubService.loadPublicClubs();
    if (this.auth.isAuthenticated()) {
      await this.clubService.loadMyClubs();
    }
  }
  async onJoin(club: Club): Promise<void> {
    this.joiningClubId.set(club.id);
    try {
      await this.clubService.joinClub(club.id);
    } catch {
    } finally {
      this.joiningClubId.set(null);
    }
  }
}
````

## File: src/app/features/events/create-event/create-event.component.html
````html
<main class="max-w-2xl mx-auto px-4 py-8 space-y-6">
  <nav>
    <a [routerLink]="['/clubs', clubId()]"
       class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
      ← Back to Club
    </a>
  </nav>
  <div class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Event</h1>
    @if (errorMessage()) {
      <div class="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
           role="alert">
        {{ errorMessage() }}
      </div>
    }
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title <span class="text-red-500">*</span>
        </label>
        <input hlmInput id="title" type="text" formControlName="title" class="w-full"
               placeholder="April Discussion" />
        @if (form.controls.title.touched && form.controls.title.errors?.['required']) {
          <p class="mt-1 text-xs text-red-600 dark:text-red-400">Title is required.</p>
        }
      </div>
      <div>
        <label for="bookTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📖 Book title</label>
        <input hlmInput id="bookTitle" type="text" formControlName="bookTitle" class="w-full"
               placeholder="The Master and Margarita" />
        @if (isFetchingCover()) {
          <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">🔍 Searching for book cover…</p>
        } @else if (coverFetchFailed()) {
          <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">No cover found — you can add one manually below.</p>
        } @else {
          <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">What book will you discuss at this event?</p>
        }
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea hlmInput id="description" formControlName="description" rows="3" class="w-full resize-none"
                  placeholder="What will you be reading or discussing?"></textarea>
      </div>
      <div>
        <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date & Time <span class="text-red-500">*</span>
        </label>
        <input hlmInput id="date" type="datetime-local" formControlName="date" class="w-full" />
        @if (form.controls.date.touched && form.controls.date.errors?.['required']) {
          <p class="mt-1 text-xs text-red-600 dark:text-red-400">Date is required.</p>
        }
      </div>
      <div>
        <p class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location <span class="text-red-500">*</span>
        </p>
        <app-address-autocomplete
          [control]="form.controls.address"
          placeholder="Start typing an address…"
          (selected)="onAddressSelect($event)"
        />
        @if (form.controls.city.touched && form.controls.city.errors?.['required']) {
          <p class="mt-1 text-xs text-red-600 dark:text-red-400">Location is required.</p>
        }
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
          <input hlmInput id="duration" type="number" formControlName="durationMinutes" min="15" max="480"
                 class="w-full" placeholder="120" />
        </div>
        <div>
          <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
          <input hlmInput id="theme" type="text" formControlName="theme" class="w-full" placeholder="sci-fi" />
        </div>
      </div>
      <div>
        <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
        <input hlmInput id="tags" type="text" formControlName="tagsRaw" class="w-full"
               placeholder="fiction, dystopia, classic (comma-separated)" />
      </div>
      <div>
        <p class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover image</p>
        <app-cover-upload [control]="form.controls.coverUrl" />
      </div>
      @if (activeQuizzes().length > 0) {
        <div>
          <label for="quizId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            🧠 Linked quiz
          </label>
          <select id="quizId" formControlName="quizId"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option [ngValue]="null">— No quiz —</option>
            @for (quiz of activeQuizzes(); track quiz.id) {
              <option [value]="quiz.id">{{ quiz.title }}</option>
            }
          </select>
        </div>
      }
      <div>
        <button type="button" (click)="toggleAfterVenue()"
                class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
          {{ showAfterVenue() ? '− Remove after-meeting venue' : '+ Add after-meeting venue' }}
        </button>
        @if (showAfterVenue()) {
          <div class="mt-3 space-y-3 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
            <div>
              <label for="afterVenueName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Venue name <span class="text-red-500">*</span>
              </label>
              <input hlmInput id="afterVenueName" type="text" formControlName="afterVenueName"
                     class="w-full" placeholder="Cozy Cafe" />
            </div>
            <div>
              <label for="afterVenueAddress" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input hlmInput id="afterVenueAddress" type="text" formControlName="afterVenueAddress"
                     class="w-full" placeholder="123 Main St" />
            </div>
            <div>
              <label for="afterVenueDesc" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <input hlmInput id="afterVenueDesc" type="text" formControlName="afterVenueDescription"
                     class="w-full" placeholder="Optional notes" />
            </div>
          </div>
        }
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <a hlmBtn variant="outline" [routerLink]="['/clubs', clubId()]">Cancel</a>
        <button hlmBtn type="submit" [disabled]="form.invalid || isSubmitting()"
                class="bg-primary-600 hover:bg-primary-700 text-white">
          @if (isSubmitting()) { Creating… } @else { Create Event }
        </button>
      </div>
    </form>
  </div>
</main>
````

## File: src/app/shared/components/address-autocomplete/address-autocomplete.component.ts
````typescript
import {
  Component, ChangeDetectionStrategy, input, output,
  DestroyRef, signal, inject, ElementRef, HostListener, effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { GeocodingService, GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { HlmInput } from '../../spartan/input/src';
@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmInput],
  templateUrl: './address-autocomplete.component.html',
})
export class AddressAutocompleteComponent {
  readonly control = input.required<FormControl<string>>();
  readonly placeholder = input<string>('');
  readonly inputId = input<string>('');
  readonly selected = output<GeocodeSuggestion>();
  private readonly geocoding = inject(GeocodingService);
  private readonly elRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly suggestions = signal<GeocodeSuggestion[]>([]);
  readonly isLoading = signal(false);
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);
  constructor() {
    effect(() => {
      const ctrl = this.control();
      ctrl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          if (!q || q.length < 2) {
            this.suggestions.set([]);
            this.isOpen.set(false);
            return of([]);
          }
          this.isLoading.set(true);
          return this.geocoding.autocomplete$(q);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (results) => {
          this.isLoading.set(false);
          this.suggestions.set(results);
          this.activeIndex.set(-1);
          this.isOpen.set(results.length > 0);
        },
        error: () => {
          this.isLoading.set(false);
          this.suggestions.set([]);
        },
      });
    });
  }
  select(s: GeocodeSuggestion): void {
    this.control().setValue(s.label, { emitEvent: false });
    this.suggestions.set([]);
    this.isOpen.set(false);
    this.selected.emit(s);
  }
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    const len = this.suggestions().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update(i => (i + 1) % len);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(i => (i - 1 + len) % len);
    } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
      event.preventDefault();
      this.select(this.suggestions()[this.activeIndex()]);
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
````

## File: src/app/features/clubs/clubs-list/clubs-list.component.html
````html
<div class="min-h-screen">
  <section aria-label="Search clubs" class="parchment-hero px-4 py-14 text-center">
    <div class="relative z-10">
      <h1 class="font-fantasy text-4xl font-bold tracking-widest uppercase
                 text-[var(--color-ink)] mb-3 drop-shadow-sm">
        {{ 'CLUBS.title' | translate }}
      </h1>
      <p class="text-[var(--color-ink-muted)] font-display text-lg mb-12">
        {{ 'CLUBS.subtitle' | translate }}
      </p>
      <div class="mx-auto max-w-xl lg:max-w-2xl relative">
        <label for="club-search" class="sr-only">{{ 'CLUBS.search_placeholder' | translate }}</label>
        <input
          id="club-search"
          type="search"
          [ngModel]="clubService.searchQuery()"
          (ngModelChange)="clubService.setSearchQuery($event)"
          [placeholder]="'CLUBS.search_placeholder_full' | translate"
          class="w-full parchment-input rounded-full px-5 py-3 text-sm"
          [attr.aria-label]="'CLUBS.search_placeholder' | translate"
        />
      </div>
    </div>
  </section>
  <div class="page-container py-8 space-y-8">
    @if (clubService.error()) {
      <div class="flex items-start gap-2 parchment-card px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
        <span aria-hidden="true">⚠️</span>
        <span>{{ clubService.error() }}</span>
      </div>
    }
    @if (auth.isAuthenticated()) {
      <div class="flex justify-center" role="tablist" aria-label="Club filter">
        <div class="relative flex rounded-full p-1
                    bg-[var(--color-surface-sunken)]
                    border border-[var(--color-sepia)]
                    shadow-inner">
          <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full
                      bg-[var(--color-surface-raised)]
                      shadow-[var(--shadow-parchment)]
                      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
               [style.left]="activeTab() === 'all' ? '4px' : '50%'"
               aria-hidden="true">
          </div>
          <button
            role="tab"
            type="button"
            [attr.aria-selected]="activeTab() === 'all'"
            (click)="activeTab.set('all')"
            class="relative z-10 px-7 py-2 rounded-full text-sm font-medium
                   transition-colors duration-300 select-none focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1"
            [class]="activeTab() === 'all'
              ? 'text-[var(--color-primary-700)] dark:text-[#fbbf24] font-semibold'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'"
          >
            {{ 'CLUBS.all' | translate }}
          </button>
          <button
            role="tab"
            type="button"
            [attr.aria-selected]="activeTab() === 'my'"
            (click)="activeTab.set('my')"
            class="relative z-10 flex items-center gap-1.5 px-7 py-2 rounded-full text-sm font-medium
                   transition-colors duration-300 select-none focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1"
            [class]="activeTab() === 'my'
              ? 'text-[var(--color-primary-700)] dark:text-[#fbbf24] font-semibold'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'"
          >
            {{ 'CLUBS.my_clubs' | translate }}
            @if (clubService.myClubs().length > 0) {
              <span class="inline-flex items-center justify-center
                           h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold leading-none
                           transition-colors duration-300"
                    [class]="activeTab() === 'my'
                      ? 'bg-[var(--color-primary-600)] text-white'
                      : 'bg-[var(--color-ink-muted)]/20 text-[var(--color-ink-muted)]'">
                {{ clubService.myClubs().length }}
              </span>
            }
          </button>
        </div>
      </div>
      @if (activeTab() === 'all') {
        <div class="pt-6" role="tabpanel">
          @if (clubService.isLoading()) {
            <div class="py-16 flex justify-center" aria-busy="true" aria-label="Loading clubs">
              <hlm-spinner />
            </div>
          } @else if (clubService.filteredClubs().length === 0) {
            <app-empty-state
              icon="📚"
              title="No clubs yet"
              description="No clubs have been created yet. Check back soon!"
            />
          } @else {
            <ul class="bento-grid">
              @for (club of clubService.filteredClubs(); track club.id; let i = $index) {
                <li [class]="i === 0 ? 'bento-col-2 bento-row-2' : ''">
                  <app-club-card
                    [club]="club"
                    [variant]="i === 0 ? 'featured' : 'default'"
                    [isMember]="clubService.myClubIds().has(club.id)"
                    [isOwned]="ownedClubIds().has(club.id)"
                    [isAuthenticated]="auth.isAuthenticated()"
                    [joining]="joiningClubId() === club.id"
                    (join)="onJoin(club)"
                  />
                </li>
              }
            </ul>
          }
        </div>
      }
      @if (activeTab() === 'my') {
        <div class="pt-6" role="tabpanel">
          @if (clubService.isLoading()) {
            <div class="py-16 flex justify-center" aria-busy="true">
              <hlm-spinner />
            </div>
          } @else if (clubService.myClubs().length === 0) {
            <app-empty-state
              icon="📚"
              [title]="'CLUBS.no_clubs' | translate"
              description="Join a club to see it here."
            />
          } @else {
            <ul class="bento-grid">
              @for (club of clubService.myClubs(); track club.id; let i = $index) {
                <li [class]="i === 0 ? 'bento-col-2 bento-row-2' : ''">
                  <app-club-card
                    [club]="club"
                    [variant]="i === 0 ? 'featured' : 'default'"
                    [isMember]="clubService.myClubIds().has(club.id)"
                    [isOwned]="ownedClubIds().has(club.id)"
                    [isAuthenticated]="auth.isAuthenticated()"
                    [joining]="joiningClubId() === club.id"
                    (join)="onJoin(club)"
                  />
                </li>
              }
            </ul>
          }
        </div>
      }
    } @else {
      @if (clubService.isLoading()) {
        <div class="py-16 flex justify-center" aria-busy="true" aria-label="Loading clubs">
          <hlm-spinner />
        </div>
      } @else if (clubService.filteredClubs().length === 0) {
        <app-empty-state
          icon="📚"
          title="No clubs yet"
          description="No clubs have been created yet. Check back soon!"
        />
      } @else {
        <ul class="bento-grid">
          @for (club of clubService.filteredClubs(); track club.id; let i = $index) {
            <li [class]="i === 0 ? 'bento-col-2 bento-row-2' : ''">
              <app-club-card
                [club]="club"
                [variant]="i === 0 ? 'featured' : 'default'"
                [isMember]="false"
                [isOwned]="false"
                [isAuthenticated]="false"
                [joining]="false"
                (join)="onJoin(club)"
              />
            </li>
          }
        </ul>
      }
    }
  </div>
  @if (auth.isOrganizer()) {
    <a
      routerLink="/clubs/create"
      class="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full fab-fantasy focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2 transition-all duration-200"
      [attr.aria-label]="'CLUBS.create' | translate"
      [title]="'CLUBS.create' | translate"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </a>
  }
</div>
````

## File: src/app/features/clubs/create-club/create-club.component.html
````html
<main class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-lg">
    <header class="text-center mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">📚 BookClub</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">{{ 'CREATE_CLUB.subtitle' | translate }}</p>
    </header>
    <article class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ 'CREATE_CLUB.title' | translate }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
        <hlm-field>
          <label hlmFieldLabel for="club-name">
            {{ 'CREATE_CLUB.name_label' | translate }}
            <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            hlmInput
            id="club-name"
            type="text"
            formControlName="name"
            class="w-full"
            [placeholder]="'CREATE_CLUB.name_placeholder' | translate"
          />
          <hlm-field-error validator="required">{{ 'CREATE_CLUB.name_required' | translate }}</hlm-field-error>
          <hlm-field-error validator="minlength">{{ 'CREATE_CLUB.name_min' | translate }}</hlm-field-error>
          <hlm-field-error validator="maxlength">{{ 'CREATE_CLUB.name_max' | translate }}</hlm-field-error>
        </hlm-field>
        <hlm-field>
          <label hlmFieldLabel for="club-description">{{ 'CREATE_CLUB.description_label' | translate }}</label>
          <textarea
            hlmInput
            id="club-description"
            formControlName="description"
            rows="3"
            class="w-full resize-none"
            [placeholder]="'CREATE_CLUB.description_placeholder' | translate"
          ></textarea>
          <hlm-field-error validator="maxlength">{{ 'CREATE_CLUB.description_max' | translate }}</hlm-field-error>
        </hlm-field>
        <div>
          <label for="club-cover-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ 'CREATE_CLUB.cover_url_label' | translate }}
          </label>
          @if (form.controls.coverUrl.value) {
            <div class="mb-2 rounded-xl overflow-hidden h-28 bg-gray-100 dark:bg-gray-700">
              <img [src]="form.controls.coverUrl.value" alt="Cover preview" class="w-full h-full object-cover"
                   (error)="form.controls.coverUrl.setValue('')" />
            </div>
          }
          <input
            hlmInput
            id="club-cover-url"
            type="url"
            formControlName="coverUrl"
            class="w-full"
            [placeholder]="'CREATE_CLUB.cover_url_placeholder' | translate"
          />
          <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">{{ 'CREATE_CLUB.cover_url_hint' | translate }}</p>
        </div>
        <fieldset>
          <legend class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ 'CREATE_CLUB.visibility_legend' | translate }}</legend>
          <div class="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'CREATE_CLUB.public_label' | translate }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ 'CREATE_CLUB.public_desc' | translate }}</p>
            </div>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="form.controls.isPublic.value"
              (click)="togglePublic()"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              [class.bg-primary-600]="form.controls.isPublic.value"
              [class.bg-gray-300]="!form.controls.isPublic.value"
              [class.dark:bg-gray-600]="!form.controls.isPublic.value"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                [class.translate-x-6]="form.controls.isPublic.value"
                [class.translate-x-1]="!form.controls.isPublic.value"
              ></span>
            </button>
          </div>
        </fieldset>
        @if (errorMessage()) {
          <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
               role="alert">
            <span class="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }
        <div class="flex gap-3 pt-2">
          <button hlmBtn type="button" variant="outline" (click)="cancel()" class="flex-1">
            {{ 'CREATE_CLUB.cancel' | translate }}
          </button>
          <button hlmBtn type="submit" [disabled]="isSubmitting()"
                  class="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
            @if (isSubmitting()) {
              <hlm-spinner class="mr-2" />
              {{ 'CREATE_CLUB.submitting' | translate }}
            } @else {
              {{ 'CREATE_CLUB.submit' | translate }}
            }
          </button>
        </div>
      </form>
    </article>
  </div>
</main>
````

## File: src/app/features/clubs/create-club/create-club.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
interface CreateClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  coverUrl: FormControl<string>;
}
@Component({
  selector: 'app-create-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './create-club.component.html',
})
export class CreateClubComponent {
  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = this._errorMessage.asReadonly();
  private readonly _isSubmitting = signal(false);
  readonly isSubmitting = this._isSubmitting.asReadonly();
  private readonly _showAfterMeeting = signal(false);
  readonly showAfterMeeting = this._showAfterMeeting.asReadonly();
  readonly form = new FormGroup<CreateClubForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    coverUrl: new FormControl('', { nonNullable: true }),
  });
  togglePublic(): void {
    const current = this.form.controls.isPublic.value;
    this.form.controls.isPublic.setValue(!current);
  }
  toggleAfterMeeting(): void {
    this._showAfterMeeting.update(v => !v);
  }
  cancel(): void {
    this.router.navigate(['/clubs']);
  }
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this._isSubmitting.set(true);
    this._errorMessage.set(null);
    const { name, description, isPublic, city, coverUrl } = this.form.getRawValue();
    try {
      const club = await this.clubService.createClub({ name, description, isPublic, city, coverUrl: coverUrl || null });
      this.router.navigate(['/clubs', club.id]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
````

## File: package.json
````json
{
  "name": "book-club-fe",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "test:ci": "ng test --no-watch --no-progress --browsers=ChromeHeadlessCI",
    "extract-i18n": "node scripts/extract-i18n.mjs",
    "extract-i18n:clean": "node scripts/extract-i18n.mjs --clean",
    "lint": "ng lint",
    "build-ctx": "npx repomix --no-files",
    "prepare": "husky install",
    "mock": "node mock-server/index.js",
    "dev": "concurrently --names \"ng,mock\" -c \"cyan,green\" \"npm start\" \"npm run mock\""
  },
  "prettier": {
    "overrides": [
      {
        "files": "*.html",
        "options": {
          "parser": "angular"
        }
      }
    ]
  },
  "private": true,
  "overrides": {
    "picomatch": "^4.0.4",
    "axios": "1.15.2"
  },
  "dependencies": {
    "@angular/cdk": "^21.2.8",
    "@angular/common": "^21.2.10",
    "@angular/compiler": "^21.2.10",
    "@angular/core": "^21.2.10",
    "@angular/forms": "^21.2.10",
    "@angular/platform-browser": "^21.2.10",
    "@angular/router": "^21.2.10",
    "@ng-icons/core": ">=32.0.0 <34.0.0",
    "@ng-icons/lucide": ">=32.0.0 <34.0.0",
    "@ngx-translate/core": "^17.0.0",
    "@ngx-translate/http-loader": "^17.0.0",
    "@spartan-ng/brain": "^0.0.1-alpha.678",
    "@spartan-ng/cli": "^0.0.1-alpha.678",
    "@tailwindcss/postcss": "^4.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "qrcode": "^1.5.4",
    "rxjs": "~7.8.0",
    "tailwind-merge": "^3.5.0",
    "tslib": "^2.3.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@angular/build": "^21.2.8",
    "@angular/cli": "^21.2.8",
    "@angular/compiler-cli": "^21.2.10",
    "@types/jasmine": "~5.1.0",
    "@types/qrcode": "^1.5.6",
    "angular-eslint": "21.0.1",
    "autoprefixer": "^10.4.27",
    "concurrently": "^9.2.1",
    "cors": "^2.8.6",
    "eslint": "^9.39.1",
    "eslint-plugin-rxjs-x": "^0.9.5",
    "express": "^5.2.1",
    "husky": "^8.0.0",
    "jasmine-core": "~5.8.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "postcss": "^8.5.9",
    "tailwindcss": "^4.2.4",
    "typescript": "~5.9.3",
    "typescript-eslint": "8.46.4"
  }
}
````

## File: src/app/features/events/create-event/create-event.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  input,
  resource,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AddressAutocompleteComponent } from '../../../shared/components/address-autocomplete/address-autocomplete.component';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { BookCoverService } from '../../../core/services/book-cover.service';
import { GeocodeSuggestion } from '../../../core/services/geocoding.service';
@Component({
  selector: 'app-create-event',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, AddressAutocompleteComponent, CoverUploadComponent, HlmInput, HlmButton],
  templateUrl: './create-event.component.html',
})
export class CreateEventComponent implements OnInit {
  readonly clubId = input.required<string>();
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  private readonly bookCoverService = inject(BookCoverService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showAfterVenue = signal(false);
  readonly isFetchingCover = signal(false);
  readonly coverFetchFailed = signal(false);
  private readonly _quizzesResource = resource({
    params: () => ({ clubId: this.clubId() }),
    loader: ({ params }) => this.quizService.getClubQuizzes(params.clubId),
  });
  readonly activeQuizzes = computed(() =>
    (this._quizzesResource.value() ?? []).filter(
      q => q.status === 'active' || q.status === 'live',
    ),
  );
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description: [''],
    date: ['', Validators.required],
    city: ['', Validators.required],
    address: [''],
    lat: [null as number | null],
    lng: [null as number | null],
    theme: [''],
    tagsRaw: [''],
    durationMinutes: [null as number | null, [Validators.min(15), Validators.max(480)]],
    afterVenueName: [''],
    afterVenueAddress: [''],
    afterVenueDescription: [''],
    coverUrl: [''],
    bookTitle: [''],
    quizId: [null as string | null],
  });
  ngOnInit(): void {
    this.form.controls.bookTitle.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      filter(v => v.length > 2),
      tap(() => { this.isFetchingCover.set(true); this.coverFetchFailed.set(false); }),
      switchMap(title => this.bookCoverService.fetchCover$(title)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(url => {
      this.isFetchingCover.set(false);
      if (url && !this.form.controls.coverUrl.value) {
        this.form.controls.coverUrl.setValue(url);
      } else if (!url) {
        this.coverFetchFailed.set(true);
      }
    });
  }
  onAddressSelect(suggestion: GeocodeSuggestion): void {
    this.form.patchValue({
      city: suggestion.city ?? suggestion.label,
      address: suggestion.label,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
  }
  toggleAfterVenue(): void {
    this.showAfterVenue.update(v => !v);
    if (!this.showAfterVenue()) {
      this.form.patchValue({ afterVenueName: '', afterVenueAddress: '', afterVenueDescription: '' });
    }
  }
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const v = this.form.getRawValue();
    const tags = v.tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const afterMeetingVenue = this.showAfterVenue() && v.afterVenueName
      ? { name: v.afterVenueName, address: v.afterVenueAddress, description: v.afterVenueDescription || undefined }
      : undefined;
    try {
      const created = await this.eventService.createEvent(this.clubId(), {
        title: v.title,
        description: v.description || undefined,
        date: new Date(v.date).toISOString(),
        city: v.city,
        address: v.address || undefined,
        lat: v.lat ?? undefined,
        lng: v.lng ?? undefined,
        theme: v.theme || undefined,
        tags,
        durationMinutes: v.durationMinutes ?? undefined,
        afterMeetingVenue,
        coverUrl: v.coverUrl || null,
        bookTitle: v.bookTitle || null,
        quizId: v.quizId ?? null,
      });
      await this.router.navigate(['/events', created.id]);
    } catch {
      this.errorMessage.set('Failed to create event. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
````

## File: src/app/core/api/api-mappers.ts
````typescript
import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';
import { BanDuration, BanRecord, Club, ClubMemberDetail, ClubStatus } from '../models/club.model';
import { AfterMeetingVenue, ClubEvent, EventStatus } from '../models/event.model';
export interface ApiUserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  socials?: ApiUserSocials | null;
  socialsPublic?: boolean;
}
export type ApiUserSocials = { [K in keyof UserSocials]?: string | null };
export interface ApiUserStats {
  clubsJoined: number;
  quizzesTaken: number;
  quizWins: number;
  likesReceived: number;
  booksRead: number;
}
export interface ApiClub {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  organizerId: string;
  isPublic: boolean;
  memberCount: number;
  memberPreviews: string[];
  createdAt: string;
  city: string | null;
  nextMeetingDate: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  currentBook: string | null;
  status: ClubStatus;
  tags: string[];
  meetingDurationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  cancelledAt?: string | null;
}
export interface ApiClubMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'organizer' | 'member';
  socials?: ApiUserSocials | null;
  socialsPublic?: boolean;
}
export interface ApiBanRecord {
  userId: string;
  clubId: string;
  bannedAt: string;
  duration: BanDuration;
  bannedBy: string;
}
export interface ApiEvent {
  id: string;
  clubId: string;
  clubName: string;
  organizerId: string;
  title: string;
  description: string | null;
  date: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: EventStatus;
  cancelledAt?: string | null;
  coverUrl?: string | null;
  theme: string | null;
  tags: string[];
  durationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  attendeeCount: number;
  isAttending: boolean;
  bookTitle?: string | null;
  quizId?: string | null;
}
export function mapUserProfile(raw: ApiUserProfile): UserProfile {
  return {
    id: raw.id,
    role: raw.role,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
    createdAt: raw.createdAt,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socialsPublic ?? false,
  };
}
export function mapUserStats(raw: ApiUserStats): UserStats {
  return {
    clubsJoined: raw.clubsJoined,
    quizzesTaken: raw.quizzesTaken,
    quizWins: raw.quizWins,
    likesReceived: raw.likesReceived,
    booksRead: raw.booksRead,
  };
}
export function mapClub(raw: ApiClub): Club {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    coverUrl: raw.coverUrl,
    organizerId: raw.organizerId,
    isPublic: raw.isPublic,
    memberCount: raw.memberCount,
    memberPreviews: raw.memberPreviews ?? [],
    createdAt: raw.createdAt,
    city: raw.city ?? '',
    nextMeetingDate: raw.nextMeetingDate,
    address: raw.address,
    lat: raw.lat,
    lng: raw.lng,
    theme: raw.theme,
    currentBook: raw.currentBook ? { title: raw.currentBook, author: '', description: '' } : null,
    status: raw.status,
    tags: raw.tags ?? [],
    meetingDurationMinutes: raw.meetingDurationMinutes,
    afterMeetingVenue: raw.afterMeetingVenue,
    cancelledAt: raw.cancelledAt ?? undefined,
  };
}
export function mapEvent(raw: ApiEvent): ClubEvent {
  return {
    id: raw.id,
    clubId: raw.clubId,
    clubName: raw.clubName,
    organizerId: raw.organizerId,
    title: raw.title,
    description: raw.description,
    date: raw.date,
    city: raw.city,
    address: raw.address,
    lat: raw.lat,
    lng: raw.lng,
    status: raw.status,
    cancelledAt: raw.cancelledAt ?? undefined,
    coverUrl: raw.coverUrl ?? null,
    theme: raw.theme,
    tags: raw.tags ?? [],
    durationMinutes: raw.durationMinutes,
    afterMeetingVenue: raw.afterMeetingVenue,
    attendeeCount: raw.attendeeCount,
    isAttending: raw.isAttending,
    bookTitle: raw.bookTitle ?? null,
    quizId: raw.quizId ?? null,
  };
}
export function mapClubMember(raw: ApiClubMember): ClubMemberDetail {
  return {
    userId: raw.userId,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
    role: raw.role,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socialsPublic ?? false,
  };
}
export function mapBanRecord(raw: ApiBanRecord): BanRecord {
  return {
    userId: raw.userId,
    clubId: raw.clubId,
    bannedAt: raw.bannedAt,
    duration: raw.duration,
    bannedBy: raw.bannedBy,
  };
}
function mapSocials(raw: ApiUserSocials): UserSocials {
  return {
    telegram: raw.telegram ?? undefined,
    instagram: raw.instagram ?? undefined,
    twitter: raw.twitter ?? undefined,
    linkedin: raw.linkedin ?? undefined,
    github: raw.github ?? undefined,
    goodreads: raw.goodreads ?? undefined,
  };
}
````

## File: src/app/core/services/club.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiClub, ApiClubMember, ApiBanRecord, ApiEvent, mapClub, mapClubMember, mapBanRecord, mapEvent } from '../api/api-mappers';
import { AuthService } from '../auth/auth.service';
import { BanDuration, BanRecord, Club, ClubMemberDetail } from '../models/club.model';
import { ClubEvent } from '../models/event.model';
@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly _clubs = signal<Club[]>([]);
  private readonly _myClubs = signal<Club[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _cityFilter = signal<string | null>(null);
  readonly clubs = this._clubs.asReadonly();
  readonly myClubs = this._myClubs.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly myOwnedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    return this._clubs().filter(c => c.organizerId === userId);
  });
  readonly myOwnedClubIds = computed<Set<string>>(() =>
    new Set(this.myOwnedClubs().map(c => c.id)),
  );
  readonly myClubIds = computed(() => new Set(this._myClubs().map(c => c.id)));
  readonly availableCities = computed<string[]>(() => {
    const cities = [...new Set(this._clubs().map(c => c.city).filter(Boolean))];
    return cities.sort((a, b) => a.localeCompare(b));
  });
  readonly filteredClubs = computed(() => {
    const q = this._searchQuery().toLowerCase().trim();
    const city = this._cityFilter();
    let clubs = this._clubs();
    if (q) {
      clubs = clubs.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (city) {
      clubs = clubs.filter(c => c.city === city);
    }
    return clubs;
  });
  readonly upcomingByCity = computed<Record<string, Club[]>>(() => {
    const clubs = this.filteredClubs();
    return clubs.reduce<Record<string, Club[]>>((acc, club) => {
      const city = club.city || '';
      if (!acc[city]) acc[city] = [];
      acc[city].push(club);
      return acc;
    }, {});
  });
  readonly myParticipatedClubs = computed<Club[]>(() => []);
  readonly myMissedClubs = computed<Club[]>(() => []);
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }
  setCityFilter(city: string | null): void {
    this._cityFilter.set(city);
  }
  async loadPublicClubs(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub[]>(`${environment.apiUrl}/clubs`),
      );
      this._clubs.set(raw.map(mapClub));
    } catch {
      this._error.set('Failed to load clubs');
    } finally {
      this._isLoading.set(false);
    }
  }
  async loadMyClubs(): Promise<void> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub[]>(`${environment.apiUrl}/clubs/my`),
      );
      this._myClubs.set(raw.map(mapClub));
    } catch {
      this._error.set('Failed to load my clubs');
    }
  }
  async getClubById(id: string): Promise<Club | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub>(`${environment.apiUrl}/clubs/${id}`),
      );
      return mapClub(raw);
    } catch {
      return null;
    }
  }
  async createClub(payload: {
    name: string;
    description: string;
    isPublic: boolean;
    coverUrl?: string | null;
    city?: string;
    tags?: string[];
    meetingDurationMinutes?: number | null;
    afterMeetingVenue?: { name: string; address: string; description: string } | null;
  }): Promise<Club> {
    const raw = await firstValueFrom(
      this.http.post<ApiClub>(`${environment.apiUrl}/clubs`, {
        name: payload.name,
        description: payload.description,
        isPublic: payload.isPublic,
        coverUrl: payload.coverUrl ?? null,
        city: payload.city,
        tags: payload.tags,
        meetingDurationMinutes: payload.meetingDurationMinutes,
        afterMeetingVenue: payload.afterMeetingVenue,
      }),
    );
    const club = mapClub(raw);
    this._clubs.update(existing => [club, ...existing]);
    this._myClubs.update(existing => [club, ...existing]);
    return club;
  }
  async updateClub(clubId: string, payload: {
    name: string;
    description: string;
    isPublic: boolean;
    city?: string;
    coverUrl?: string | null;
  }): Promise<Club> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}`, payload),
    );
    const club = mapClub(raw);
    this._clubs.update(list => list.map(c => (c.id === clubId ? club : c)));
    this._myClubs.update(list => list.map(c => (c.id === clubId ? club : c)));
    return club;
  }
  async joinClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<{ memberCount: number }>(`${environment.apiUrl}/clubs/${clubId}/join`, {}),
    );
    this._clubs.update(list =>
      list.map(c => (c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c)),
    );
    const club = this._clubs().find(c => c.id === clubId);
    if (club && !this.myClubIds().has(clubId)) {
      this._myClubs.update(list => [club, ...list]);
    }
  }
  async leaveClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}/leave`),
    );
    this._clubs.update(list =>
      list.map(c =>
        c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c,
      ),
    );
    this._myClubs.update(list => list.filter(c => c.id !== clubId));
  }
  async getClubMembers(clubId: string): Promise<ClubMemberDetail[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiClubMember[]>(`${environment.apiUrl}/clubs/${clubId}/members`),
    );
    return raw.map(mapClubMember);
  }
  async kickMember(clubId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}/members/${userId}`),
    );
  }
  async banMember(clubId: string, userId: string, duration: BanDuration): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/clubs/${clubId}/members/${userId}/ban`, { duration }),
    );
  }
  async getBans(clubId: string): Promise<BanRecord[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiBanRecord[]>(`${environment.apiUrl}/clubs/${clubId}/bans`),
    );
    return raw.map(mapBanRecord);
  }
  async loadClubEvents(clubId: string): Promise<ClubEvent[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiEvent[]>(`${environment.apiUrl}/clubs/${clubId}/events`),
    );
    return raw.map(mapEvent);
  }
  async pauseClub(clubId: string): Promise<void> {
    await this.patchClubAndSync(clubId, 'pause');
  }
  async cancelClub(clubId: string): Promise<void> {
    await this.patchClubAndSync(clubId, 'cancel');
  }
  async rescheduleMeeting(clubId: string, newDate: string): Promise<void> {
    await this.patchClubAndSync(clubId, 'reschedule', { newDate });
  }
  private async patchClubAndSync(clubId: string, action: string, body: object = {}): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/${action}`, body),
    );
    const updated = mapClub(raw);
    this._clubs.update(list => list.map(c => (c.id === clubId ? updated : c)));
  }
  msUntilDeletion(club: Club): number | null {
    if (club.status !== 'cancelled' || !club.cancelledAt) return null;
    const deletionTime = new Date(club.cancelledAt).getTime() + 24 * 60 * 60 * 1000;
    const remaining = deletionTime - Date.now();
    return remaining > 0 ? remaining : null;
  }
}
````

## File: src/app/features/clubs/club-detail/club-detail.component.html
````html
@if (isLoading()) {
  <main class="page-max-w px-6 py-8" aria-busy="true" aria-label="Loading club details">
    <div class="animate-pulse space-y-4">
      <div class="h-56 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </main>
} @else if (errorMessage()) {
  <main class="page-max-w px-6 py-8 text-center" role="alert">
    <p class="text-6xl mb-4" aria-hidden="true">😕</p>
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{{ 'CLUB_DETAIL.not_found' | translate }}</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-6">{{ errorMessage() }}</p>
    <a
      hlmBtn
      routerLink="/clubs"
      class="bg-primary-600 hover:bg-primary-700 text-white"
    >
      ← {{ 'CLUB_DETAIL.back' | translate }}
    </a>
  </main>
} @else if (club()) {
  <main class="min-h-screen">
    <div class="relative parchment-hero">
      @if (club()!.coverUrl) {
        <img
          [src]="club()!.coverUrl"
          [alt]="club()!.name + ' cover'"
          class="w-full h-64 object-cover"
          loading="lazy"
        />
      } @else {
        <div class="bg-gradient-fantasy h-64" aria-hidden="true"></div>
      }
      <div class="absolute inset-0 flex items-end justify-center pointer-events-none px-6 pb-8">
        <h1 class="font-fantasy font-bold text-white uppercase tracking-widest text-4xl sm:text-5xl lg:text-6xl text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
          {{ club()!.name }}
        </h1>
      </div>
      <nav [attr.aria-label]="'CLUB_DETAIL.back' | translate" class="absolute top-4 left-4">
        <a
          routerLink="/clubs"
          class="inline-flex items-center gap-1.5 rounded-full parchment-card px-3 py-1.5 text-sm font-medium text-[var(--color-ink)] hover:scale-105 transition-all duration-200"
          [attr.aria-label]="'CLUB_DETAIL.back' | translate"
        >
          ← {{ 'CLUB_DETAIL.back_short' | translate }}
        </a>
      </nav>
    </div>
    <div class="page-max-w px-6 py-8">
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <aside class="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4 lg:sticky lg:top-24 self-start order-2 lg:order-1">
          @if (nearestEventBook()) {
            <div hlmCard class="parchment-card-sunken p-4 gap-3">
              <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">📖 {{ 'CLUB_DETAIL.now_reading' | translate }}</h3>
              @if (nearestEventBook()!.coverUrl) {
                <img
                  [src]="nearestEventBook()!.coverUrl!"
                  [alt]="nearestEventBook()!.title"
                  class="w-full rounded-xl object-cover mb-3 max-h-40"
                />
              }
              <p class="font-serif italic text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                {{ nearestEventBook()!.title }}
              </p>
              @if (nearestEventBook()!.author) {
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ nearestEventBook()!.author }}</p>
              }
            </div>
          }
          @if (isClubOwner()) {
            <app-club-manage-panel [clubId]="id()" />
          }
        </aside>
        <div class="flex-1 min-w-0 flex flex-col gap-8 order-1 lg:order-2">
          <app-club-header
            [club]="club()!"
            [isMember]="isMember()"
            [isOwner]="isClubOwner()"
            [isAuthenticated]="!!currentUser()"
            [isActionLoading]="isActionLoading()"
            (leave)="onLeave()" />
          @if (actionError()) {
            <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{{ actionError() }}</span>
            </div>
          }
          @if (club()!.description) {
            <section hlmCard class="parchment-card-sunken px-6 gap-3">
              <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{{ 'CLUB_DETAIL.about' | translate }}</h2>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ club()!.description }}</p>
            </section>
          }
          @if (isMember() || isClubOwner()) {
            <app-book-vote-section
              [clubId]="id()"
              [isOwner]="isClubOwner()"
              [isMember]="isMember()"
            />
          }
          @if (!!currentUser() && !isMember() && !isClubOwner()) {
            <div class="rounded-2xl border-2 border-dashed border-[var(--color-sepia)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-surface-raised)]">
              <div>
                <p class="font-semibold text-[var(--color-ink)]">{{ 'CLUB_DETAIL.join_cta_title' | translate }}</p>
                <p class="text-sm text-[var(--color-ink-muted)] mt-0.5">{{ 'CLUB_DETAIL.join_cta_desc' | translate }}</p>
              </div>
              <button
                hlmBtn
                type="button"
                (click)="onJoin()"
                [disabled]="isActionLoading()"
                class="flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white"
              >
                {{ 'CLUB_DETAIL.join' | translate }}
              </button>
            </div>
          }
          <section hlmCard class="parchment-card px-6 gap-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                📅 {{ 'CLUB_DETAIL.events_title' | translate }}
              </h2>
              @if (isClubOwner()) {
                <a
                  hlmBtn
                  size="sm"
                  [routerLink]="['/clubs', id(), 'events', 'create']"
                  class="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {{ 'CLUB_DETAIL.create_event' | translate }}
                </a>
              }
            </div>
            @if (upcomingEvents().length > 1) {
              <div class="flex flex-wrap gap-2 mb-5">
                @for (opt of sortOptions; track opt.key) {
                  <button
                    type="button"
                    (click)="sortKey.set(opt.key)"
                    class="rounded-full px-3 py-1 text-xs font-medium border transition-colors"
                    [class]="sortKey() === opt.key
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)] shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'"
                  >
                    {{ opt.labelKey | translate }}
                  </button>
                }
              </div>
            }
            @if (upcomingEvents().length === 0) {
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                {{ 'CLUB_DETAIL.events_empty' | translate }}
              </p>
            } @else {
              <div class="grid gap-5 sm:grid-cols-2">
                @for (event of sortedUpcomingEvents(); track event.id; let i = $index) {
                  <app-club-event-card
                    [event]="event"
                    [isAuthenticated]="!!currentUser()"
                    [attending]="attendingEventId() === event.id"
                    [index]="i"
                    (attend)="onAttend(event.id)"
                    (cancelAttend)="onCancelAttend(event.id)"
                  />
                }
              </div>
            }
          </section>
          <app-club-members-list
            [members]="members()"
            [clubBans]="clubBans()"
            [isOwner]="isClubOwner()"
            [currentUserId]="currentUserId()"
            (kick)="handleKick($event)"
            (ban)="handleBan($event)" />
          <footer class="text-xs text-gray-400 dark:text-gray-600 text-right">
            {{ 'CLUB_DETAIL.created' | translate }} {{ club()!.createdAt | formatDate }}
          </footer>
        </div>
        <aside class="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4 lg:sticky lg:top-24 self-start order-3 lg:order-3">
          <app-club-sidebar-right
            [club]="club()!"
            [organizerProfile]="organizerProfile()"
          />
        </aside>
      </div>
    </div>
  </main>
}
````

## File: src/app/features/clubs/club-detail/club-detail.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
  linkedSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration } from '../../../core/models/club.model';
import { ClubEvent } from '../../../core/models/event.model';
import { UserProfile } from '../../../core/models/user.model';
import { EventService } from '../../../core/services/event.service';
import { SeoService } from '../../../core/services/seo.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubMembersListComponent } from './members/club-members-list.component';
import { ClubHeaderComponent } from './header/club-header.component';
import { ClubManagePanelComponent } from './manage-panel/club-manage-panel.component';
import { ClubEventCardComponent } from './club-event-card/club-event-card.component';
import { ClubSidebarRightComponent } from './club-sidebar-right/club-sidebar-right.component';
import { BookVoteSectionComponent } from './book-vote/book-vote-section.component';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCard } from '../../../shared/spartan/card/src';
@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    FormatDatePipe,
    ClubMembersListComponent,
    ClubHeaderComponent,
    ClubManagePanelComponent,
    ClubEventCardComponent,
    ClubSidebarRightComponent,
    BookVoteSectionComponent,
    HlmButton,
    HlmCard,
  ],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  readonly id = input.required<string>();
  private readonly clubService = inject(ClubService);
  private readonly eventService = inject(EventService);
  private readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);
  private readonly _lang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: this.translate.currentLang ?? 'uk' },
  );
  readonly currentUser = this.auth.currentUser;
  readonly club = signal<Club | null>(null);
  readonly members = signal<ClubMemberDetail[]>([]);
  readonly clubBans = signal<BanRecord[]>([]);
  readonly events = signal<ClubEvent[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly attendingEventId = signal<string | null>(null);
  readonly sortKey = linkedSignal<'date' | 'popular' | 'status'>(() => {
    this.id();
    return 'date';
    });
  readonly sortOptions = [
    { key: 'date' as const,    labelKey: 'CLUB_DETAIL.sort_nearest' },
    { key: 'popular' as const, labelKey: 'CLUB_DETAIL.sort_popular' },
    { key: 'status' as const,  labelKey: 'CLUB_DETAIL.sort_status'  },
  ];
  readonly isMember = computed(() => this.clubService.myClubIds().has(this.id()));
  readonly isClubOwner = computed(
    () => this.auth.currentUser()?.id === this.club()?.organizerId && !!this.auth.currentUser(),
  );
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly organizerProfile = computed<UserProfile | null>(() => {
    const organizerId = this.club()?.organizerId;
    if (!organizerId) return null;
    const organizer = this.members().find(m => m.role === 'organizer');
    if (!organizer) return null;
    return {
      id: organizerId,
      displayName: organizer.displayName,
      avatarUrl: organizer.avatarUrl,
      role: 'user',
      createdAt: '',
      socials: organizer.socials,
      socialsPublic: organizer.socialsPublic,
    } satisfies UserProfile;
  });
  readonly upcomingEvents = computed(() =>
    this.events().filter(e => e.status === 'scheduled' || e.status === 'active'),
  );
  readonly sortedUpcomingEvents = computed(() => {
    const events = this.upcomingEvents();
    const key = this.sortKey();
    if (key === 'popular') {
      return [...events].sort((a, b) => b.attendeeCount - a.attendeeCount);
    }
    if (key === 'status') {
      const order: Record<string, number> = { active: 0, scheduled: 1, rescheduled: 2 };
      return [...events].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    }
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  });
  readonly nearestEventBook = computed<{ title: string; author: string; description: string; coverUrl: string | null } | null>(() => {
    const nearest = [...this.events()]
      .filter(e => e.status === 'upcoming' || e.status === 'scheduled' || e.status === 'active')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const title = nearest?.bookTitle;
    if (title) return { title, author: '', description: '', coverUrl: nearest.coverUrl ?? null };
    const cb = this.club()?.currentBook;
    return cb ? { ...cb, coverUrl: null } : null;
  });
  readonly deleteCountdown = computed<string | null>(() => {
    const club = this.club();
    if (!club) return null;
    const ms = this.clubService.msUntilDeletion(club);
    if (ms === null) return null;
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours} год ${minutes} хв` : `${hours} год`;
    }
    return `${totalMinutes} хв`;
  });
  constructor() {
    effect((onCleanup) => {
      const clubId = this.id();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      this.loadClub(clubId, () => cancelled).catch((_err: unknown) => { /* swallow */ });
    });
  }
  private async loadClub(clubId: string, isCancelled: () => boolean): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      if (this.auth.isAuthenticated() && this.clubService.myClubs().length === 0) {
        await this.clubService.loadMyClubs();
      }
      if (isCancelled()) return;
      const found = await this.clubService.getClubById(clubId);
      if (isCancelled()) return;
      if (found) {
        this.club.set(found);
        const [members, events] = await Promise.all([
          this.clubService.getClubMembers(clubId),
          this.clubService.loadClubEvents(clubId),
        ]);
        if (isCancelled()) return;
        this.members.set(members);
        this.events.set(events);
        if (this.auth.currentUser()?.id === found.organizerId) {
          this.clubBans.set(await this.clubService.getBans(clubId));
        }
        this.seo.setPageI18n('SEO.club_detail_title', {
          ogTitleKey: 'SEO.club_detail_og_title',
          params: { name: found.name },
        });
      } else {
        this.errorMessage.set('This club could not be found.');
      }
    } catch {
      if (!isCancelled()) this.errorMessage.set('Failed to load club details.');
    } finally {
      if (!isCancelled()) this.isLoading.set(false);
    }
  }
  async onJoin(): Promise<void> {
    await this.performMembershipAction(() => this.clubService.joinClub(this.id()), 'Failed to join club');
  }
  async onLeave(): Promise<void> {
    await this.performMembershipAction(() => this.clubService.leaveClub(this.id()), 'Failed to leave club');
  }
  async handleKick(userId: string): Promise<void> {
    await this.clubService.kickMember(this.id(), userId);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }
  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    await this.clubService.banMember(this.id(), event.userId, event.duration);
    this.members.update(list => list.filter(m => m.userId !== event.userId));
  }
  async onAttend(eventId: string): Promise<void> {
    await this.performAttendanceAction(eventId, true);
  }
  async onCancelAttend(eventId: string): Promise<void> {
    await this.performAttendanceAction(eventId, false);
  }
  private async performMembershipAction(action: () => Promise<void>, errorFallback: string): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await action();
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : errorFallback);
    } finally {
      this.isActionLoading.set(false);
    }
  }
  private async performAttendanceAction(eventId: string, attending: boolean): Promise<void> {
    this.attendingEventId.set(eventId);
    try {
      if (attending) {
        await this.eventService.attendEvent(eventId);
      } else {
        await this.eventService.cancelAttendance(eventId);
      }
      this.events.update(list =>
        list.map(e =>
          e.id === eventId
            ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) }
            : e,
        ),
      );
    } finally {
      this.attendingEventId.set(null);
    }
  }
}
````
