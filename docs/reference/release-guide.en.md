# Release & Versioning Guide

NuxtShop is primarily a learning / internal‑scaffold‑style project. The goal
of a release process here is to:

- Provide clear “stable” versions for consumers;
- Make it easy to deploy a specific version in different environments;
- Leave room for using NuxtShop as a team scaffold in the future.

This document describes a lightweight but practical approach.

## 1. Versioning strategy

Use Semantic Versioning:

```text
MAJOR.MINOR.PATCH   e.g. 0.3.0, 1.0.0
```

- **MAJOR** – increment when making breaking changes, e.g.:
  - Large module renames or directory restructures;
  - Breaking API changes (`/api/cart` → `/api/carts`);
  - Significant changes to configuration or required env vars.

- **MINOR** – backward‑compatible feature additions:
  - New business modules (coupons, campaigns, etc.);
  - New demos or architecture docs.

- **PATCH** – backward‑compatible bug fixes and small tweaks:
  - Fixes to page logic or API behavior;
  - Documentation updates, UI polish, etc.

For now, `0.x` versions are suitable to indicate that the project is still
evolving quickly.

## 2. Branches & tags

Recommended minimal branching model:

- `main` – always buildable and deployable.
- `feature/*` – feature branches, e.g.:
  - `feature/cart-discount`
  - `feature/docs-en-release-guide`

Use Git tags to mark releases, e.g.:

```bash
git tag v0.3.0
git push origin v0.3.0
```

Then create a GitHub Release for that tag with a short summary and a link
to the relevant section in `CHANGELOG.md`.

## 3. Suggested release workflow

Example for releasing `v0.3.0`:

1. Finish development and local testing on a feature branch:
   - `npm run lint`
   - `npm run test:unit`
   - Optionally run Playwright E2E tests.

2. Open a PR into `main`, ensure CI passes.

3. On `main`, bump the version:

   ```bash
   npm version minor   # or patch / major
   git push origin main
   git push origin --tags
   ```

4. Update `CHANGELOG.md`:
   - Move entries from `[Unreleased]` into `[0.3.0]`;
   - Group them under Added / Changed / Fixed / Docs.

5. On GitHub, create a Release for tag `v0.3.0`:
   - Add a short summary;
   - If there are breaking changes, call them out in a dedicated section.

CI can be configured to trigger deployments (e.g. building Docker images,
deploying a demo environment) when a `v*` tag is pushed.

## 4. Mongo & env variables compatibility

Because the project uses MongoDB and Redis, keep an eye on compatibility
when changing data models or environment variables.

### 4.1 MongoDB schema

- Prefer **adding fields** over renaming or removing them;
- If you must reshape data:
  - First support both old and new fields in the code;
  - Provide a one‑off migration script (e.g. `scripts/migrate-v0.2-to-v0.3.ts`);
  - Document the migration requirement in the changelog.

### 4.2 Environment variables

- When adding vars:
  - Update `.env.*.example` and README accordingly.
- When deprecating vars:
  - Keep compatibility for at least one MINOR version;
  - Mark them as “Deprecated” in the changelog.
- Avoid logging full connection strings, passwords or other secrets.

## 5. Relationship with docs

- README describes the state of the *current* main branch – no multi‑version
  docs system is used.
- Detailed architecture is documented under `docs/architecture/*.md` and
  `*.en.md`.
- If a major refactor happens, consider adding a short “Applicable versions”
  note at the top of relevant docs, e.g.:

```md
Applies to: >= v1.0.0
```

or keep this context in the changelog.

## 6. Optional automation

Once the basic “main + tags + hand‑written changelog” flow is in place, you
can gradually add automation:

- [release‑please](https://github.com/googleapis/release-please)  
  A GitHub Action that generates release PRs and tags from commits.

- [changesets](https://github.com/changesets/changesets)  
  Use changeset files in PRs to drive version bumps and changelog entries.

For now, the manual flow described above should be more than enough for a
demo/scaffold project like NuxtShop, while keeping the release history clear
and easy to maintain.

