# opencode-plugin-zooplankton

A lightweight global [OpenCode](https://opencode.ai) plugin that injects ZooplanktonAI coding standards into every session via `config.instructions` and `experimental.chat.system.transform`.

## What it does

Pushes `instructions/coding-standards.md` into OpenCode's instruction context on startup. No agents, no skills, no commands — just rules.

Current rules:

1. **Skeleton-then-replace for large files** — write a stub structure first, then fill in implementations chunk by chunk.
2. **Prefer Edit over Write for existing files** — use targeted find-and-replace instead of full file rewrites.
3. **Prefer `master` over `main`** — use `master` as the default branch name for new repos.

## How it works

The plugin uses two complementary mechanisms to inject coding standards:

1. **`config` hook** — Pushes the path to `instructions/coding-standards.md` into `config.instructions`, so OpenCode loads it as a session-level instruction file (with the "Instructions from:" banner).

2. **`experimental.chat.system.transform` hook** — Appends the coding standards content directly into the system prompt array for every LLM call, including subagent calls. This ensures standards remain salient even in long multi-agent conversations where trailing instructions may be deprioritized.

> **Note:** The `experimental.chat.system.transform` hook is an experimental OpenCode API (available since OpenCode ≥0.1) and may change in future versions.

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

## Development

Requires **Node.js >= 20**.

```sh
git clone git@github.com:ZooplanktonAI/opencode-plugin-zooplankton.git
cd opencode-plugin-zooplankton
npm install
npm test
```
