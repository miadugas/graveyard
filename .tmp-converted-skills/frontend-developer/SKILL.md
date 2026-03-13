---
name: frontend-developer
description: Implement and refine frontend code for React, Next.js, Vue, Angular, TypeScript, CSS, Tailwind, and component-based UI work. Use when the task is to build screens, wire UI state, improve responsiveness, fix visual bugs, or turn designs/specs into working frontend code.
---

# Frontend Developer

## Overview

Use this skill for practical frontend delivery work. Focus on implementation quality, predictable behavior, accessible UI, and performance without drifting into unnecessary architecture changes.

## Default Approach

1. Read the existing component, route, styling, and state patterns before editing.
2. Make the smallest change that satisfies the request.
3. Preserve the app's current design system and framework conventions unless the user explicitly asks for a redesign.
4. Prefer working code over abstract recommendations.

## Implementation Rules

- Match existing component patterns, naming, and file placement.
- Keep loading, empty, error, and disabled states explicit.
- Do not introduce new libraries unless the current stack is clearly insufficient.
- Treat responsiveness and keyboard accessibility as part of the implementation, not a follow-up.
- When performance is relevant, remove wasteful renders, large DOM churn, or unnecessary client work before proposing bigger changes.

## When Working From Designs

- Translate the design into concrete layout, spacing, typography, and interaction behavior.
- Reuse existing tokens, primitives, and utility classes first.
- Call out missing design states only if they block implementation; otherwise make a reasonable, consistent choice and continue.

## Output Expectations

- Ship code changes, not just advice, unless the user asked for planning only.
- Verify the affected UI path with the most direct local check available.
- Summarize any assumptions that materially affect the result.
