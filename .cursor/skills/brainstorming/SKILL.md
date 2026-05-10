---
name: brainstorming
description: Generates multiple solution ideas, compares trade-offs, and recommends a practical path. Use when users ask for brainstorming, idea generation, option comparison, or exploratory planning before implementation.
---

# Brainstorming

## Goal

Produce high-quality options quickly, then converge on a practical recommendation.

## Workflow

1. Restate the problem in one sentence.
2. Generate 3-5 distinct options (not minor variations).
3. Evaluate each option with:
   - Pros
   - Risks
   - Cost/effort
   - Best-fit scenario
4. Recommend one option with a short rationale.
5. Provide a next-step action list.

## Output Format

Use this structure:

```markdown
## Problem
[One-sentence restatement]

## Options
### Option 1: [Name]
- Pros:
- Risks:
- Effort:
- Best for:

### Option 2: [Name]
- Pros:
- Risks:
- Effort:
- Best for:

### Option 3: [Name]
- Pros:
- Risks:
- Effort:
- Best for:

## Recommendation
[Chosen option + why]

## Next Steps
1. ...
2. ...
3. ...
```

## Quality Bar

- Options should be meaningfully different.
- Trade-offs should be explicit and realistic.
- Recommendation should align with constraints (time, risk, complexity).
