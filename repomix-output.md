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
        chat.model.ts
        club.model.ts
        event.model.ts
        quiz.model.ts
        randomizer.model.ts
        user.model.ts
      services/
        book-cover.service.ts
        chat.service.ts
        club.service.ts
        event.service.ts
        geocoding.service.ts
        quiz.service.ts
        randomizer.service.ts
        seo.service.ts
        toast.service.ts
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
          club-event-card/
            club-event-card.component.html
            club-event-card.component.ts
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
eslint.config.js
karma.conf.js
package.json
README.md
repomix.config.json
SECURITY.md
sonar-project.properties
spartan_plan.md
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.spec.json
vercel.json
```
