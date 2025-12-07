# Implement Based on Specification

Specification: $ARGUMENTS

## Task

### Initialization Phase (First Run Only)

If `docs/specs/<spec-name>/progress.json` does not exist:

1. Create `progress.json` with all requirements set to `passes: false`:
   ```json
   {
     "status": "in_progress",
     "lastUpdated": "<today>",
     "requirements": [
       { "id": "REQ-001", "passes": false },
       { "id": "REQ-002", "passes": false }
     ],
     "blockers": [],
     "notes": "Implementation started"
   }
   ```
2. Verify environment: `bun install && bun test --run`
3. Create initial commit: `feat(<spec-name>): start implementation`

### Implementation Phase

1. Read the specified specification file from `docs/specs/`
2. Analyze the specification content and create an implementation plan
3. Implement according to the requirements in the specification:
   - Implement type definitions and interfaces from the API Design section
   - Create code that meets functional requirements
   - Implement error handling according to the Error Handling section
4. Create tests based on the Test Requirements section
5. After implementation, update the requirements checklist in the specification

## Guidelines

- Do not implement features not described in the specification
- Strictly follow the type definitions in the specification
- Tests must cover the test requirements in the specification
- If unclear points in the spec are found during implementation, confirm before implementing

## Pre-Implementation Checklist

Confirm the following before implementation:
- [ ] Is the specification up to date?
- [ ] Are all requirements clear?
- [ ] Are dependencies resolved?
