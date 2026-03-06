# Agent Skills
> Derived from technical conversation history (2025–2026)

---

## Working Style

- **Plan first, code second** — always propose approach and wait for confirmation before implementing
- **Minimal and surgical** — prefer targeted changes over full rewrites
- **No additional summaries, diffs, or change indexes** unless explicitly asked
- Prefer working functional solutions over robust/over-engineered ones
- Direct communication — explicit do/don't callouts, no fluff

---

## React / TypeScript

### Optional Chaining
Always chain fully through arrays:
```ts
// Wrong — throws if [0] is undefined
array?.[0]["KEY"]

// Correct
array?.[0]?.KEY
```

### Key Props on Mapped Lists
Use index as fallback for undefined/duplicate IDs:
```tsx
key={item.id || `item-${index}`}
```

### Date Formatting
Native `Date` has no `.format()` — wrap with dayjs:
```ts
dayjs(dateValue).format("YYYY-MM-DD")
```

### Context Typing in Mocks/Storybook
```ts
// Wrong — Provider is a component value, not a type
DeepPartial<AppContextProvider>

// Correct — use the interface
DeepPartial<AppContextType>
```

### Tailwind CSS Opacity in Custom Properties
`/10` opacity shorthand doesn't work inside `var()`:
```ts
// Invalid
var(--color-spring-500/10)

// Valid — use arbitrary RGB syntax
rgb(39_127_58/0.1)
```

### React Strict Mode
In dev, Strict Mode double-invokes renders and effects — can mask race conditions, silent API duplication, and effects that accidentally rely on running twice. Disable by removing `<React.StrictMode>` wrapper in entry point. For Next.js, set `reactStrictMode: false` in `next.config.js`.

### Async in useEffect — Avoid `void`
```ts
// Bad — silently swallows rejections, spinner hangs forever
void makeApiCall();

// Good
useEffect(() => {
  const run = async () => {
    try {
      await makeApiCall();
    } catch (err) {
      // handle error
    }
  };
  run();
}, []);
```

### Screen Transition Flicker
When a destination screen has multiple async loading states causing a visible flash on navigation:
```ts
await new Promise(resolve => setTimeout(resolve, 2000));
navigate(nextRoute);
```

---

## Deprecated Libraries

| Library | Issue | Replacement |
|---|---|---|
| `react-input-mask` | Uses deprecated `findDOMNode` internally — breaks in StrictMode | `react-imask` |

---

## Storybook

For components with complex dependencies (Redux, Context, Router):
- Wrap with `MemoryRouter` decorator when component uses `useLocation()` or router hooks
- Create a mock Redux store and pass as decorator
- Import the context **type interface** (not the Provider component) for mock typing
- Match existing project pattern for story file location

---

## Form Validation

Recommended stack: **React Hook Form + Zod + `zodResolver`**

Standard ticket breakdown:
1. Shared `FormField` wrapper component — blocker for everything else
2. Zod schemas per screen
3. RHF integration into existing screens
4. Partner/variant-specific validation (defer until core is stable)

Always use existing CSS error variables/classes — never hardcode colors or create new ones.

---

## ESLint Import Order

5-tier system, warning-level enforcement (not error — avoids blocking builds):

```
1. External libraries        (react, lodash, clsx...)
2. Internal hooks/utils      (@/hooks/*, @/utils/*, @/context/*, @/api/*)
3. Components                (@/components/*)
4. Relative imports          (./x, ../x)
5. Styles & assets           (*.css, icons, images)
```

Alphabetical sorting within groups: disabled — use logical/dependency order instead.

---

## Git & SSH

### SSH Key Conflicts (Sourcetree)
Sourcetree generates its own SSH keys and injects a `# --- Sourcetree Generated ---` block into `~/.ssh/config`, overriding your authorized key.

Fix:
```bash
# Remove the Sourcetree block from ~/.ssh/config
ssh-add ~/.ssh/id_ed25519
ssh -T git@github.com  # verify
```

### Branch Comparison
```bash
# Filter diff to source files only
git diff release..develop -- src/
```
In Sourcetree: right-click target branch → "Diff Against Current". Enable "Ignore Whitespace" to reduce formatter noise.

### npm ENOTEMPTY Error
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Auth Security

### Token Storage Vulnerability (sessionStorage)
Storing access/refresh tokens in `sessionStorage` is vulnerable to XSS. Tokens are accessible to JavaScript.

**Preferred fix**: Backend-for-Frontend (BFF) proxy pattern with `httpOnly` cookies.

**Simpler frontend-only alternatives**:
- Auth0 Token Handler pattern
- Memory-only token storage
- Short-lived tokens with silent refresh

**Avoid**: Proposing full SSR + Redis to solve a token security problem — it's usually overkill.

Document security issues with: risk level, relevant compliance concern, remediation options, and backend team ownership.

---

## Session Replay / Analytics

Gate to specific environments using a compound conditional — don't rely on a single build flag:
```ts
if (import.meta.env.DEV && apiBaseUrl.includes("your-dev-subdomain")) {
  // initialize session replay
}
```
Initialize in the app entry point via dynamic script injection, not `index.html`.

---

## Feature Flags (LaunchDarkly)

Suppress verbose console output with an inline no-op logger (no extra imports):
```tsx
<LDProvider options={{
  logger: { debug: () => {}, info: () => {}, warn: () => {}, error: console.error }
}}>
```

---

## SVG & Images

- SVG beats PNG for logos on both scaling and file size for simple graphics
- If an SVG appears white on a site but blue when opened directly, the site is applying a CSS filter — the source file is unchanged
- For vectorization, always obtain original brand assets; don't trace rasterized exports (causes black backgrounds and edge artifacts)
- Adobe Illustrator Image Trace: Advanced options → "Ignore Color" checkbox removes white backgrounds before export

---

## Environment Debugging Checklist

When two environments look or behave differently:

- **Visual scale difference**: Check `html { font-size }` — all rem units scale from this; a missing rule means 16px vs 14px base
- **Stale data**: Clear sessionStorage; check for cached API responses persisting across sessions
- **Runtime config**: Verify env config object points to the correct API base URL
- **Flow/routing differences**: Check feature flag values, flow type identifiers, or user role fields that may differ between environments

---

## Micro-Frontend Architecture

For separate apps that need shared auth/context:
- **Module Federation** — best fit for Vite/React stacks; true independence with shared dependencies
- iframe embed — simplest but limited integration
- Web Components — good for framework-agnostic embedding
- single-spa — better for large teams needing full orchestration

Module Federation adds ~2–4 weeks to baseline for setup, dual deployment pipelines, and cross-app auth integration.

---

## Static vs API for Regulatory Documents

For static regulatory documents (PDFs that rarely change, no personalization needed):
- Host directly on S3/CDN; reference URL in frontend
- Use frontend logic to determine which variant to serve (e.g., by state)
- API endpoint only makes sense if backend tracking is a compliance requirement or documents need dynamic generation
