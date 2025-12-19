.PHONY: install test check preflight

install:
	bun install --frozen-lockfile

check:
	bun run check:code

test:
	bun test

preflight: install check test