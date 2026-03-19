# Contributing to NuxtShop

Thanks for your interest in contributing to NuxtShop! This project is designed both as a learning resource and as a practical starter for real-world e-commerce apps. Contributions that improve code quality, documentation, DX, or real-world readiness are very welcome.

## Ways to contribute

- Fix bugs or improve error handling
- Improve documentation and examples
- Add or refine tests (Vitest / Playwright)
- Enhance developer tooling (linting, DX, CI, etc.)
- Extend existing features while keeping the architecture consistent

## Workflow

1. **Fork & clone**
   - Fork the repo on GitHub and clone your fork locally.

2. **Create a feature branch**
   - Use a descriptive name, e.g. `feat/profile-timezone`, `fix/cart-discount-bug`.

3. **Install dependencies & prepare env**
   - Install: `npm install`
   - Copy env file: `cp .env.development.example .env`
   - Start services (Mongo / Redis) as described in the README.

4. **Implement your change**
   - Follow existing patterns for modules (UI / composables / server/api).
   - Keep Typescript types and API contracts up to date (`types/api.ts`, etc.).
   - Avoid introducing breaking changes to public APIs unless clearly justified.

5. **Run checks locally**

   ```bash
   npm run lint
   npm run test:unit
   # Optionally: run Playwright tests if your changes affect E2E flows
   ```

6. **Open a Pull Request**
   - Describe the motivation and high-level change.
   - Mention any breaking changes or migration notes (if applicable).
   - Include screenshots or logs when relevant (e.g. for UI or error handling changes).

## Code style & conventions

- Use `<script setup>` + Composition API for Vue components.
- Prefer small, focused composables and server utilities.
- Keep domain logic inside modules or `server/utils`, not directly in pages.
- Use the existing error format `{ code, message, details }` via `createApiError`.
- For auth-related server logic, use helpers from `server/utils/auth.ts` instead of parsing tokens manually.

## Questions or ideas?

If you are unsure whether a change fits the project, feel free to open a GitHub issue describing your idea before starting implementation. This helps keep the scope clear and avoids duplicated effort.

