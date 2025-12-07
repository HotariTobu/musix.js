#!/bin/bash
# preflight.sh - Quality gate for CI, session-start, and session-end
#
# This script verifies that the codebase is in a healthy state.
# It should pass before:
# - Merging code (CI)
# - Starting a coding session (session-start)
# - Committing changes (session-end)

echo "=== Preflight Check ==="

echo "Step 1/3: Installing dependencies..."
if ! bun install --frozen-lockfile; then
  echo "FAILED: Dependency installation failed"
  echo "Try: rm -rf node_modules && bun install --frozen-lockfile"
  exit 1
fi

echo "Step 2/3: Running code quality checks..."
if ! bun run check:code; then
  echo "FAILED: Code quality check failed"
  echo "Run 'bun run check:code' to see details"
  exit 1
fi

echo "Step 3/3: Running tests..."
if ! bun test; then
  echo "FAILED: Tests failed"
  echo "Run 'bun test' to see details"
  exit 1
fi

echo "=== Preflight Check Passed ==="
