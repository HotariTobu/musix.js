.PHONY: install test check preflight

install:
	bun install --frozen-lockfile

check:
	bun run check:code
	bun run check:types

test:
	bun test

preflight: install check test