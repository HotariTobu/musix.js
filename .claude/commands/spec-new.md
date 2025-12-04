# Create a New Specification

Feature name: $ARGUMENTS

## Task

1. Ask the user which type of specification to create:
   - **Feature**: New feature (use `docs/specs/templates/FEATURE.md`)
   - **Enhancement**: Improvement to existing feature (use `docs/specs/templates/ENHANCEMENT.md`)
   - **Fix**: Bug fix (use `docs/specs/templates/FIX.md`)
   - **Refactor**: Code refactoring (use `docs/specs/templates/REFACTOR.md`)

2. Create a new specification file based on the selected template
   - Filename: `yyyymmdd-[type]-name.md`
     - `yyyymmdd`: Date (e.g., `20251204`)
     - `[type]`: `feat` | `enhance` | `fix` | `refact`
     - `name`: Kebab-case name (e.g., `spotify-adapter`)

3. Work with the user to fill in the sections according to the template

## Guidelines

- Write specifications clearly and specifically
- Avoid ambiguous expressions; detail to an implementable level
- Include TypeScript type definitions
- Consider edge cases
