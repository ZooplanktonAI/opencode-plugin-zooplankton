# opencode-plugin-zooplankton

A lightweight global [OpenCode](https://opencode.ai) plugin that injects ZooplanktonAI coding standards into every session via `config.instructions`.

## What it does

Pushes `instructions/coding-standards.md` into OpenCode's instruction context on startup. No agents, no skills, no commands — just rules.

Current rules:

1. **Skeleton-then-replace for large files** — write a stub structure first, then fill in implementations chunk by chunk.
2. **Prefer Edit over Write for existing files** — use targeted find-and-replace instead of full file rewrites.
3. **Prefer `master` over `main`** — use `master` as the default branch name for new repos.

## Installation

Install globally so it applies to every project:

```sh
# In ~/.config/opencode/
npm install opencode-plugin-zooplankton
```

Add to `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["opencode-plugin-zooplankton"]
}
```

## Adding rules

Edit `instructions/coding-standards.md` and bump the version in `package.json`, then republish.
