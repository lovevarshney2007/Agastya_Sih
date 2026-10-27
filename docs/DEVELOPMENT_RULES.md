# DEVELOPMENT RULES — Agastya SIH / APAAR Portal

## Architecture Rules
1. ALL API calls go through src/api/client.ts - never fetch() directly in components
2. Components receive data via props or load from real API - no inline fetch in JSX
3. Loading, error, empty states are REQUIRED for every API-connected component
4. Mock data (mockData.ts) is ONLY a visual fallback when backend is unavailable - NOT default behavior
5. Never show fake success for failed API calls

## API Integration Rules
1. Use typed response generics in apiFetch<T>()
2. Never hardcode institution IDs - always from sessionUser.institution_id
3. Bearer token is automatically attached by apiFetch when auth=true (default)
4. Handle 401 responses by clearing session and redirecting to login
5. Log errors to console in development; display user-friendly message in UI

## Security Rules
1. APAAR IDs are sensitive - never log full IDs, never display unmasked
2. JWT tokens stored in localStorage only (not sessionStorage or cookies)
3. Role checks must be server-enforced - frontend hiding is supplemental only
4. Never expose stack traces in production UI

## UI/UX Rules
1. Every interactive element must have an accessible name (aria-label for icon buttons)
2. Use semantic HTML: nav, main, section, article, table, form elements correctly
3. All form inputs have associated labels
4. Focus states must be visible (no outline:none without custom focus ring)
5. Status changes must have text feedback (not color-only)

## State Management Rules
1. Server state (API data) and UI state (tabs, modals) are separate
2. After successful mutation, re-fetch affected data
3. Optimistic updates only for trivial local state
4. Do not replicate backend data in frontend state unnecessarily

## Code Style
1. TypeScript strict mode - no 'any' unless absolutely necessary
2. Component props typed as interfaces, not type aliases
3. Async handlers: try/catch with specific error messages
4. No console.log in production (use console.error for actual errors)
5. Export named, not default (exception: App.tsx for tree-shaking)
