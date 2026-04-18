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
        chat.model.ts
        club.model.ts
        quiz.model.ts
        randomizer.model.ts
        user.model.ts
      services/
        chat.service.ts
        club.service.ts
        quiz.service.ts
        randomizer.service.ts
        seo.service.ts
        toast.service.ts
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
          schedule/
            club-schedule.component.html
            club-schedule.component.ts
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
        clubs.routes.ts
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
        quiz-list/
          quiz-list.component.html
          quiz-list.component.ts
        quiz-take/
          quiz-take.component.html
          quiz-take.component.ts
        .gitkeep
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
        book-intro/
          book-intro.component.ts
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
        toast/
          toast.component.html
          toast.component.ts
        .gitkeep
      pipes/
        format-date.pipe.ts
        initials.pipe.ts
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
.claudignore
.editorconfig
.gitignore
.gitleaks.toml
.lighthouserc.json
.lintstagedrc.cjs
.mcp.json
angular.json
CLAUDE.md
eslint.config.js
karma.conf.js
package.json
README.md
repomix.config.json
SECURITY.md
sonar-project.properties
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.spec.json
vercel.json
```

# Files

## File: .claude/settings.local.json
````json
{
  "permissions": {
    "allow": [
      "mcp__book-club-agents__list_agents",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\('SCRIPTS:', json.dumps\\(d.get\\('scripts',{}\\), indent=2\\)\\); print\\('DEPS:', list\\(d.get\\('dependencies',{}\\).keys\\(\\)\\)\\); print\\('DEV:', list\\(d.get\\('devDependencies',{}\\).keys\\(\\)\\)\\)\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\('husky version:', d.get\\('version'\\)\\)\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); proj=list\\(d['projects'].keys\\(\\)\\)[0]; arch=d['projects'][proj].get\\('architect',{}\\); test=arch.get\\('test',{}\\); print\\('TEST BUILDER:', test.get\\('builder'\\)\\); print\\('TEST OPTIONS:', json.dumps\\(test.get\\('options',{}\\), indent=2\\)\\)\")",
      "Bash(python3 -c ' *)",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\('MCP scripts:', json.dumps\\(d.get\\('scripts',{}\\), indent=2\\)\\)\")",
      "Bash(npm run *)",
      "Bash(npx tsc *)",
      "Bash(git commit *)",
      "Bash(npx repomix *)",
      "Bash(git add *)",
      "Bash(git push *)",
      "Bash(gh run *)",
      "Bash(gh workflow *)",
      "Bash(python3 -c \"import sys,json; runs=json.load\\(sys.stdin\\); [print\\(r['workflowName'], r['conclusion'], r['databaseId']\\) for r in runs]\")",
      "Bash(python3 -c \"import sys,json; runs=json.load\\(sys.stdin\\); [print\\(r['createdAt'][:10], r['workflowName'], r['conclusion']\\) for r in runs]\")",
      "Bash(gh api *)",
      "Bash(xargs cat *)",
      "WebFetch(domain:book-club-be.onrender.com)",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); [print\\(k, list\\(v.keys\\(\\)\\)[:5] if isinstance\\(v,dict\\) else '...'\\) for k,v in d.items\\(\\)]\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\(json.dumps\\({k:v for k,v in d.items\\(\\) if k in ['NAV','CLUBS','CLUB_DETAIL','PROFILE','AUTH']}, indent=2, ensure_ascii=False\\)\\)\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); print\\(json.dumps\\({k:v for k,v in d.items\\(\\) if k in ['CLUBS','PROFILE','AUTH']}, indent=2, ensure_ascii=False\\)\\)\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); proj=list\\(d['projects'].keys\\(\\)\\)[0]; build=d['projects'][proj]['architect']['build']; print\\('builder:', build['builder']\\); print\\('options keys:', list\\(build.get\\('options',{}\\).keys\\(\\)\\)[:10]\\)\")",
      "Bash(python3 -c \"import json,sys; d=json.load\\(sys.stdin\\); deps={**d.get\\('dependencies',{}\\),**d.get\\('devDependencies',{}\\)}; [print\\(k,':',v\\) for k in ['@angular/core','@angular/common','@ngx-translate/core','@ngx-translate/http-loader'] if k in deps]\")",
      "Bash(python3 *)",
      "Bash(gh pr *)",
      "Bash(npm install *)",
      "Bash(node *)",
      "Bash(npm info *)",
      "Bash(npm --version)",
      "Bash(git stash *)",
      "Bash(git checkout *)",
      "Bash(git -C /home/test/Documents/angular/book-club-fe status)",
      "Bash(git -C /home/test/Documents/angular/book-club-fe branch)",
      "Bash(git -C /home/test/Documents/angular/book-club-fe ls-files)",
      "Bash(git -C /home/test/Documents/angular/book-club-fe log --oneline -5)",
      "Bash(git -C /home/test/Documents/angular/book-club-fe checkout chore/remove-qodana)",
      "Bash(npm test *)",
      "Bash(git pull *)",
      "Bash(git *)",
      "Bash(grep -v \"^$\")",
      "Bash(curl -s \"https://sonarcloud.io/api/qualitygates/project_status?projectKey=leo477_book-club-fe\")",
      "Bash(curl -s \"https://sonarcloud.io/api/issues/search?projectKeys=leo477_book-club-fe&resolved=false&types=BUG,VULNERABILITY,CODE_SMELL&severities=BLOCKER,CRITICAL,MAJOR&ps=20\")",
      "Bash(curl -s \"https://sonarcloud.io/api/issues/search?projectKeys=leo477_book-club-fe&resolved=false&ps=50\")",
      "Bash(curl -s \"https://sonarcloud.io/api/issues/search?projectKeys=leo477_book-club-fe&resolved=false&sinceLeakPeriod=true&ps=50\")"
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "book-club-agents"
  ]
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
          node-version: 20
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

## File: .husky/pre-commit
````
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
````

## File: public/robots.txt
````
User-agent: *
Allow: /
Disallow: /manage/
Sitemap: https://book-club-fe.vercel.app/sitemap.xml
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

## File: src/app/core/api/api-error.util.ts
````typescript
import { HttpErrorResponse } from '@angular/common/http';
export function extractApiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return (err.error as { detail?: string })?.detail ?? err.message ?? 'Unknown error';
  }
  return 'Unknown error';
}
````

## File: src/app/core/api/api-mappers.ts
````typescript
import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';
import { AfterMeetingVenue, BanDuration, BanRecord, Club, ClubBook, ClubMemberDetail, ClubStatus } from '../models/club.model';
export interface ApiUserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  socials?: ApiUserSocials | null;
  socials_public?: boolean;
}
export interface ApiUserSocials {
  telegram?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  github?: string | null;
  goodreads?: string | null;
}
export interface ApiUserStats {
  clubs_joined: number;
  clubs_organized: number;
  meetings_attended: number;
  quizzes_taken: number;
}
export interface ApiClub {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  organizer_id: string;
  is_public: boolean;
  member_count: number;
  created_at: string;
  city: string | null;
  next_meeting_date: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  current_book: string | null;
  member_previews: string[];
  status: ClubStatus;
  tags: string[];
  meeting_duration_minutes: number | null;
  after_meeting_venue: AfterMeetingVenue | null;
  cancelled_at?: string | null;
}
export interface ApiClubMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'organizer' | 'member';
  socials?: ApiUserSocials | null;
  socials_public?: boolean;
}
export interface ApiBanRecord {
  user_id: string;
  club_id: string;
  banned_at: string;
  duration: BanDuration;
  banned_by: string;
}
export function mapUserProfile(raw: ApiUserProfile): UserProfile {
  return {
    id: raw.id,
    role: raw.role,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    createdAt: raw.created_at,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socials_public ?? false,
  };
}
export function mapUserStats(raw: ApiUserStats): UserStats {
  return {
    clubsJoined: raw.clubs_joined,
    quizzesTaken: raw.quizzes_taken,
    quizWins: 0,
    likesReceived: 0,
    booksRead: 0,
  };
}
export function mapClub(raw: ApiClub): Club {
  let currentBook: ClubBook | null = null;
  if (raw.current_book) {
    currentBook = { title: raw.current_book, author: '', description: '' };
  }
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    coverUrl: raw.cover_url,
    organizerId: raw.organizer_id,
    isPublic: raw.is_public,
    memberCount: raw.member_count,
    createdAt: raw.created_at,
    city: raw.city ?? '',
    nextMeetingDate: raw.next_meeting_date,
    address: raw.address,
    lat: raw.lat,
    lng: raw.lng,
    theme: raw.theme,
    currentBook,
    memberPreviews: raw.member_previews,
    status: raw.status,
    tags: raw.tags,
    meetingDurationMinutes: raw.meeting_duration_minutes,
    afterMeetingVenue: raw.after_meeting_venue,
    cancelledAt: raw.cancelled_at ?? undefined,
  };
}
export function mapClubMember(raw: ApiClubMember): ClubMemberDetail {
  return {
    userId: raw.user_id,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    role: raw.role,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socials_public ?? false,
  };
}
export function mapBanRecord(raw: ApiBanRecord): BanRecord {
  return {
    userId: raw.user_id,
    clubId: raw.club_id,
    bannedAt: raw.banned_at,
    duration: raw.duration,
    bannedBy: raw.banned_by,
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

## File: src/app/core/auth/token.store.ts
````typescript
import { Injectable, signal } from '@angular/core';
const TOKEN_KEY = 'bc_access_token';
@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly token = this._token.asReadonly();
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }
  snapshot(): string | null {
    return this._token();
  }
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
}
export interface ChatRoom {
  id: string;
  name: string;
}
````

## File: src/app/core/models/quiz.model.ts
````typescript
export interface Quiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
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
````

## File: src/app/features/clubs/club-detail/header/club-header.component.html
````html
<header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
  <div>
    <div class="flex items-center gap-3 flex-wrap">
      <h1 id="club-heading" class="font-display text-3xl font-bold text-gray-900 dark:text-white">
        {{ club().name }}
      </h1>
      @if (!club().isPublic) {
        <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          🔒 {{ 'CLUB_DETAIL.private' | translate }}
        </span>
      }
      @if (club().status === 'active') {
        <span class="rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
          ● {{ 'CLUBS.active' | translate }}
        </span>
      } @else if (club().status === 'paused') {
        <span class="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
          ⏸ {{ 'CLUBS.paused' | translate }}
        </span>
      } @else if (club().status === 'cancelled') {
        <span class="rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
          ✕ {{ 'CLUBS.cancelled' | translate }}
        </span>
      }
    </div>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
      <span aria-hidden="true">👥</span>
      <span>{{ club().memberCount }} {{ club().memberCount === 1 ? ('CLUBS.member_singular' | translate) : ('CLUBS.members' | translate) }}</span>
    </p>
  </div>
  @if (isAuthenticated()) {
    @if (!isOwner()) {
      @if (isMember()) {
        <button
          type="button"
          (click)="leave.emit()"
          [disabled]="isActionLoading()"
          class="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          [attr.aria-label]="'CLUB_DETAIL.leave' | translate"
        >
          @if (isActionLoading()) {
            <app-loading-spinner size="sm" />
          }
          {{ 'CLUB_DETAIL.leave' | translate }}
        </button>
      } @else {
        <button
          type="button"
          (click)="join.emit()"
          [disabled]="isActionLoading()"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          [attr.aria-label]="'CLUB_DETAIL.join' | translate"
        >
          @if (isActionLoading()) {
            <app-loading-spinner size="sm" />
          }
          {{ 'CLUB_DETAIL.join' | translate }}
        </button>
      }
    } @else {
      <span class="inline-flex items-center gap-1.5 rounded-xl bg-accent-100 dark:bg-accent-900/30 px-4 py-2.5 text-sm font-semibold text-accent-700 dark:text-accent-300">
        {{ 'CLUB_DETAIL.organizer_badge' | translate }}
      </span>
    }
  }
</header>
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
import { UserProfile } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
@Component({
  selector: 'app-club-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, LoadingSpinnerComponent],
  templateUrl: './club-header.component.html',
})
export class ClubHeaderComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwner = input.required<boolean>();
  readonly isAuthenticated = input.required<boolean>();
  readonly isActionLoading = input.required<boolean>();
  readonly currentUser = input<UserProfile | null>(null);
  readonly join = output<void>();
  readonly leave = output<void>();
}
````

## File: src/app/features/clubs/club-detail/info/club-info.component.html
````html
@if (club().meetingDurationMinutes || club().address) {
  <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
    <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{{ 'CLUB_DETAIL.meeting_info_title' | translate }}</h2>
    <dl class="space-y-3">
      @if (club().meetingDurationMinutes) {
        <div class="flex items-center gap-3">
          <dt class="text-sm text-gray-500 dark:text-gray-400 w-28 flex-shrink-0">{{ 'CLUB_DETAIL.duration_label' | translate }}</dt>
          <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ club().meetingDurationMinutes }} {{ 'CLUB_DETAIL.minutes_abbr' | translate }}</dd>
        </div>
      }
      @if (club().address) {
        <div class="flex items-start gap-3">
          <dt class="text-sm text-gray-500 dark:text-gray-400 w-28 flex-shrink-0">{{ 'CLUB_DETAIL.address_label' | translate }}</dt>
          <dd class="text-sm text-gray-900 dark:text-white">
            {{ club().address }}
            <a [href]="'https://maps.google.com/search?q=' + club().address"
               target="_blank" rel="noopener noreferrer"
               class="ml-2 text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {{ 'CLUB_DETAIL.view_on_map' | translate }}
            </a>
          </dd>
        </div>
      }
    </dl>
  </section>
}
@if (club().afterMeetingVenue) {
  <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
    <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{{ 'CLUB_DETAIL.after_meeting_title' | translate }}</h2>
    <div class="flex items-start gap-3">
      <span class="text-2xl" aria-hidden="true">☕</span>
      <div>
        <p class="font-semibold text-gray-900 dark:text-white">{{ club().afterMeetingVenue!.name }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ club().afterMeetingVenue!.address }}</p>
        @if (club().afterMeetingVenue!.description) {
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{{ club().afterMeetingVenue!.description }}</p>
        }
      </div>
    </div>
  </section>
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

## File: src/app/features/clubs/club-detail/manage-panel/club-manage-panel.component.html
````html
<div class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
  <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{{ 'CLUB_DETAIL.manage_title' | translate }}</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <a
      [routerLink]="['/clubs', clubId(), 'quizzes']"
      class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <span class="text-xl" aria-hidden="true">📝</span>
      <div>
        <p class="font-semibold">{{ 'CLUB_DETAIL.quizzes_title' | translate }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'CLUB_DETAIL.quizzes_desc' | translate }}</p>
      </div>
    </a>
    <a
      [routerLink]="['/clubs', clubId(), 'randomizer']"
      class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <span class="text-xl" aria-hidden="true">🎲</span>
      <div>
        <p class="font-semibold">{{ 'CLUB_DETAIL.randomizer_title' | translate }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ 'CLUB_DETAIL.randomizer_desc' | translate }}</p>
      </div>
    </a>
  </div>
</div>
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
@Component({
  selector: 'app-club-manage-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  templateUrl: './club-manage-panel.component.html',
})
export class ClubManagePanelComponent {
  readonly clubId = input.required<string>();
}
````

## File: src/app/features/clubs/club-detail/members/club-members-list.component.html
````html
<section [attr.aria-label]="'MEMBERS.title' | translate" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
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
                  type="button"
                  (click)="toggleQr(member.userId)"
                  class="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors ml-1"
                  [attr.aria-expanded]="showQrForUser() === member.userId"
                  [attr.aria-label]="'MEMBERS.show_qr' | translate"
                >
                  <span aria-hidden="true">⊡</span> {{ 'MEMBERS.show_qr' | translate }}
                </button>
                @if (showQrForUser() === member.userId) {
                  <dialog class="absolute right-0 top-full mt-2 z-20 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center gap-2"
                       aria-modal="false" [attr.aria-label]="member.displayName + ' QR'">
                    <p class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ member.displayName }}</p>
                    <app-qr-code [value]="buildQrValue(member)" [size]="160" />
                    <button type="button" (click)="toggleQr(member.userId)"
                            class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1">{{ 'CLUB_DETAIL.close_qr' | translate }}</button>
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
                <button type="button" (click)="kick.emit(member.userId)"
                        class="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                         [attr.aria-label]="'MEMBERS.kick' | translate">
                  {{ 'MEMBERS.kick' | translate }}
                </button>
                <button type="button" (click)="toggleBanMenu(member.userId)"
                        class="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        [attr.aria-expanded]="showBanMenu() === member.userId">
                  {{ 'MEMBERS.ban' | translate }}
                </button>
                @if (showBanMenu() === member.userId) {
                  <menu class="absolute right-0 top-full mt-1 z-30 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-36">
                    @for (duration of banDurations; track duration) {
                      <li>
                        <button type="button" (click)="emitBan(member.userId, duration)"
                                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
@Component({
  selector: 'app-club-members-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, QrCodeComponent, InitialsPipe],
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

## File: src/app/features/clubs/club-detail/schedule/club-schedule.component.html
````html
@if (isOwner()) {
  <section [attr.aria-label]="'CLUB_DETAIL.manage_title' | translate" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6 space-y-5">
    <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ 'CLUB_DETAIL.manage_title' | translate }}</h2>
    <div class="flex flex-wrap gap-3">
      @if (club()!.status === 'active') {
        <button
          type="button"
          (click)="pauseRequested.emit()"
          class="inline-flex items-center gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-yellow-900 transition-colors"
          [attr.aria-label]="'CLUB_DETAIL.pause' | translate"
        >
          ⏸ {{ 'CLUB_DETAIL.pause' | translate }}
        </button>
      }
      @if (club()!.status !== 'cancelled') {
        <button
          type="button"
          (click)="cancelRequested.emit()"
          class="inline-flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          [attr.aria-label]="'CLUB_DETAIL.cancel' | translate"
        >
          ✕ {{ 'CLUB_DETAIL.cancel' | translate }}
        </button>
      }
    </div>
    @if (club()!.status === 'paused') {
      <form
        (ngSubmit)="submitReschedule()"
        class="flex flex-col sm:flex-row items-start sm:items-end gap-3"
        [attr.aria-label]="'CLUB_DETAIL.reschedule' | translate"
      >
        <div class="flex flex-col gap-1.5 flex-1">
          <label
            for="reschedule-date"
            class="text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            {{ 'CLUB_DETAIL.new_date' | translate }}
          </label>
          <input
            id="reschedule-date"
            type="datetime-local"
            [formControl]="rescheduleDate"
            class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-required="true"
          />
        </div>
        <button
          type="submit"
          [disabled]="!rescheduleDate.value"
          class="inline-flex items-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          [attr.aria-label]="'CLUB_DETAIL.reschedule_submit' | translate"
        >
          ✓ {{ 'CLUB_DETAIL.reschedule_submit' | translate }}
        </button>
      </form>
    }
  </section>
}
````

## File: src/app/features/clubs/club-detail/schedule/club-schedule.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';
@Component({
  selector: 'app-club-schedule',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './club-schedule.component.html',
})
export class ClubScheduleComponent {
  readonly club = input.required<Club>();
  readonly isOwner = input.required<boolean>();
  readonly pauseRequested = output<void>();
  readonly cancelRequested = output<void>();
  readonly reschedule = output<string>();
  readonly rescheduleDate = new FormControl<string>('', { nonNullable: true });
  submitReschedule(): void {
    const date = this.rescheduleDate.value;
    if (!date) return;
    this.reschedule.emit(date);
    this.rescheduleDate.reset();
  }
}
````

## File: src/app/features/clubs/clubs-list/club-card/club-card.component.html
````html
<div class="rounded-2xl bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
  <div class="relative">
    @if (club().coverUrl) {
      <img [src]="club().coverUrl" [alt]="''" class="h-32 w-full object-cover" aria-hidden="true" loading="lazy" />
    } @else {
      <div class="h-32 bg-gradient-to-br from-primary-400 to-accent-500" aria-hidden="true"></div>
    }
    @if (club().theme) {
      <span class="absolute top-3 left-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:text-primary-300 shadow">
        {{ club().theme }}
      </span>
    }
    @if (club().status !== 'active') {
      <span class="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow"
            [class]="club().status === 'paused'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'">
        {{ club().status === 'paused' ? ('CLUBS.paused' | translate) : ('CLUBS.cancelled' | translate) }}
      </span>
    }
  </div>
  <div class="flex flex-col flex-1 p-4 gap-3">
    <div>
      <h3 class="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-1 flex items-center gap-1.5">
        {{ club().name }}
        @if (isOwned()) {
          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400" title="Ваш клуб">👑</span>
        }
      </h3>
      @if (club().nextMeetingDate) {
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-accent-600 dark:text-accent-400 font-medium">
            📅 {{ club().nextMeetingDate | formatDate }}
          </span>
          @if (daysUntil(club().nextMeetingDate!) <= 7 && daysUntil(club().nextMeetingDate!) >= 0) {
            <span class="text-xs font-semibold text-orange-600 dark:text-orange-400">
              · за {{ daysUntil(club().nextMeetingDate!) }} дн.
            </span>
          }
        </div>
      }
    </div>
    @if (club().currentBook) {
      <div class="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-3 flex gap-3 items-start">
        <span class="text-2xl shrink-0" aria-hidden="true">📖</span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ club().currentBook!.title }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 italic">{{ club().currentBook!.author }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{{ club().currentBook!.description }}</p>
        </div>
      </div>
    }
    @if (club().address) {
      <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <span aria-hidden="true">📍</span>
        <span class="truncate">{{ club().address }}</span>
      </p>
    }
    @if (club().memberPreviews.length > 0) {
      <div class="flex items-center gap-1.5">
        @for (name of club().memberPreviews.slice(0, 4); track name) {
          <div
            class="h-7 w-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0"
            [attr.title]="name"
            aria-hidden="true"
          >
            {{ name | initials }}
          </div>
        }
        @if (club().memberCount > 4) {
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">+{{ club().memberCount - 4 }}</span>
        }
      </div>
    }
    <div class="flex items-center gap-2 mt-auto pt-1">
      <a
        [routerLink]="['/clubs', club().id]"
        class="flex-1 text-center rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        [attr.aria-label]="('CLUBS.view' | translate) + ' ' + club().name"
      >
        {{ 'CLUBS.view' | translate }}
      </a>
      @if (isAuthenticated() && !isMember() && club().status === 'active') {
        <button
          type="button"
          (click)="join.emit()"
          [disabled]="joining()"
          class="flex-1 rounded-xl bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          [attr.aria-label]="('CLUBS.join' | translate) + ' ' + club().name"
        >
          @if (joining()) { ⏳ } @else { {{ 'CLUBS.join' | translate }} }
        </button>
      } @else if (isAuthenticated() && isMember()) {
        <span class="flex-1 text-center rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400">{{ 'CLUBS.member_badge' | translate }}</span>
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
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
@Component({
  selector: 'app-club-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, InitialsPipe, FormatDatePipe],
  templateUrl: './club-card.component.html',
})
export class ClubCardComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwned = input<boolean>(false);
  readonly isAuthenticated = input<boolean>(false);
  readonly joining = input<boolean>(false);
  readonly join = output<void>();
  protected daysUntil(dateStr: string): number {
    const now = new Date();
    const meeting = new Date(dateStr);
    return Math.ceil((meeting.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
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

## File: src/app/features/profile/stats/profile-stats.component.html
````html
<dl class="grid grid-cols-2 sm:grid-cols-3 gap-4">
  <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">📚</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.clubs_joined' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ stats()?.clubsJoined ?? 0 }}
    </dd>
  </div>
  <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">🧠</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.quizzes_taken' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ stats()?.quizzesTaken ?? 0 }}
    </dd>
  </div>
  <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">🏆</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.quizzes_won' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ stats()?.quizWins ?? 0 }}
    </dd>
  </div>
  <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">❤️</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.likes_received' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ stats()?.likesReceived ?? 0 }}
    </dd>
  </div>
  <div class="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-5 text-center">
    <div class="text-3xl mb-2" aria-hidden="true">📖</div>
    <dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ 'PROFILE.books_read' | translate }}</dt>
    <dd class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ stats()?.booksRead ?? 0 }}
    </dd>
  </div>
</dl>
@if (!stats()) {
  <p class="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">
    {{ 'PROFILE.no_stats' | translate }}
  </p>
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

## File: src/app/features/quiz/.gitkeep
````

````

## File: src/app/features/randomizer/.gitkeep
````

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

## File: src/app/shared/components/empty-state/empty-state.component.html
````html
<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="text-5xl mb-4" aria-hidden="true">{{ icon() }}</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title() }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{{ description() }}</p>
      @if (actionLabel()) {
        <button
          type="button"
          (click)="actionClick.emit()"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium
                 transition-all duration-200 focus:outline-none focus:ring-2
                 focus:ring-primary-500 focus:ring-offset-2"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
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

## File: src/app/shared/components/toast/toast.component.html
````html
<div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none"
      aria-live="assertive"
      aria-atomic="false"
      aria-label="Notifications"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          class="toast-enter pointer-events-auto flex items-start gap-3 rounded-xl
                 px-4 py-3 shadow-lg transition-all duration-200"
          [class]="toastClass(toast)"
        >
          <span class="text-lg shrink-0 leading-none mt-0.5" aria-hidden="true">
            {{ toastIcon(toast) }}
          </span>
          <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>
          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="shrink-0 text-xl leading-none opacity-60 hover:opacity-100
                   transition-opacity focus:outline-none"
            [attr.aria-label]="'Dismiss: ' + toast.message"
          >
            &times;
          </button>
        </div>
      }
    </div>
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

## File: src/app/shared/pipes/initials.pipe.ts
````typescript
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'initials', standalone: true, pure: true })
export class InitialsPipe implements PipeTransform {
  transform(displayName: string): string {
    return displayName
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
````

## File: src/app/shared/utils/.gitkeep
````

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

## File: tailwind.config.js
````javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe',
          300: '#f0abfc', 400: '#e879f9', 500: '#d946ef',
          600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      }
    }
  },
  plugins: [],
}
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

## File: tsconfig.json
````json
/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
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
    "module": "preserve"
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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

## File: src/app/core/services/toast.service.ts
````typescript
import { Injectable, signal } from '@angular/core';
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  show(message: string, type: 'success' | 'error' | 'info', duration = 3000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type, duration };
    this._toasts.update(list => [...list, toast]);
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }
  remove(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
````

## File: src/app/layout/shell/shell.component.html
````html
<app-header />
    <main class="min-h-screen">
      <router-outlet />
    </main>
    <app-chat-widget />
    <app-footer />
````

## File: src/app/shared/chat/chat-widget/chat-widget.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../../core/services/chat.service';
@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, FormsModule, DatePipe],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  protected readonly messageText = signal('');
  protected readonly isBouncing = signal(false);
  protected readonly fabPositionClass = computed(() =>
    this.auth.isOrganizer() ? 'bottom-24 right-6' : 'bottom-6 right-6'
  );
  protected readonly panelPositionClass = computed(() =>
    this.auth.isOrganizer() ? 'bottom-40 right-6' : 'bottom-24 right-6'
  );
  constructor() {
    effect(() => {
      if (this.chat.hasNewMessage()) {
        this.isBouncing.set(true);
        setTimeout(() => this.isBouncing.set(false), 1000);
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
@Component({
  selector: 'app-qr-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      [style.width.px]="size()"
      [style.height.px]="size()"
      class="rounded-lg"
      [attr.aria-label]="'QR code'"
      role="img"
    ></canvas>
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

## File: src/app/shared/components/toast/toast.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';
@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './toast.component.scss',
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  toastClass(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success:
        'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 ' +
        'text-green-800 dark:text-green-200',
      error:
        'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 ' +
        'text-red-800 dark:text-red-200',
      info:
        'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 ' +
        'text-blue-800 dark:text-blue-200',
    };
    return map[toast.type];
  }
  toastIcon(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
    };
    return map[toast.type];
  }
}
````

## File: src/app/app.html
````html
<router-outlet />
    <app-toast />
````

## File: CLAUDE.md
````markdown
# Project Context
This project uses **Repomix** to provide a full map of the codebase.

## Stack
- Frontend: Angular 20 (Signals—using Angular 20 features like resource() and linkedSignal(), standalone components, SCSS, Tailwind)
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

## File: src/app/core/models/club.model.ts
````typescript
export type ClubStatus = 'active' | 'paused' | 'cancelled';
import { UserSocials } from './user.model';
export interface AfterMeetingVenue {
  name: string;
  address: string;
  description?: string;
  lat?: number;
  lng?: number;
}
export type BanDuration = 1 | 3 | 5 | 'permanent';
export interface BanRecord {
  userId: string;
  clubId: string;
  bannedAt: string;
  duration: BanDuration;
  bannedBy: string;
}
export interface ClubBook {
  title: string;
  author: string;
  description: string;
}
export interface Club {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  organizerId: string;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  city: string;
  nextMeetingDate: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  currentBook: ClubBook | null;
  memberPreviews: string[];
  status: ClubStatus;
  cancelledAt?: string;
  meetingHistory?: ClubMeetingRecord[];
  tags: string[];
  meetingDurationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
}
export interface ClubMeetingRecord {
  id: string;
  date: string;
  status: 'held' | 'cancelled' | 'rescheduled';
  notes?: string;
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
export interface ClubMeeting {
  id: string;
  clubId: string;
  title: string;
  date: string;
  attendees: string[];
}
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
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
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
  private currentUserId: string | null = null;
  readonly rooms = this._rooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly activeRoomId = this._activeRoomId.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasNewMessage = this._hasNewMessage.asReadonly();
  readonly activeRoom = computed(() =>
    this._rooms().find(r => r.id === this._activeRoomId()) ?? null,
  );
  readonly activeMessages = computed(
    () => this._messages()[this._activeRoomId() ?? ''] ?? [],
  );
  // ── Public API ────────────────────────────────────────────────────────────
  /** Fetch chat rooms for a given club and seed the rooms signal. */
  loadRooms(clubId: string, userId?: string): void {
    if (userId !== undefined) {
      this.currentUserId = userId;
    }
    firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${clubId}/chat/rooms`))
      .then(raw => {
        const rooms: ChatRoom[] = raw.map(r => ({ id: r.id, name: r.name }));
        this._rooms.set(rooms);
        // Auto-select the first room when none is active or active room is gone.
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
  private mapMessage(m: ApiChatMessage): ChatMessage {
    return {
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      text: m.text,
      timestamp: new Date(m.created_at),
      isOwn: m.sender_id === this.currentUserId,
    };
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
              <h1 class="font-display text-3xl font-bold text-gray-900">📚 Book Club</h1>
              <p class="text-gray-600 mt-2">{{ 'AUTH.welcome_back' | translate }}</p>
            </div>
            <div class="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-amber-100">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ 'AUTH.sign_in_h2' | translate }}</h2>
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
                <fieldset class="border-0 p-0 m-0">
                  <legend class="sr-only">{{ 'AUTH.sign_in_h2' | translate }}</legend>
                  <app-form-field
                    [label]="'AUTH.email' | translate"
                    type="email"
                    placeholder="you@example.com"
                    [control]="form.controls.email"
                  />
                  <app-form-field
                    [label]="'AUTH.password' | translate"
                    type="password"
                    placeholder="••••••••"
                    [control]="form.controls.password"
                  />
                </fieldset>
                @if (errorMessage()) {
                  <div class="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                    <span class="mt-0.5 shrink-0">⚠️</span>
                    <span>{{ errorMessage() }}</span>
                  </div>
                }
                <button
                  type="submit"
                  [disabled]="isSubmitting()"
                  class="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5
                         text-sm font-semibold text-white shadow-sm
                         hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors duration-200 mt-2"
                >
                  @if (isSubmitting()) {
                    <app-loading-spinner size="sm" />
                    {{ 'AUTH.signing_in' | translate }}
                  } @else {
                    {{ 'AUTH.submit_login' | translate }}
                  }
                </button>
              </form>
              <p class="mt-6 text-center text-sm text-gray-600">
                {{ 'AUTH.no_account' | translate }}
                <a routerLink="/register" class="text-amber-700 hover:text-amber-800 font-medium">
                  {{ 'AUTH.register_title' | translate }}
                </a>
              </p>
            </div>
            <p class="mt-6 text-center text-sm text-gray-500">
              <a
                routerLink="/"
                class="inline-flex items-center gap-1 text-gray-500
                       hover:text-gray-700 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
              >
                {{ 'NAV.back_home' | translate }}
              </a>
            </p>
          </div>
        }
        </main>
    </div>
    <style>
      .auth-page-wrapper {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
      }
      .auth-form-container {
        position: relative;
        z-index: 60;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .animate-form-in {
        animation: form-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes form-slide-in {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
````

## File: src/app/features/auth/register/register.component.html
````html
<div class="auth-page-wrapper">
      <app-book-intro [open]="bookOpen()" (animationDone)="onBookAnimationDone()" />
      <main class="auth-form-container">
        @if (formVisible()) {
          <div class="w-full max-w-md animate-form-in">
            <div class="text-center mb-8">
              <h1 class="font-display text-3xl font-bold text-gray-900">📚 Book Club</h1>
              <p class="text-gray-600 mt-2">{{ 'AUTH.create_account_subtitle' | translate }}</p>
            </div>
            @if (successMessage()) {
              <div class="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-amber-100">
                <div class="text-5xl mb-4">📬</div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ 'AUTH.check_email' | translate }}</h2>
                <p class="text-gray-600 text-sm">
                  {{ 'AUTH.confirmation_sent' | translate }} <strong>{{ registeredEmail() }}</strong>.
                  {{ 'AUTH.activate_account' | translate }}
                </p>
                <a routerLink="/login"
                   class="mt-6 inline-block text-sm text-amber-700 hover:text-amber-800 font-medium">
                  {{ 'AUTH.back_to_login' | translate }}
                </a>
              </div>
            } @else {
              <div class="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-amber-100">
                <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ 'AUTH.create_account_h2' | translate }}</h2>
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
                  <fieldset class="border-0 p-0 m-0">
                    <legend class="sr-only">{{ 'AUTH.create_account_h2' | translate }}</legend>
                    <app-form-field
                      [label]="'AUTH.display_name' | translate"
                      type="text"
                      placeholder="Ada Lovelace"
                      [control]="form.controls.displayName"
                    />
                    <app-form-field
                      [label]="'AUTH.email' | translate"
                      type="email"
                      placeholder="you@example.com"
                      [control]="form.controls.email"
                    />
                    <app-form-field
                      [label]="'AUTH.password' | translate"
                      type="password"
                      [placeholder]="'AUTH.password' | translate"
                      [control]="form.controls.password"
                    />
                    @if (passwordStrength()) {
                      <div class="flex items-center gap-2 -mt-2">
                        <div class="flex gap-1 flex-1">
                          <div
                            class="h-1 flex-1 rounded-full transition-colors"
                            [class]="passwordStrength() !== null ? 'bg-red-400' : 'bg-gray-200'"
                          ></div>
                          <div
                            class="h-1 flex-1 rounded-full transition-colors"
                            [class]="passwordStrength() === 'medium' || passwordStrength() === 'strong' ? 'bg-yellow-400' : 'bg-gray-200'"
                          ></div>
                          <div
                            class="h-1 flex-1 rounded-full transition-colors"
                            [class]="passwordStrength() === 'strong' ? 'bg-green-500' : 'bg-gray-200'"
                          ></div>
                        </div>
                        <span
                          class="text-xs font-medium"
                          [class]="passwordStrength() === 'strong' ? 'text-green-600' :
                                   passwordStrength() === 'medium' ? 'text-yellow-600' :
                                   'text-red-500'"
                        >
                          {{ passwordStrength() === 'strong' ? ('AUTH.password_strong' | translate) : passwordStrength() === 'medium' ? ('AUTH.password_medium' | translate) : ('AUTH.password_weak' | translate) }}
                        </span>
                      </div>
                    }
                    <app-form-field
                      [label]="'AUTH.confirm_password' | translate"
                      type="password"
                      placeholder="••••••••"
                      [control]="form.controls.confirmPassword"
                    />
                    @if (form.hasError('passwordMismatch') && form.controls.confirmPassword.touched) {
                      <p class="text-xs text-red-500 -mt-3">{{ 'AUTH.passwords_no_match' | translate }}</p>
                    }
                    <fieldset class="border-0 p-0 m-0">
                      <legend class="text-sm font-medium text-gray-700 block mb-1.5">{{ 'AUTH.want_to' | translate }}</legend>
                      <div class="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          (click)="setRole('user')"
                          [class.ring-2]="selectedRole() === 'user'"
                          [class.ring-amber-500]="selectedRole() === 'user'"
                          [class.bg-amber-50]="selectedRole() === 'user'"
                          [class.bg-gray-50]="selectedRole() !== 'user'"
                          class="p-4 rounded-xl border border-gray-200 text-left transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <div class="text-2xl mb-1">📖</div>
                          <div class="font-medium text-sm text-gray-900">{{ 'AUTH.role_reader_label' | translate }}</div>
                          <div class="text-xs text-gray-500">{{ 'AUTH.role_reader_desc' | translate }}</div>
                        </button>
                        <button
                          type="button"
                          (click)="setRole('organizer')"
                          [class.ring-2]="selectedRole() === 'organizer'"
                          [class.ring-amber-500]="selectedRole() === 'organizer'"
                          [class.bg-amber-50]="selectedRole() === 'organizer'"
                          [class.bg-gray-50]="selectedRole() !== 'organizer'"
                          class="p-4 rounded-xl border border-gray-200 text-left transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <div class="text-2xl mb-1">🎯</div>
                          <div class="font-medium text-sm text-gray-900">{{ 'AUTH.role_organizer_label' | translate }}</div>
                          <div class="text-xs text-gray-500">{{ 'AUTH.role_organizer_desc' | translate }}</div>
                        </button>
                      </div>
                      @if (form.controls.role.invalid && form.controls.role.touched) {
                        <p class="text-xs text-red-500 mt-0.5">{{ 'AUTH.select_role_error' | translate }}</p>
                      }
                    </fieldset>
                    @if (errorMessage()) {
                      <div class="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                        <span class="mt-0.5 shrink-0">⚠️</span>
                        <span>{{ errorMessage() }}</span>
                      </div>
                    }
                    <button
                      type="submit"
                      [disabled]="isSubmitting()"
                      class="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5
                             text-sm font-semibold text-white shadow-sm
                             hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-colors duration-200 mt-2"
                    >
                      @if (isSubmitting()) {
                        <app-loading-spinner size="sm" />
                        {{ 'AUTH.creating_account' | translate }}
                      } @else {
                        {{ 'AUTH.create_account_h2' | translate }}
                      }
                    </button>
                  </fieldset>
                </form>
                <p class="mt-6 text-center text-sm text-gray-600">
                  {{ 'AUTH.have_account' | translate }}
                  <a routerLink="/login" class="text-amber-700 hover:text-amber-800 font-medium">
                    {{ 'AUTH.sign_in_h2' | translate }}
                  </a>
                </p>
              </div>
            }
            <p class="mt-6 text-center text-sm text-gray-500">
              <a
                routerLink="/"
                class="inline-flex items-center gap-1 text-gray-500
                       hover:text-gray-700 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
              >
                {{ 'NAV.back_home' | translate }}
              </a>
            </p>
          </div>
        }
        </main>
    </div>
    <style>
      .auth-page-wrapper {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
      }
      .auth-form-container {
        position: relative;
        z-index: 60;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .animate-form-in {
        animation: form-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes form-slide-in {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
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
          <a
            [routerLink]="['..']"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm
                   transition-colors"
          >
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
            class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200
                   dark:border-gray-800 shadow-sm space-y-5"
          >
            <div class="space-y-1">
              <label
                for="quiz-title"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Quiz title <span class="text-red-500">*</span>
              </label>
              <input
                id="quiz-title"
                formControlName="title"
                placeholder="e.g. The Midnight Library — Chapter 1 Quiz"
                class="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 dark:text-white
                       bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                [class.border-red-400]="isInvalidTouched(metaForm.controls.title)"
                [class.border-gray-300]="!isInvalidTouched(metaForm.controls.title)"
                [class.dark:border-gray-600]="!isInvalidTouched(metaForm.controls.title)"
              />
              @if (isInvalidTouched(metaForm.controls.title)) {
                <p class="text-red-500 text-xs">
                  @if (metaForm.controls.title.errors?.['required']) { Title is required. }
                  @else if (metaForm.controls.title.errors?.['minlength']) { Title must be at least 3 characters. }
                  @else if (metaForm.controls.title.errors?.['maxlength']) { Title must not exceed 100 characters. }
                </p>
              }
            </div>
            <div class="space-y-1">
              <label
                for="quiz-desc"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="quiz-desc"
                formControlName="description"
                rows="3"
                placeholder="A brief description of the quiz…"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5
                       text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                       placeholder-gray-400 resize-none focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:border-transparent transition-colors"
                [class.border-red-400]="isInvalidTouched(metaForm.controls.description)"
              ></textarea>
              @if (isInvalidTouched(metaForm.controls.description)) {
                <p class="text-red-500 text-xs">
                  @if (metaForm.controls.description.errors?.['maxlength']) { Description must not exceed 500 characters. }
                </p>
              }
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="metaForm.invalid"
                class="bg-primary-600 hover:bg-primary-500 disabled:opacity-40
                       disabled:cursor-not-allowed text-white rounded-xl px-6 py-2.5
                       font-medium transition-colors text-sm"
              >
                Continue →
              </button>
            </div>
          </form>
        }
        @if (currentStep() === 2) {
          <div class="space-y-6">
            @if (localQuestions().length > 0) {
              <div class="space-y-3">
                <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase
                           tracking-widest">
                  Questions ({{ localQuestions().length }})
                </h2>
                @for (q of localQuestions(); track $index) {
                  <div
                    class="bg-white dark:bg-gray-900 rounded-xl px-5 py-4 border border-gray-200
                           dark:border-gray-800 shadow-sm flex items-start gap-3"
                  >
                    <span
                      class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40
                             text-primary-700 dark:text-primary-300 text-xs font-bold flex
                             items-center justify-center flex-shrink-0"
                    >
                      {{ $index + 1 }}
                    </span>
                    <div class="min-w-0">
                      <p class="text-gray-900 dark:text-white text-sm font-medium">
                        {{ q.question }}
                      </p>
                      <p class="text-green-600 dark:text-green-400 text-xs mt-1">
                        ✓ {{ q.options[q.correctIndex] }}
                      </p>
                    </div>
                    <button
                      (click)="removeQuestion($index)"
                      class="text-gray-400 hover:text-red-500 transition-colors text-lg
                             flex-shrink-0 ml-auto leading-none"
                      aria-label="Remove question {{ $index + 1 }}"
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
              class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200
                     dark:border-gray-800 shadow-sm space-y-5"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ localQuestions().length === 0 ? 'Add your first question' : 'Add another question' }}
              </h2>
              <div class="space-y-1">
                <label
                  for="q-text"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Question <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="q-text"
                  formControlName="question"
                  rows="2"
                  placeholder="What is the main theme of chapter 3?"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5
                         text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                         placeholder-gray-400 resize-none focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:border-transparent transition-colors"
                  [class.border-red-400]="isInvalidTouched(questionForm.controls.question)"
                ></textarea>
              </div>
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
                          class="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300
                                 dark:border-gray-600 cursor-pointer"
                        />
                        <span
                          class="ml-2 w-6 h-6 rounded-full flex items-center justify-center
                                 text-xs font-bold"
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
                        [formControlName]="'option' + idx"
                        [placeholder]="'Option ' + optionLabel(idx)"
                        class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4
                               py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                               placeholder-gray-400 focus:outline-none focus:ring-2
                               focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  }
                </div>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Select the radio button next to the correct answer.
                </p>
              </div>
              <button
                type="submit"
                [disabled]="questionForm.invalid"
                class="w-full border-2 border-dashed border-primary-400 dark:border-primary-600
                       text-primary-600 dark:text-primary-400 hover:bg-primary-50
                       dark:hover:bg-primary-900/20 disabled:opacity-40 disabled:cursor-not-allowed
                       rounded-xl py-2.5 font-medium transition-colors text-sm"
              >
                + Add Question
              </button>
            </form>
            @if (errorMessage()) {
              <div
                class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                       rounded-xl p-4 text-red-700 dark:text-red-400 text-sm"
              >
                ⚠️ {{ errorMessage() }}
              </div>
            }
            <div class="flex justify-between items-center pb-8">
              <button
                type="button"
                (click)="previousStep()"
                class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white
                       transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                (click)="publishQuiz()"
                [disabled]="localQuestions().length === 0 || isPublishing()"
                class="bg-accent-600 hover:bg-accent-500 disabled:opacity-40
                       disabled:cursor-not-allowed text-white rounded-xl px-8 py-2.5
                       font-bold transition-colors text-sm"
              >
                {{ isPublishing() ? '…Publishing' : '🚀 Publish Quiz' }}
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

## File: src/app/features/quiz/quiz-list/quiz-list.component.html
````html
<div class="min-h-screen p-4 sm:p-8">
      <div class="max-w-3xl mx-auto space-y-6">
        <header class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">
              🧠 Quizzes
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Test your knowledge of the books you've read.
            </p>
          </div>
          <div class="flex items-center gap-3">
            @if (authService.isOrganizer()) {
              <a
                [routerLink]="['/clubs', id(), 'quizzes', 'create']"
                class="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500
                       text-white rounded-xl px-4 py-2.5 font-medium transition-colors text-sm"
              >
                + Create Quiz
              </a>
            }
            <nav aria-label="Breadcrumb">
              <a
                [routerLink]="['/clubs', id()]"
                class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm
                       transition-colors"
              >
                ← Club
              </a>
            </nav>
          </div>
        </header>
        @if (quizService.isLoading()) {
          <div class="space-y-4">
            @for (_ of [1, 2, 3]; track $index) {
              <div
                class="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
              ></div>
            }
          </div>
        } @else {
          @if (quizService.quizzes().length === 0) {
            <div
              class="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border
                     border-gray-200 dark:border-gray-800"
            >
              <p class="text-4xl mb-3">📝</p>
              <h2 class="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                No quizzes yet
              </h2>
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
            <div class="space-y-4">
              @for (quiz of quizService.quizzes(); track quiz.id) {
                <div
                  class="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200
                         dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h2
                          class="text-gray-900 dark:text-white font-semibold text-lg
                                 truncate"
                        >
                          {{ quiz.title }}
                        </h2>
                        @if (quiz.isActive) {
                          <span
                            class="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30
                                   text-green-700 dark:text-green-400 rounded-full px-2 py-0.5
                                   text-xs font-medium"
                          >
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                            Active
                          </span>
                        } @else {
                          <span
                            class="inline-flex items-center bg-gray-100 dark:bg-gray-800
                                   text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5
                                   text-xs font-medium"
                          >
                            Draft
                          </span>
                        }
                      </div>
                      @if (quiz.description) {
                        <p
                          class="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2"
                        >
                          {{ quiz.description }}
                        </p>
                      }
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      @if (authService.isOrganizer()) {
                        <button
                          (click)="toggleActive(quiz.id, !quiz.isActive)"
                          [disabled]="togglingId() === quiz.id"
                          class="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                                 disabled:opacity-50"
                          [class.bg-green-100]="!quiz.isActive"
                          [class.text-green-700]="!quiz.isActive"
                          [class.hover:bg-green-200]="!quiz.isActive"
                          [class.dark:bg-green-900\/30]="!quiz.isActive"
                          [class.dark:text-green-400]="!quiz.isActive"
                          [class.bg-gray-100]="quiz.isActive"
                          [class.text-gray-600]="quiz.isActive"
                          [class.hover:bg-gray-200]="quiz.isActive"
                          [class.dark:bg-gray-800]="quiz.isActive"
                          [class.dark:text-gray-400]="quiz.isActive"
                        >
                          {{ quiz.isActive ? 'Deactivate' : 'Activate' }}
                        </button>
                      } @else if (quiz.isActive) {
                        <button
                          (click)="takeQuiz(quiz.id)"
                          class="bg-accent-600 hover:bg-accent-500 text-white rounded-lg
                                 px-4 py-1.5 text-sm font-medium transition-colors"
                        >
                          Take Quiz →
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
        @if (errorMessage()) {
          <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                   rounded-xl p-4 text-red-700 dark:text-red-400 text-sm"
          >
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
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
@Component({
  selector: 'app-quiz-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './quiz-list.component.html',
})
export class QuizListComponent {
  protected readonly quizService = inject(QuizService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly togglingId = signal<string | null>(null);
  protected readonly errorMessage = signal('');
  readonly id = input<string>('');
  constructor() {
    effect(() => {
      const clubId = this.id();
      if (clubId) {
        this.quizService.loadQuizzes(clubId).catch(err => {
          this.errorMessage.set((err as Error).message);
        });
      }
    });
  }
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
    path: ':quizId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
];
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

## File: src/app/layout/shell/shell.component.ts
````typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatWidgetComponent } from '../../shared/chat/chat-widget/chat-widget.component';
@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatWidgetComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {}
````

## File: src/app/shared/chat/chat-widget/chat-widget.component.html
````html
@if (auth.isAuthenticated()) {
  <button
    [class]="'fixed z-50 w-14 h-14 rounded-full bg-accent-500 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center text-white ' + fabPositionClass()"
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
      [class]="'fixed z-40 w-80 max-h-[480px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 chat-panel ' + panelPositionClass()"
    >
      <div class="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ 'CHAT.title' | translate }}
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700 transition-colors"
          [attr.aria-label]="'close'"
          (click)="chat.toggleOpen()"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      </div>
      @if (chat.rooms().length > 0) {
        <div class="flex overflow-x-auto px-3 py-2 border-b border-gray-100 gap-2">
          @for (room of chat.rooms(); track room.id) {
            <button
              class="px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors duration-200 flex-shrink-0"
              [ngClass]="{
                'bg-accent-500 text-white': chat.activeRoomId() === room.id,
                'bg-gray-100 text-gray-700 hover:bg-gray-200': chat.activeRoomId() !== room.id
              }"
              role="tab"
              [attr.aria-selected]="chat.activeRoomId() === room.id"
              (click)="chat.openRoom(room.id)"
            >
              {{ room.name }}
            </button>
          }
        </div>
      }
      <div
        class="flex-1 overflow-y-auto p-3 space-y-2 messages-scroll"
        role="log"
        aria-live="polite"
      >
        @if (chat.activeMessages().length === 0) {
          <div class="flex items-center justify-center h-full text-gray-400">
            {{ 'CHAT.no_messages' | translate }}
          </div>
        } @else {
          @for (message of chat.activeMessages(); track message.id) {
            <div [ngClass]="{ 'flex justify-end': message.isOwn, 'flex justify-start': !message.isOwn }">
              <div class="flex flex-col max-w-[75%]">
                @if (!message.isOwn) {
                  <span class="text-xs text-gray-500 px-3 mb-1">{{ message.senderName }}</span>
                }
                <div
                  class="px-4 py-2 rounded-2xl"
                  [ngClass]="{
                    'bg-accent-500 text-white rounded-br-sm': message.isOwn,
                    'bg-gray-100 text-gray-800 rounded-bl-sm': !message.isOwn
                  }"
                >
                  {{ message.text }}
                </div>
                <span class="text-xs text-gray-400 px-3 mt-1 text-right">
                  {{ message.timestamp | date: 'HH:mm' }}
                </span>
              </div>
            </div>
          }
        }
        <div #messagesEnd></div>
      </div>
      <div class="border-t border-gray-100 p-3 flex gap-2">
        <input
          type="text"
          [(ngModel)]="messageText"
          (keydown)="onKeydown($event)"
          [placeholder]="'CHAT.placeholder' | translate"
          [attr.aria-label]="'CHAT.placeholder' | translate"
          class="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        />
        <button
          class="w-10 h-10 rounded-full bg-accent-500 text-white flex items-center justify-center hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          [disabled]="!messageText().trim()"
          (click)="sendMessage()"
          [attr.aria-label]="'CHAT.send' | translate"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16584166 C3.50612381,0.9087443 2.40999006,1.01484963 1.77946707,1.4861418 C0.994623095,2.11535496 0.837654326,3.20500913 1.15159189,3.9904961 L3.03521743,10.4314891 C3.03521743,10.5885864 3.19218622,10.7456838 3.50612381,10.7456838 L16.6915026,11.5311707 C16.6915026,11.5311707 17.1624089,11.5311707 17.1624089,12.0024628 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
          </svg>
        </button>
      </div>
    </div>
  }
}
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

## File: src/environments/environment.prod.ts
````typescript
export const environment = {
  production: true,
  apiUrl: 'https://book-club-be.onrender.com/api/v1',
};
````

## File: src/environments/environment.ts
````typescript
export const environment = {
  production: false,
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
              "src/styles.scss"
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
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": [
              "src/styles.scss"
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
    ]
  }
}
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
      check: {
        global: { statements: 70, branches: 60, functions: 70, lines: 70 },
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
    ],
  },
];
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
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserSocials } from '../../core/models/user.model';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';
import { SocialLinkFieldComponent, SocialField } from '../../shared/components/social-link-field/social-link-field.component';
import { SocialBadgesComponent } from '../../shared/components/social-badges/social-badges.component';
import { ProfileStatsComponent } from './stats/profile-stats.component';
import { ProfileRoleSelectorComponent } from './role-selector/profile-role-selector.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, SocialLinkFieldComponent, SocialBadgesComponent, ProfileStatsComponent, ProfileRoleSelectorComponent],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly toast = inject(ToastService);
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
      this.toast.show('PROFILE.role_changed', 'success');
    } catch {  }
  }
  protected async saveName(): Promise<void> {
    if (this.nameForm.invalid) return;
    this.isSavingName.set(true);
    const { displayName } = this.nameForm.getRawValue();
    try {
      await this.auth.updateDisplayName(displayName);
      this.toast.show('PROFILE.name_updated', 'success');
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
      this.toast.show('PROFILE.socials_saved', 'success');
    } catch {  }
  }
  protected async onSocialsPublicChange(value: boolean): Promise<void> {
    try {
      await this.auth.setSocialsPublic(value);
    } catch {  }
  }
}
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
  protected readonly currentIndex = signal(0);
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
        id="purpose"
        type="text"
        [formControl]="purposeControl"
        [placeholder]="'RANDOMIZER.purpose_placeholder' | translate"
        class="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
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
            type="button"
            (click)="reset()"
            class="text-xs text-primary-300 hover:text-white transition-colors"
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
            type="button"
            (click)="spin()"
            [disabled]="randomizerService.isSpinning() || selectedCount() < 2"
            class="w-full rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 text-white font-bold py-4 text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-lg"
          >
            @if (randomizerService.isSpinning()) {
              {{ 'RANDOMIZER.spinning_btn' | translate }}
            } @else {
              {{ 'RANDOMIZER.spin' | translate }}
            }
          </button>
          @if (randomizerService.result() && authService.isOrganizer()) {
            <button
              type="button"
              (click)="saveSession()"
              [disabled]="isSaving()"
              class="w-full rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
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

## File: src/app/layout/header/header.component.html
````html
<header
      class="sticky top-0 z-50 bg-[#f5ede0]/80 dark:bg-gray-900/80 backdrop-blur-md
             border-b border-amber-200/60 dark:border-gray-800"
      role="banner"
    >
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <a
            routerLink="/"
            class="font-display text-xl font-bold text-gray-900 dark:text-white
                   hover:text-primary-600 dark:hover:text-primary-400
                   transition-all duration-200 focus:outline-none focus:ring-2
                   focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            📚 BookClub
          </a>
          <nav
            class="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            <a
              routerLink="/clubs"
              routerLinkActive="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300
                     hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                     focus:ring-offset-2"
            >
              {{ 'NAV.discover' | translate }}
            </a>
            @if (isAuthenticated()) {
              <a
                routerLink="/clubs"
                [queryParams]="{ tab: 'mine' }"
                routerLinkActive="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300
                       hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                       focus:ring-offset-2"
              >
                {{ 'CLUBS.my_clubs' | translate }}
              </a>
            }
          </nav>
          <div class="hidden md:flex items-center gap-2">
            <button
              type="button"
              (click)="switchLang()"
              class="text-sm font-semibold px-2 py-1 rounded border border-current
                     text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-all duration-200 focus:outline-none focus:ring-2
                     focus:ring-primary-500 focus:ring-offset-2"
              [attr.aria-label]="currentLang() === 'uk' ? 'Switch to English' : 'Перейти на українську'"
            >
              {{ currentLang() === 'uk' ? '🇬🇧 EN' : '🇺🇦 UK' }}
            </button>
            @if (isAuthenticated()) {
              <div class="relative">
                <button
                  type="button"
                  (click)="toggleDropdown()"
                  class="flex items-center gap-2 rounded-full p-0.5 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  [attr.aria-expanded]="isDropdownOpen()"
                  aria-haspopup="menu"
                  [attr.aria-label]="'User menu for ' + (currentUser()?.displayName ?? 'User')"
                >
                  <div
                    class="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500
                           flex items-center justify-center text-white text-sm font-semibold
                           select-none"
                    aria-hidden="true"
                  >
                    {{ userInitials() }}
                  </div>
                </button>
                @if (isDropdownOpen()) {
                  <div
                    role="menu"
                    aria-label="User menu"
                    class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg
                           border border-gray-100 dark:border-gray-700 py-1 z-50
                           animate-fade-in"
                  >
                    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {{ currentUser()?.displayName }}
                      </p>
                    </div>
                    <a
                      routerLink="/profile"
                      role="menuitem"
                      (click)="closeDropdown()"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200
                             focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                    >
                      👤 {{ 'NAV.profile' | translate }}
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      (click)="signOut()"
                      class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200
                             focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      🚪 {{ 'NAV.logout' | translate }}
                    </button>
                  </div>
                  <div
                    class="fixed inset-0 z-40"
                    aria-hidden="true"
                    tabindex="-1"
                    (click)="closeDropdown()"
                    (keydown.escape)="closeDropdown()"
                  ></div>
                }
              </div>
            } @else {
              <a
                routerLink="/login"
                class="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800
                       text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium text-sm
                       transition-all duration-200 focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:ring-offset-2"
              >
                {{ 'NAV.login' | translate }}
              </a>
              <a
                routerLink="/register"
                class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg
                       font-medium text-sm transition-all duration-200 focus:outline-none
                       focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {{ 'NAV.join_free' | translate }}
              </a>
            }
          </div>
          <button
            type="button"
            class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            (click)="toggleMenu()"
            [attr.aria-expanded]="isMenuOpen()"
            aria-controls="mobile-menu"
          >
            @if (isMenuOpen()) {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
            <span class="sr-only">Toggle navigation menu</span>
          </button>
        </div>
        @if (isMenuOpen()) {
          <nav
            id="mobile-menu"
            class="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1"
            aria-label="Mobile navigation"
          >
            <a
              routerLink="/clubs"
              routerLinkActive="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
              (click)="isMenuOpen.set(false)"
              class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                     text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-all duration-200 focus:outline-none focus:ring-2
                     focus:ring-primary-500 focus:ring-offset-2"
            >
              🔍 {{ 'NAV.discover' | translate }}
            </a>
            @if (isAuthenticated()) {
              <a
                routerLink="/clubs"
                [queryParams]="{ tab: 'mine' }"
                (click)="isMenuOpen.set(false)"
                class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                       text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-all duration-200 focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:ring-offset-2"
              >
                📖 {{ 'CLUBS.my_clubs' | translate }}
              </a>
            }
            <button
              type="button"
              (click)="switchLang()"
              class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                     text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-all duration-200 focus:outline-none focus:ring-2
                     focus:ring-primary-500 focus:ring-offset-2 w-full text-left"
              [attr.aria-label]="currentLang() === 'uk' ? 'Switch to English' : 'Перейти на українську'"
            >
              {{ currentLang() === 'uk' ? '🇬🇧 EN' : '🇺🇦 UK' }}
            </button>
            <div class="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
              @if (isAuthenticated()) {
                <div class="px-4 py-2">
                  <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    {{ 'NAV.signed_in_as' | translate }}
                  </p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {{ currentUser()?.displayName }}
                  </p>
                </div>
                <a
                  routerLink="/profile"
                  (click)="isMenuOpen.set(false)"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                         text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200 focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:ring-offset-2"
                >
                  👤 {{ 'NAV.profile' | translate }}
                </a>
                <button
                  type="button"
                  (click)="signOut()"
                  class="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                         text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                         transition-all duration-200 focus:outline-none focus:ring-2
                         focus:ring-red-500 focus:ring-offset-2"
                >
                  🚪 {{ 'NAV.logout' | translate }}
                </button>
              } @else {
                <a
                  routerLink="/login"
                  (click)="isMenuOpen.set(false)"
                  class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                         text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200 focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:ring-offset-2"
                >
                  {{ 'NAV.login' | translate }}
                </a>
                <a
                  routerLink="/register"
                  (click)="isMenuOpen.set(false)"
                  class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
                         bg-primary-600 text-white hover:bg-primary-700
                         transition-all duration-200 focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:ring-offset-2"
                >
                  {{ 'NAV.join_free' | translate }}
                </a>
              }
            </div>
          </nav>
        }
      </div>
    </header>
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
    children: [
      // Protected: any authenticated user
      {
        path: 'clubs',
        canActivate: [authGuard],
        loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
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

## File: src/app/app.ts
````typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
})
export class App {}
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
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);
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
  src/app/core/services/randomizer.service.ts,\
  src/app/core/services/quiz.service.ts,\
  src/app/core/services/club.service.ts,\
  src/app/core/supabase/**

sonar.sourceEncoding=UTF-8
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
    "password_strength": "Password strength"
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
    "minutes_abbr": "min",
    "address_label": "Address",
    "view_on_map": "View on map →",
    "after_meeting_title": "After the meeting",
    "deletion_countdown_prefix": "This club has been cancelled —",
    "deletion_countdown_hours": "will be deleted in {{ hours }} h. {{ minutes }} min.",
    "deletion_countdown_minutes": "will be deleted in {{ minutes }} min.",
    "close_qr": "✕ Close"
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
    "register": "Register"
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
    "score": "Score"
  },
  "CHAT": {
    "title": "Club Chat",
    "placeholder": "Type a message...",
    "send": "Send",
    "no_messages": "No messages yet",
    "new_message": "New message",
    "close": "Close chat",
    "open": "Open chat",
    "rooms": "Rooms"
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
    "password_strength": "Надійність паролю"
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
    "minutes_abbr": "хв",
    "address_label": "Адреса",
    "view_on_map": "Переглянути на карті →",
    "after_meeting_title": "Після зустрічі",
    "deletion_countdown_prefix": "Цей клуб скасовано —",
    "deletion_countdown_hours": "буде видалено через {{ hours }} год. {{ minutes }} хв.",
    "deletion_countdown_minutes": "буде видалено через {{ minutes }} хв.",
    "close_qr": "✕ Закрити"
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
    "register": "Приєднатись"
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
    "score": "Рахунок"
  },
  "CHAT": {
    "title": "Чат клубу",
    "placeholder": "Написати повідомлення...",
    "send": "Надіслати",
    "no_messages": "Поки немає повідомлень",
    "new_message": "Нове повідомлення",
    "close": "Закрити чат",
    "open": "Відкрити чат",
    "rooms": "Кімнати"
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

## File: src/app/core/interceptors/auth.interceptor.ts
````typescript
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { TokenStore } from '../auth/token.store';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const tokenStore = inject(TokenStore);
  const token = tokenStore.snapshot();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const httpError = error instanceof HttpErrorResponse ? error : null;
      if (httpError?.status === 401) {
        tokenStore.clear();
        router.navigate(['/login']);
      } else if (httpError?.status === 403) {
        router.navigate(['/clubs']);
      } else if (httpError && httpError.status >= 500) {
        if (!environment.production) {
          console.error('[HTTP] Server error', httpError.status, httpError.url, httpError);
        }
        toast.show('A server error occurred. Please try again later.', 'error');
      }
      return throwError(() => error);
    }),
  );
};
````

## File: src/app/features/clubs/create-club/create-club.component.html
````html
<main class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-lg">
    <header class="text-center mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">📚 Book Club</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">{{ 'CREATE_CLUB.subtitle' | translate }}</p>
    </header>
    <article class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ 'CREATE_CLUB.title' | translate }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
        <fieldset class="space-y-4">
          <legend class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ 'CREATE_CLUB.basic_info_legend' | translate }}</legend>
          <div>
            <label for="club-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ 'CREATE_CLUB.name_label' | translate }} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="club-name"
              type="text"
              formControlName="name"
              [placeholder]="'CREATE_CLUB.name_placeholder' | translate"
              class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors duration-150"
              [class.border-red-400]="form.controls.name.invalid && form.controls.name.touched"
              aria-describedby="name-error"
            />
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <p id="name-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                @if (form.controls.name.errors?.['required']) { {{ 'CREATE_CLUB.name_required' | translate }} }
                @else if (form.controls.name.errors?.['minlength']) { {{ 'CREATE_CLUB.name_min' | translate }} }
                @else if (form.controls.name.errors?.['maxlength']) { {{ 'CREATE_CLUB.name_max' | translate }} }
              </p>
            }
          </div>
          <div>
            <label for="club-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ 'CREATE_CLUB.description_label' | translate }}
            </label>
            <textarea
              id="club-description"
              formControlName="description"
              rows="3"
              [placeholder]="'CREATE_CLUB.description_placeholder' | translate"
              class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors duration-150"
              [class.border-red-400]="form.controls.description.invalid && form.controls.description.touched"
              aria-describedby="description-error"
            ></textarea>
            @if (form.controls.description.invalid && form.controls.description.touched) {
              <p id="description-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                @if (form.controls.description.errors?.['maxlength']) { {{ 'CREATE_CLUB.description_max' | translate }} }
              </p>
            }
          </div>
          <div>
            <label for="club-city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ 'CREATE_CLUB.city_label' | translate }} <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="club-city"
              type="text"
              formControlName="city"
              [placeholder]="'CREATE_CLUB.city_placeholder' | translate"
              class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors duration-150"
              [class.border-red-400]="form.controls.city.invalid && form.controls.city.touched"
              aria-describedby="city-error"
            />
            @if (form.controls.city.invalid && form.controls.city.touched) {
              <p id="city-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                @if (form.controls.city.errors?.['required']) { {{ 'CREATE_CLUB.city_required' | translate }} }
                @else if (form.controls.city.errors?.['maxlength']) { {{ 'CREATE_CLUB.city_max' | translate }} }
              </p>
            }
          </div>
          <div>
            <label for="club-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ 'CREATE_CLUB.address_label' | translate }}
            </label>
            <input
              id="club-address"
              type="text"
              formControlName="address"
              [placeholder]="'CREATE_CLUB.address_placeholder' | translate"
              class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors duration-150"
              [class.border-red-400]="form.controls.address.invalid && form.controls.address.touched"
              aria-describedby="address-error"
            />
            @if (form.controls.address.invalid && form.controls.address.touched) {
              <p id="address-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                @if (form.controls.address.errors?.['maxlength']) { {{ 'CREATE_CLUB.address_max' | translate }} }
              </p>
            }
          </div>
        </fieldset>
        <fieldset class="space-y-4">
          <legend class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ 'CREATE_CLUB.tags_duration_legend' | translate }}</legend>
          <div>
            <label for="club-tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ 'CREATE_CLUB.tags_label' | translate }}
            </label>
            <input
              id="club-tags"
              type="text"
              formControlName="tags"
              [placeholder]="'CREATE_CLUB.tags_placeholder' | translate"
              class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors duration-150"
              [class.border-red-400]="form.controls.tags.invalid && form.controls.tags.touched"
              aria-describedby="tags-hint tags-error"
            />
            <p id="tags-hint" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ 'CREATE_CLUB.tags_hint' | translate }}
            </p>
            @if (form.controls.tags.invalid && form.controls.tags.touched) {
              <p id="tags-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                @if (form.controls.tags.errors?.['maxlength']) { {{ 'CREATE_CLUB.tags_max' | translate }} }
              </p>
            }
          </div>
          <div>
            <label for="club-duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ 'CREATE_CLUB.duration_label' | translate }}
            </label>
            <input
              id="club-duration"
              type="number"
              formControlName="meetingDurationMinutes"
              [placeholder]="'CREATE_CLUB.duration_placeholder' | translate"
              min="15"
              max="480"
              class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-colors duration-150"
              [class.border-red-400]="form.controls.meetingDurationMinutes.invalid && form.controls.meetingDurationMinutes.touched"
              aria-describedby="duration-error"
            />
            @if (form.controls.meetingDurationMinutes.invalid && form.controls.meetingDurationMinutes.touched) {
              <p id="duration-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                @if (form.controls.meetingDurationMinutes.errors?.['min']) { {{ 'CREATE_CLUB.duration_min' | translate }} }
                @else if (form.controls.meetingDurationMinutes.errors?.['max']) { {{ 'CREATE_CLUB.duration_max' | translate }} }
              </p>
            }
          </div>
        </fieldset>
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
        <section>
          <button
            type="button"
            (click)="toggleAfterMeeting()"
            class="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                   text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-150
                   focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            @if (showAfterMeeting()) {
              {{ 'CREATE_CLUB.after_meeting_hide' | translate }}
            } @else {
              {{ 'CREATE_CLUB.after_meeting_toggle' | translate }}
            }
          </button>
          @if (showAfterMeeting()) {
            <div class="mt-4 space-y-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4">
              <div>
                <label for="venue-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ 'CREATE_CLUB.venue_name_label' | translate }}
                </label>
                <input
                  id="venue-name"
                  type="text"
                  formControlName="afterMeetingVenueName"
                  [placeholder]="'CREATE_CLUB.venue_name_placeholder' | translate"
                  class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                         px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-colors duration-150"
                  [class.border-red-400]="form.controls.afterMeetingVenueName.invalid && form.controls.afterMeetingVenueName.touched"
                  aria-describedby="venue-name-error"
                />
                @if (form.controls.afterMeetingVenueName.invalid && form.controls.afterMeetingVenueName.touched) {
                  <p id="venue-name-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                    @if (form.controls.afterMeetingVenueName.errors?.['maxlength']) { {{ 'CREATE_CLUB.venue_name_max' | translate }} }
                  </p>
                }
              </div>
              <div>
                <label for="venue-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ 'CREATE_CLUB.venue_address_label' | translate }}
                </label>
                <input
                  id="venue-address"
                  type="text"
                  formControlName="afterMeetingVenueAddress"
                  [placeholder]="'CREATE_CLUB.venue_address_placeholder' | translate"
                  class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                         px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-colors duration-150"
                  [class.border-red-400]="form.controls.afterMeetingVenueAddress.invalid && form.controls.afterMeetingVenueAddress.touched"
                  aria-describedby="venue-address-error"
                />
                @if (form.controls.afterMeetingVenueAddress.invalid && form.controls.afterMeetingVenueAddress.touched) {
                  <p id="venue-address-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                    @if (form.controls.afterMeetingVenueAddress.errors?.['maxlength']) { {{ 'CREATE_CLUB.venue_address_max' | translate }} }
                  </p>
                }
              </div>
              <div>
                <label for="venue-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ 'CREATE_CLUB.venue_notes_label' | translate }}
                </label>
                <textarea
                  id="venue-notes"
                  formControlName="afterMeetingVenueDescription"
                  rows="2"
                  [placeholder]="'CREATE_CLUB.venue_notes_placeholder' | translate"
                  class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                         px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-colors duration-150"
                  [class.border-red-400]="form.controls.afterMeetingVenueDescription.invalid && form.controls.afterMeetingVenueDescription.touched"
                  aria-describedby="venue-notes-error"
                ></textarea>
                @if (form.controls.afterMeetingVenueDescription.invalid && form.controls.afterMeetingVenueDescription.touched) {
                  <p id="venue-notes-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                    @if (form.controls.afterMeetingVenueDescription.errors?.['maxlength']) { {{ 'CREATE_CLUB.venue_notes_max' | translate }} }
                  </p>
                }
              </div>
            </div>
          }
        </section>
        @if (errorMessage()) {
          <div
            class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            <span class="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            (click)="cancel()"
            class="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5
                   text-sm font-semibold text-gray-700 dark:text-gray-300
                   hover:bg-gray-50 dark:hover:bg-gray-800
                   focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                   transition-colors duration-200"
          >
            {{ 'CREATE_CLUB.cancel' | translate }}
          </button>
          <button
            type="submit"
            [disabled]="isSubmitting()"
            class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5
                   text-sm font-semibold text-white shadow-sm
                   hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-colors duration-200"
          >
            @if (isSubmitting()) {
              <app-loading-spinner size="sm" />
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

## File: src/app/features/profile/profile.component.html
````html
<div class="max-w-2xl mx-auto space-y-6 py-8 px-4">
  <section
    aria-labelledby="profile-heading"
    class="rounded-2xl bg-white dark:bg-gray-800 shadow p-8 text-center"
  >
    <div
      class="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-500
             flex items-center justify-center text-white text-3xl font-bold select-none shadow-md"
      aria-hidden="true"
    >
      {{ userInitials() }}
    </div>
    <h1
      id="profile-heading"
      class="text-2xl font-bold text-gray-900 dark:text-white"
    >
      {{ auth.currentUser()?.displayName }}
    </h1>
    <span
      class="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
      [class]="auth.currentUser()?.role === 'organizer'
        ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'"
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
  <section
    aria-labelledby="edit-name-heading"
    class="rounded-2xl bg-white dark:bg-gray-800 shadow p-6"
  >
    <h2
      id="edit-name-heading"
      class="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2"
    >
      <span aria-hidden="true">✏️</span> {{ 'PROFILE.edit_profile' | translate }}
    </h2>
    <form [formGroup]="nameForm" (ngSubmit)="saveName()" novalidate>
      <div class="space-y-4">
        <div>
          <label
            for="displayName"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {{ 'PROFILE.display_name_label' | translate }}
          </label>
          <input
            id="displayName"
            type="text"
            formControlName="displayName"
            autocomplete="nickname"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700
                   bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm
                   text-gray-900 dark:text-white placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   transition-all duration-200"
            [placeholder]="'PROFILE.display_name_placeholder' | translate"
            [attr.aria-invalid]="nameForm.controls.displayName.invalid && nameForm.controls.displayName.touched"
            aria-describedby="displayName-error"
          />
          @if (nameForm.controls.displayName.invalid && nameForm.controls.displayName.touched) {
            <p
              id="displayName-error"
              role="alert"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
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
            type="submit"
            [disabled]="nameForm.invalid || isSavingName()"
            class="rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50
                   disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-medium
                   transition-all duration-200 focus:outline-none focus:ring-2
                   focus:ring-primary-500 focus:ring-offset-2"
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
  <section
    aria-labelledby="role-heading"
    class="rounded-2xl bg-white dark:bg-gray-800 shadow p-6"
  >
    <h2
      id="role-heading"
      class="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2"
    >
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
  <section
    aria-labelledby="stats-heading"
    class="rounded-2xl bg-white dark:bg-gray-800 shadow p-6"
  >
    <h2
      id="stats-heading"
      class="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2"
    >
      <span aria-hidden="true">📊</span> {{ 'PROFILE.stats_title' | translate }}
    </h2>
    <app-profile-stats [stats]="auth.userStats()" />
  </section>
  <section
    aria-labelledby="socials-heading"
    class="rounded-2xl bg-white dark:bg-gray-800 shadow p-6"
  >
    <h2
      id="socials-heading"
      class="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2"
    >
      <span aria-hidden="true">🌐</span> {{ 'PROFILE.socials_title' | translate }}
    </h2>
    <div class="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
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
    <form
      [formGroup]="socialsForm"
      (ngSubmit)="submitSocials()"
      novalidate
      class="space-y-4"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (social of socialFields; track social.key) {
          <app-social-link-field [config]="social" [form]="socialsForm" />
        }
      </div>
      <div class="flex items-center gap-3 pt-1">
        <button
          type="submit"
          class="rounded-xl bg-primary-600 hover:bg-primary-700 text-white
                 px-5 py-2.5 text-sm font-medium
                 transition-all duration-200 focus:outline-none focus:ring-2
                 focus:ring-primary-500 focus:ring-offset-2"
        >
          {{ 'PROFILE.save' | translate }}
        </button>
      </div>
    </form>
  </section>
</div>
````

## File: src/app/layout/header/header.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  readonly isMenuOpen = signal(false);
  readonly isDropdownOpen = signal(false);
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
    this.translate.use(next).subscribe();
  }
  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
    if (this.isMenuOpen()) this.isDropdownOpen.set(false);
  }
  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }
  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }
  async signOut(): Promise<void> {
    this.closeDropdown();
    this.isMenuOpen.set(false);
    await this.auth.signOut();
  }
}
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
````

## File: .github/copilot-instructions.md
````markdown
# GitHub Copilot Instructions — Book Club Frontend

## Project Overview

This is a modern **Angular 20** frontend application for a book club platform. It is built with standalone components, signals-based state management, zoneless change detection, and Tailwind CSS for styling.

## Tech Stack

- **Framework**: Angular 20 (standalone, no NgModules)
- **Language**: TypeScript (strict mode, no `any`)
- **State Management**: Angular Signals (`signal()`, `computed()`, `effect()`)
- **Change Detection**: Zoneless (`provideExperimentalZonelessChangeDetection`)
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
| `dev` | `claude-sonnet-4.6` | Angular 20 architecture, implementation, and code review |
| `reviewer` | `gpt-4.1` | Pre-commit review, Husky setup, PR readiness checks |
| `devops` | `gpt-4.1` | CI/CD pipelines, GitHub Actions, deployment automation |
| `security` | `claude-sonnet-4.6` | XSS, CSP, JWT security audits and input sanitization |
| `tester` | `gpt-4.1` | Visual regression, Lighthouse, contract testing setup |
| `ui` | `claude-haiku-4.5` | Design system, Tailwind, animations, accessibility |
| `web-quality-enhancer` | `claude-sonnet-4.6` | SEO, microcopy, semantic HTML, API docs |
| `java-backend-dev` | `claude-sonnet-4.6` | Java 21 microservices, Spring Boot, JPA, Kafka, JWT |
````

## File: src/app/features/clubs/clubs-list/clubs-list.component.html
````html
<div class="min-h-screen">
  <section aria-label="Search clubs" class="bg-gradient-to-br from-primary-600 to-accent-600 px-4 py-12 text-center">
    <h1 class="font-display text-4xl font-bold text-white mb-2">{{ 'CLUBS.title' | translate }}</h1>
    <p class="text-primary-100 mb-8">{{ 'CLUBS.subtitle' | translate }}</p>
    <div class="mx-auto max-w-xl relative">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">🔍</span>
      <label for="club-search" class="sr-only">{{ 'CLUBS.search_placeholder' | translate }}</label>
      <input
        id="club-search"
        type="search"
        [ngModel]="clubService.searchQuery()"
        (ngModelChange)="clubService.setSearchQuery($event)"
        [placeholder]="'CLUBS.search_placeholder_full' | translate"
        class="w-full rounded-full shadow-sm bg-white dark:bg-gray-800 pl-10 pr-5 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/70"
        [attr.aria-label]="'CLUBS.search_placeholder' | translate"
      />
    </div>
  </section>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
    @if (clubService.error()) {
      <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
        <span aria-hidden="true">⚠️</span>
        <span>{{ clubService.error() }}</span>
      </div>
    }
    @if (clubService.availableCities().length > 0) {
      <nav aria-label="Filter by city" class="flex flex-wrap gap-2">
        <button
          type="button"
          (click)="clubService.setCityFilter(null)"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          [class]="clubService.cityFilter() === null
            ? 'bg-primary-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          🌍 {{ 'CLUBS.all_cities' | translate }}
        </button>
        @for (city of clubService.availableCities(); track city) {
          <button
            type="button"
            (click)="clubService.setCityFilter(city)"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            [class]="clubService.cityFilter() === city
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            📍 {{ city }}
          </button>
        }
      </nav>
    }
    @if (clubService.isLoading()) {
      <div class="py-16" aria-busy="true" aria-label="Loading clubs">
        <app-loading-spinner size="lg" />
      </div>
    } @else if (cityKeys().length === 0) {
      <app-empty-state
        icon="📚"
        title="No upcoming meetings"
        description="No clubs have scheduled meetings yet. Check back soon!"
      />
    } @else {
      @for (city of cityKeys(); track city) {
        <section [attr.aria-labelledby]="'city-' + city">
          <h2
            [id]="'city-' + city"
            class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <span aria-hidden="true">📍</span> {{ city }}
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              — {{ clubService.upcomingByCity()[city].length }} club{{ clubService.upcomingByCity()[city].length === 1 ? '' : 's' }}
            </span>
          </h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (club of clubService.upcomingByCity()[city]; track club.id) {
              <li>
                <app-club-card
                  [club]="club"
                  [isMember]="clubService.myClubIds().has(club.id)"
                  [isOwned]="ownedClubIds().has(club.id)"
                  [isAuthenticated]="auth.isAuthenticated()"
                  [joining]="joiningClubId() === club.id"
                  (join)="onJoin(club)"
                />
              </li>
            }
          </ul>
        </section>
      }
    }
    @if (auth.isAuthenticated() && (clubService.myParticipatedClubs().length > 0 || clubService.myMissedClubs().length > 0)) {
      <section aria-labelledby="my-clubs-heading" class="border-t border-gray-200 dark:border-gray-700 pt-8 space-y-6">
        <h2 id="my-clubs-heading" class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span aria-hidden="true">📖</span> {{ 'CLUBS.my_clubs' | translate }}
        </h2>
        @if (clubService.myParticipatedClubs().length > 0) {
          <div>
            <h3 class="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              ✅ {{ 'CLUBS.participated' | translate }}
            </h3>
            <ul class="space-y-2">
              @for (club of clubService.myParticipatedClubs(); track club.id) {
                <li>
                  <a
                    [routerLink]="['/clubs', club.id]"
                    class="flex items-center gap-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm px-4 py-3 hover:shadow-md transition-shadow group"
                    [attr.aria-label]="('CLUBS.view' | translate) + ' ' + club.name"
                  >
                    <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shrink-0 flex items-center justify-center text-white text-lg" aria-hidden="true">✓</div>
                    <div class="min-w-0 flex-1">
                      <p class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1.5">
                        {{ club.name }}
                        @if (ownedClubIds().has(club.id)) {
                          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400" title="Ваш клуб">👑</span>
                        }
                      </p>
                      <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                        @if (club.theme) {
                          <span class="text-xs font-medium text-primary-600 dark:text-primary-400">{{ club.theme }}</span>
                        }
                        @if (club.currentBook) {
                          <span class="text-xs text-gray-400 dark:text-gray-500 truncate">📖 {{ club.currentBook.title }}</span>
                        }
                        @if (!club.theme && !club.currentBook) {
                          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">📍 {{ club.city }}</p>
                        }
                      </div>
                    </div>
                    @if (club.nextMeetingDate) {
                      <span class="shrink-0 text-xs text-gray-400 dark:text-gray-500">{{ club.nextMeetingDate | formatDate }}</span>
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
        }
        @if (clubService.myMissedClubs().length > 0) {
          <div>
            <h3 class="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              ⏭️ {{ 'CLUBS.missed' | translate }}
            </h3>
            <ul class="space-y-2">
              @for (club of clubService.myMissedClubs(); track club.id) {
                <li>
                  <a
                    [routerLink]="['/clubs', club.id]"
                    class="flex items-center gap-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm px-4 py-3 hover:shadow-md transition-shadow group border-l-4 border-orange-300 dark:border-orange-600"
                    [attr.aria-label]="('CLUBS.view' | translate) + ' ' + club.name"
                  >
                    <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-300 to-red-400 shrink-0 flex items-center justify-center text-white text-lg" aria-hidden="true">⏭</div>
                    <div class="min-w-0 flex-1">
                      <p class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1.5">
                        {{ club.name }}
                        @if (ownedClubIds().has(club.id)) {
                          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400" title="Ваш клуб">👑</span>
                        }
                      </p>
                      <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                        @if (club.theme) {
                          <span class="text-xs font-medium text-primary-600 dark:text-primary-400">{{ club.theme }}</span>
                        }
                        @if (club.currentBook) {
                          <span class="text-xs text-gray-400 dark:text-gray-500 truncate">📖 {{ club.currentBook.title }}</span>
                        }
                        @if (!club.theme && !club.currentBook) {
                          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">📍 {{ club.city }}</p>
                        }
                      </div>
                    </div>
                    @if (club.nextMeetingDate) {
                      <span class="shrink-0 rounded-full bg-orange-50 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                        {{ club.nextMeetingDate | formatDate }}
                      </span>
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </section>
    }
  </div>
  @if (auth.isOrganizer()) {
    <a
      routerLink="/clubs/create"
      class="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 transition-colors"
      [attr.aria-label]="'CLUBS.create' | translate"
      [title]="'CLUBS.create' | translate"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </a>
  }
</div>
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
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
interface CreateClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  address: FormControl<string>;
  tags: FormControl<string>;
  meetingDurationMinutes: FormControl<number | null>;
  afterMeetingVenueName: FormControl<string>;
  afterMeetingVenueAddress: FormControl<string>;
  afterMeetingVenueDescription: FormControl<string>;
}
@Component({
  selector: 'app-create-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, LoadingSpinnerComponent],
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
  readonly showAfterMeeting = signal(false);
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
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    tags: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)],
    }),
    meetingDurationMinutes: new FormControl<number | null>(null, {
      validators: [Validators.min(15), Validators.max(480)],
    }),
    afterMeetingVenueName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    afterMeetingVenueAddress: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    afterMeetingVenueDescription: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)],
    }),
  });
  togglePublic(): void {
    const current = this.form.controls.isPublic.value;
    this.form.controls.isPublic.setValue(!current);
  }
  toggleAfterMeeting(): void {
    this.showAfterMeeting.update(v => !v);
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
    const {
      name,
      description,
      isPublic,
      city,
      tags,
      meetingDurationMinutes,
      afterMeetingVenueName,
      afterMeetingVenueAddress,
      afterMeetingVenueDescription,
    } = this.form.getRawValue();
    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const afterMeetingVenue = afterMeetingVenueName
      ? {
          name: afterMeetingVenueName,
          address: afterMeetingVenueAddress,
          description: afterMeetingVenueDescription || undefined,
        }
      : null;
    try {
      const club = await this.clubService.createClub({
        name,
        description,
        isPublic,
        city,
        tags: parsedTags,
        meetingDurationMinutes: meetingDurationMinutes ?? undefined,
        afterMeetingVenue,
      });
      this.router.navigate(['/clubs', club.id]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      this._isSubmitting.set(false);
    }
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
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './quiz-create.component.html',
})
export class QuizCreateComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly localQuestions = signal<LocalQuestion[]>([]);
  protected readonly isPublishing = signal(false);
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
  protected publishQuiz(): void {
    const questions = this.localQuestions();
    if (questions.length === 0) return;
    this.isPublishing.set(true);
    this.errorMessage.set('');
    const { title, description } = this.metaForm.getRawValue();
    const clubId = this.id();
    this.quizService
      .createQuiz({ clubId, title: title.trim(), description: description.trim() })
      .then(async quiz => {
        // Add questions sequentially to preserve sort_order
        for (const q of questions) {
          await this.quizService.addQuestion(quiz.id, q);
        }
        // Activate the quiz
        await this.quizService.toggleActive(quiz.id, true);
        this.isPublishing.set(false);
        this.router.navigate(['/clubs', clubId, 'quizzes']);
      })
      .catch(err => {
        this.isPublishing.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
}
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
@Component({
  selector: 'app-randomizer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, TranslateModule, InitialsPipe],
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
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}
interface ApiRandomizerSession {
  id: string;
  club_id: string;
  created_by: string;
  purpose: string;
  candidates: ApiMemberCandidate[];
  result: ApiMemberCandidate | null;
  created_at: string;
}
function mapMemberCandidate(raw: ApiMemberCandidate): MemberCandidate {
  return {
    userId: raw.user_id,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
  };
}
function mapRandomizerSession(raw: ApiRandomizerSession): RandomizerSession {
  return {
    id: raw.id,
    clubId: raw.club_id,
    createdBy: raw.created_by,
    purpose: raw.purpose,
    candidates: raw.candidates.map(mapMemberCandidate),
    result: raw.result ? mapMemberCandidate(raw.result) : null,
    createdAt: raw.created_at,
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

## File: src/app/features/auth/login/login.component.ts
````typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, TranslateModule, BookIntroComponent, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
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

## File: src/app/features/clubs/club-detail/club-detail.component.html
````html
@if (isLoading()) {
  <main class="max-w-4xl mx-auto px-4 py-8" aria-busy="true" aria-label="Loading club details">
    <div class="animate-pulse space-y-4">
      <div class="h-56 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </main>
} @else if (errorMessage()) {
  <main class="max-w-4xl mx-auto px-4 py-8 text-center" role="alert">
    <p class="text-6xl mb-4" aria-hidden="true">😕</p>
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{{ 'CLUB_DETAIL.not_found' | translate }}</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-6">{{ errorMessage() }}</p>
    <a
      routerLink="/clubs"
      class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
    >
      ← {{ 'CLUB_DETAIL.back' | translate }}
    </a>
  </main>
} @else if (club()) {
  <main class="min-h-screen">
    <div class="relative">
      @if (club()!.coverUrl) {
        <img
          [src]="club()!.coverUrl"
          [alt]="club()!.name + ' cover'"
          class="w-full h-56 object-cover"
          loading="lazy"
        />
      } @else {
        <div class="bg-gradient-to-br from-primary-400 to-accent-500 h-56" aria-hidden="true"></div>
      }
      <nav [attr.aria-label]="'CLUB_DETAIL.back' | translate" class="absolute top-4 left-4">
        <a
          routerLink="/clubs"
          class="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white hover:bg-black/50 transition-colors"
          [attr.aria-label]="'CLUB_DETAIL.back' | translate"
        >
          ← {{ 'CLUB_DETAIL.back_short' | translate }}
        </a>
      </nav>
    </div>
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <app-club-header
        [club]="club()!"
        [isMember]="isMember()"
        [isOwner]="isClubOwner()"
        [isAuthenticated]="!!currentUser()"
        [isActionLoading]="isActionLoading()"
        [currentUser]="currentUser()"
        (join)="onJoin()"
        (leave)="onLeave()" />
      @if (club()?.status === 'cancelled' && deleteCountdown()) {
        <div role="alert" class="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          ⚠️ {{ 'CLUB_DETAIL.deletion_countdown_prefix' | translate }} {{ deleteCountdown() }}
        </div>
      }
      @if (actionError()) {
        <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{{ actionError() }}</span>
        </div>
      }
      @if (club()!.description) {
        <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{{ 'CLUB_DETAIL.about' | translate }}</h2>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ club()!.description }}</p>
        </section>
      }
      @if (club()!.tags && club()!.tags.length > 0) {
        <section class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{{ 'CLUB_DETAIL.tags_title' | translate }}</h2>
          <ul class="flex flex-wrap gap-2">
            @for (tag of club()!.tags; track tag) {
              <li class="rounded-full bg-primary-100 dark:bg-primary-900/30 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                {{ tag }}
              </li>
            }
          </ul>
        </section>
      }
      @if (organizerProfile()) {
        <aside class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{{ 'CLUB_DETAIL.organizer_title' | translate }}</h2>
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden="true">
              {{ organizerProfile()!.displayName | initials }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ organizerProfile()!.displayName }}</p>
              <span class="text-xs font-medium text-accent-600 dark:text-accent-400">{{ 'CLUB_DETAIL.organizer_badge' | translate }}</span>
            </div>
          </div>
          @if (organizerProfile()!.socialsPublic && organizerProfile()!.socials) {
            <div class="mt-4 flex flex-wrap gap-3">
              @if (organizerProfile()!.socials!.telegram) {
                <a [href]="'https://t.me/' + organizerProfile()!.socials!.telegram" target="_blank" rel="noopener noreferrer"
                   class="text-blue-500 hover:text-blue-600 text-lg" [attr.aria-label]="'Telegram'">✈️</a>
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
        </aside>
      }
      <app-club-info [club]="club()!" />
      <app-club-members-list
        [members]="members()"
        [clubBans]="clubBans()"
        [isOwner]="isClubOwner()"
        [currentUserId]="currentUserId()"
        (kick)="handleKick($event)"
        (ban)="handleBan($event)" />
      @if (isClubOwner()) {
        <app-club-manage-panel [clubId]="id()" />
      }
      @if (isClubOwner()) {
        <app-club-schedule
          [club]="club()!"
          [isOwner]="isClubOwner()"
          (pauseRequested)="pauseClub()"
          (cancelRequested)="cancelClub()"
          (reschedule)="rescheduleSubmit($event)" />
      }
      <footer class="text-xs text-gray-400 dark:text-gray-600 text-right">
        {{ 'CLUB_DETAIL.created' | translate }} {{ club()!.createdAt | formatDate }}
      </footer>
    </div>
  </main>
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
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';" }
      ]
    }
  ]
}
````

## File: src/app/core/services/quiz.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { Quiz, QuizAttempt, QuizQuestion } from '../models/quiz.model';
interface ApiQuiz {
  id: string;
  club_id: string;
  created_by: string;
  title: string;
  description: string | null;
  is_active: boolean;
}
interface ApiQuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
}
interface ApiAttemptResponse {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total: number;
  answers: number[];
}
function mapQuiz(raw: ApiQuiz): Quiz {
  return {
    id: raw.id,
    clubId: raw.club_id,
    createdBy: raw.created_by,
    title: raw.title,
    description: raw.description,
    isActive: raw.is_active,
  };
}
function mapQuestion(raw: ApiQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    quizId: raw.quiz_id,
    question: raw.question,
    options: raw.options,
    correctIndex: raw.correct_index,
  };
}
function mapAttempt(raw: ApiAttemptResponse): QuizAttempt {
  return {
    id: raw.id,
    quizId: raw.quiz_id,
    userId: raw.user_id,
    score: raw.score,
    total: raw.total,
    answers: raw.answers,
  };
}
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private readonly _quizzes = signal<Quiz[]>([]);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _isLoading = signal(false);
  readonly quizzes = this._quizzes.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
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
          correct_index: q.correctIndex,
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
        this.http.patch(`${this.api}/quizzes/${quizId}/active`, { is_active: isActive }),
      );
      this._quizzes.update(prev =>
        prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
}
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
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
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
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, TranslateModule, BookIntroComponent, LoadingSpinnerComponent],
  templateUrl: './register.component.html',
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
  protected readonly passwordStrength = computed<'weak' | 'medium' | 'strong' | null>(() => {
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

## File: src/app/features/clubs/clubs-list/clubs-list.component.ts
````typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';
import { SeoService } from '../../../core/services/seo.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubCardComponent } from './club-card/club-card.component';
@Component({
  selector: 'app-clubs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule, FormatDatePipe, ClubCardComponent],
  templateUrl: './clubs-list.component.html',
})
export class ClubsListComponent implements OnInit {
  readonly clubService = inject(ClubService);
  readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  readonly joiningClubId = signal<string | null>(null);
  readonly cityKeys = computed(() => Object.keys(this.clubService.upcomingByCity()));
  readonly ownedClubIds = this.clubService.myOwnedClubIds;
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
    "prepare": "husky install"
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
  "dependencies": {
    "@angular/common": "^20.1.0",
    "@angular/compiler": "^20.1.0",
    "@angular/core": "^20.1.0",
    "@angular/forms": "^20.1.0",
    "@angular/platform-browser": "^20.1.0",
    "@angular/router": "^20.1.0",
    "@ngx-translate/core": "^17.0.0",
    "@ngx-translate/http-loader": "^17.0.0",
    "qrcode": "^1.5.4",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "@angular/build": "^20.1.5",
    "@angular/cli": "^20.1.5",
    "@angular/compiler-cli": "^20.1.0",
    "@types/jasmine": "~5.1.0",
    "@types/qrcode": "^1.5.6",
    "angular-eslint": "21.0.1",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.1",
    "eslint-plugin-rxjs-x": "^0.9.5",
    "husky": "^8.0.0",
    "jasmine-core": "~5.8.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "postcss": "^8.5.9",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.8.2",
    "typescript-eslint": "8.46.4"
  }
}
````

## File: src/app/core/auth/auth.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { ApiUserProfile, ApiUserStats, mapUserProfile, mapUserStats } from '../api/api-mappers';
import { TokenStore } from './token.store';
import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';
interface AuthResponse {
  access_token: string;
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
  private readonly _statsResource = resource({
    params: () => this._currentUser()?.id ?? null,
    loader: ({ params: userId }) => {
      if (!userId) return Promise.resolve(null as UserStats | null);
      return firstValueFrom(
        this.http.get<ApiUserStats>(`${environment.apiUrl}/users/me/stats`).pipe(
          catchError(() => of(null)),
        ),
      ).then(raw => (raw ? mapUserStats(raw) : null));
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
          display_name: displayName,
          role,
        }),
      );
      this.tokenStore.set(resp.access_token);
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
      this.tokenStore.set(resp.access_token);
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
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me`, { display_name: name }),
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
        socials_public: value,
      }),
    );
    this._currentUser.set({ ...user, socialsPublic: value });
  }
}
````

## File: src/app/core/services/club.service.ts
````typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiClub, ApiClubMember, ApiBanRecord, mapClub, mapClubMember, mapBanRecord } from '../api/api-mappers';
import { AuthService } from '../auth/auth.service';
import { AfterMeetingVenue, BanDuration, BanRecord, Club, ClubMemberDetail } from '../models/club.model';
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
  readonly cityFilter = this._cityFilter.asReadonly();
  readonly myOwnedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    return this._clubs().filter(c => c.organizerId === userId);
  });
  readonly myOwnedClubIds = computed<Set<string>>(() =>
    new Set(this.myOwnedClubs().map(c => c.id)),
  );
  readonly myClubIds = computed(() => new Set(this._myClubs().map(c => c.id)));
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
  readonly availableCities = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const c of this._clubs()) if (c.city) seen.add(c.city);
    return [...seen].sort((a, b) => a.localeCompare(b));
  });
  readonly upcomingByCity = computed<Record<string, Club[]>>(() => {
    const filter = this._cityFilter();
    const clubs = this._clubs()
      .filter(c => c.nextMeetingDate !== null)
      .filter(c => !filter || c.city === filter)
      .sort((a, b) => {
        const aDate = a.nextMeetingDate ?? '';
        const bDate = b.nextMeetingDate ?? '';
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
    return clubs.reduce<Record<string, Club[]>>((acc, club) => {
      const city = club.city ?? 'Other';
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
    city?: string;
    tags?: string[];
    meetingDurationMinutes?: number | null;
    afterMeetingVenue?: AfterMeetingVenue | null;
  }): Promise<Club> {
    const raw = await firstValueFrom(
      this.http.post<ApiClub>(`${environment.apiUrl}/clubs`, {
        name: payload.name,
        description: payload.description,
        is_public: payload.isPublic,
        city: payload.city,
        tags: payload.tags ?? [],
        meeting_duration_minutes: payload.meetingDurationMinutes ?? null,
        after_meeting_venue: payload.afterMeetingVenue ?? null,
      }),
    );
    const club = mapClub(raw);
    this._clubs.update(existing => [club, ...existing]);
    this._myClubs.update(existing => [club, ...existing]);
    return club;
  }
  async joinClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<{ member_count: number }>(`${environment.apiUrl}/clubs/${clubId}/join`, {}),
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
  async pauseClub(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/pause`, {}),
    );
    this._updateClub(mapClub(raw));
  }
  async cancelClub(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/cancel`, {}),
    );
    this._updateClub(mapClub(raw));
  }
  async rescheduleMeeting(clubId: string, newDate: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/reschedule`, {
        new_date: newDate,
      }),
    );
    this._updateClub(mapClub(raw));
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
  msUntilDeletion(club: Club): number | null {
    if (club.status !== 'cancelled' || !club.cancelledAt) return null;
    const elapsed = Date.now() - new Date(club.cancelledAt).getTime();
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    return remaining > 0 ? remaining : null;
  }
  private _updateClub(updated: Club): void {
    this._clubs.update(list => list.map(c => (c.id === updated.id ? updated : c)));
    this._myClubs.update(list => list.map(c => (c.id === updated.id ? updated : c)));
  }
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
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration } from '../../../core/models/club.model';
import { UserProfile } from '../../../core/models/user.model';
import { SeoService } from '../../../core/services/seo.service';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubMembersListComponent } from './members/club-members-list.component';
import { ClubScheduleComponent } from './schedule/club-schedule.component';
import { ClubHeaderComponent } from './header/club-header.component';
import { ClubInfoComponent } from './info/club-info.component';
import { ClubManagePanelComponent } from './manage-panel/club-manage-panel.component';
@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    InitialsPipe,
    FormatDatePipe,
    ClubMembersListComponent,
    ClubScheduleComponent,
    ClubHeaderComponent,
    ClubInfoComponent,
    ClubManagePanelComponent,
  ],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  readonly id = input.required<string>();
  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
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
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);
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
  readonly deleteCountdown = computed<string | null>(() => {
    this._lang();
    const c = this.club();
    if (!c) return null;
    const ms = this.clubService.msUntilDeletion(c);
    if (ms === null) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0)
      return this.translate.instant('CLUB_DETAIL.deletion_countdown_hours', { hours, minutes });
    return this.translate.instant('CLUB_DETAIL.deletion_countdown_minutes', { minutes });
  });
  constructor() {
    effect((onCleanup) => {
      const clubId = this.id();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      this.loadClub(clubId, () => cancelled).catch(() => {});
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
        this.members.set(await this.clubService.getClubMembers(clubId));
        if (isCancelled()) return;
        this.clubBans.set(await this.clubService.getBans(clubId));
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
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.clubService.joinClub(this.id());
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Failed to join club');
    } finally {
      this.isActionLoading.set(false);
    }
  }
  async onLeave(): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.clubService.leaveClub(this.id());
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Failed to leave club');
    } finally {
      this.isActionLoading.set(false);
    }
  }
  async handleKick(userId: string): Promise<void> {
    await this.clubService.kickMember(this.id(), userId);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }
  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    await this.clubService.banMember(this.id(), event.userId, event.duration);
    this.members.update(list => list.filter(m => m.userId !== event.userId));
  }
  async pauseClub(): Promise<void> {
    await this.clubService.pauseClub(this.id());
    await this.refreshClub();
  }
  async cancelClub(): Promise<void> {
    await this.clubService.cancelClub(this.id());
    await this.refreshClub();
  }
  async rescheduleSubmit(date: string): Promise<void> {
    if (!date) return;
    await this.clubService.rescheduleMeeting(this.id(), date);
    await this.refreshClub();
  }
  private async refreshClub(): Promise<void> {
    const updated = await this.clubService.getClubById(this.id());
    if (updated) this.club.set(updated);
  }
}
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
          node-version: 20
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
