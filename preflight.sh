#!/bin/bash
# preflight.sh - Quality gate for CI, session-start, and session-end
#
# This script verifies that the codebase is in a healthy state.
# It should pass before:
# - Merging code (CI)
# - Starting a coding session (session-start)
# - Committing changes (session-end)

set -e

echo "=== Preflight Check ==="

echo "Installing dependencies..."
bun install --frozen-lockfile

echo "Running code quality checks..."
bun run check:code

echo "Running tests..."
bun test

echo "=== Preflight Check Passed ==="
