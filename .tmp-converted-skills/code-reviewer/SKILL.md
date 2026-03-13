---
name: code-reviewer
description: Review code changes for correctness, regressions, maintainability, security, and performance. Use when the user asks for a review, risk assessment, PR feedback, or a second pass on an implementation rather than new feature development.
---

# Code Reviewer

## Overview

Use this skill for critical review work. Prioritize bugs, behavioral regressions, unsafe assumptions, missing tests, and maintainability risks over style preferences.

## Review Workflow

1. Inspect the changed code and enough surrounding context to understand behavior.
2. Identify concrete issues with evidence and likely impact.
3. Prefer findings that would block merge, cause production issues, or create future maintenance risk.
4. Keep summaries short; findings come first.

## What To Look For

- Incorrect logic, state transitions, or data handling
- Broken edge cases, loading states, and failure paths
- Security, privacy, or auth regressions
- Performance issues with real user impact
- Missing or weak test coverage around risky behavior
- Coupling or complexity that makes future changes unsafe

## Review Output

- List findings in severity order.
- Include file and line references when available.
- Explain why each issue matters and what behavior could break.
- If there are no findings, say so directly and note any residual testing gaps or uncertainty.

## Review Boundaries

- Do not pad the review with style-only comments unless style causes real risk.
- Do not rewrite the implementation unless the user asks for fixes after the review.
