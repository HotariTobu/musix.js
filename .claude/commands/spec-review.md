---
description: Review a specification and its implementation
argument-hint: <spec-name>
allowed-tools: Read, Glob, Grep, Task
---

# Review Specification and Implementation

Spec name: $ARGUMENTS

## Task

1. Read the specification from `docs/specs/<spec-name>/spec.md`
2. Identify related implementation code
3. Conduct a review from the following perspectives:

### Specification Review
- [ ] Is the overview clear?
- [ ] Are requirements specific and implementable?
- [ ] Is the API design appropriate (naming, type definitions, parameters)?
- [ ] Is error handling comprehensive?
- [ ] Are test requirements sufficient?
- [ ] Are edge cases considered?

### Implementation Review (if implementation exists)
- [ ] Does it meet all functional requirements in the spec?
- [ ] Does it follow the API design in the spec?
- [ ] Is error handling from the spec implemented?
- [ ] Are there any features not in the spec?

### Test Review (if tests exist)
- [ ] Do tests cover spec test requirements?
- [ ] Are there happy path and error case tests?

## Output

Report review results in the following format:

1. **Compliant Items** - Points where spec and implementation match
2. **Non-Compliant Items** - Points where spec and implementation differ
3. **Improvement Suggestions** - Suggestions for spec or implementation
4. **Unimplemented Items** - Spec items not yet implemented
