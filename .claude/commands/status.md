---
description: Show progress summary of all specs
allowed-tools: Read, Glob
---

# Project Status

## Task

Display progress summary of all specifications.

### Steps

1. **Scan all specs**
   - Find all directories in `docs/specs/` (excluding `templates/`)
   - For each spec directory, check for `progress.json`

2. **Collect status data**
   - Read `status`, `lastUpdated`, and count of `requirements` from each `progress.json`

3. **Generate summary table**

## Output Format

```
## Project Status

| Spec | Status | Progress | Last Updated | Blockers |
|------|--------|----------|--------------|----------|
| core-interfaces | in_progress | 3/5 | 2025-12-07 | None |
| spotify-adapter | pending | 0/8 | 2025-12-01 | API approval |

### Summary
- Total specs: X
- Completed: X
- In progress: X
- Pending: X

### Recommended Next Task
Based on dependencies and current progress, consider working on: <spec-name>
```

## Guidelines

- Keep output concise - only read status fields, not full spec content
- Sort by status: in_progress first, then pending, then completed
- Highlight any blockers that need attention
- If no specs exist, indicate that and suggest creating one with `/spec-new`
