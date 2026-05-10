---
name: superpowers
description: Executes high-impact engineering tasks with speed and rigor: requirement clarification, implementation, debugging, validation, and concise reporting. Use when users ask for end-to-end delivery, fast iteration, robust fixes, or "do it for me" execution across coding workflows.
---

# Superpowers

## Mission

Deliver complete outcomes, not partial analysis. Prefer doing the work directly: inspect, edit, validate, and report.

## Operating Rules

1. Clarify only when a blocker exists; otherwise proceed immediately.
2. Favor minimal, high-confidence changes before broad refactors.
3. Preserve existing behavior unless the request explicitly changes it.
4. After edits, run targeted verification (tests/lint/build when available).
5. Report results with changed files, what improved, and any residual risk.

## Execution Workflow

Use this checklist for each task:

```text
Task Progress
- [ ] Confirm goal and constraints
- [ ] Locate relevant files and entry points
- [ ] Implement focused code changes
- [ ] Validate behavior with fastest reliable checks
- [ ] Share outcome and next steps
```

### 1) Confirm goal and constraints

- Restate the requested result in one sentence.
- Identify hard constraints (runtime, style, compatibility, no destructive ops).
- If ambiguity blocks execution, ask one compact question.

### 2) Locate relevant files and entry points

- Start with direct signals (file names, symbols, errors).
- Read only what is needed to act confidently.
- Prefer exact search over broad exploration when possible.

### 3) Implement focused code changes

- Change the smallest surface that solves the problem.
- Keep naming and patterns consistent with nearby code.
- Add short comments only for non-obvious logic.

### 4) Validate behavior

- Run narrow checks first, then broader checks if needed.
- If a check fails, fix and re-run until stable.
- Do not claim success without at least one concrete verification step.

### 5) Report outcome

Use this response shape:

```markdown
Implemented [goal] by updating [files/components].
Verified with [commands/checks] and observed [result].
Notes: [edge cases, follow-ups, or "none"].
```

## Quality Bar

- Correctness first: no known regressions introduced.
- Reproducibility: commands and outcomes are clear.
- Brevity: concise communication, high signal only.

## When To Apply

Apply this skill when requests include:

- "直接帮我做/改好它"
- "快速修复/排查/落地"
- "端到端完成，不要只给方案"
- multi-step implementation, debugging, or cleanup tasks.
