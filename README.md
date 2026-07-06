# BookClubFe

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=leo477_book-club-fe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=leo477_book-club-fe)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

`src/environments/environment.ts` (used by default `ng serve` / `npm start`) points at `http://localhost:8000/api/v1`, so a local backend must be running on port 8000 before you serve the app. Use one of:

```bash
npm run dev    # ng serve + the mock-server (mock-server/) on localhost:8000, concurrently
```

or run a local FastAPI backend instance on port 8000 and then:

```bash
npm start      # ng serve only, expects a backend already on localhost:8000
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

Production builds (`ng build`) use `src/environments/environment.prod.ts` instead, via the `fileReplacements` config in `angular.json`, which points at the real deployed backend. Local dev no longer talks to production by default.

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
