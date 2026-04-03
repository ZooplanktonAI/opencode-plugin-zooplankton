# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] — 2026-03-31

### Added
- `experimental.chat.system.transform` hook to inject coding standards into every LLM call (including subagents).
- Deduplication logic to avoid injecting standards twice.
- Graceful degradation when `coding-standards.md` is missing.
- Comprehensive test suite (`node:test`).

## [0.1.0] — 2026-03-30

### Added
- Initial release.
- `config` hook to push `instructions/coding-standards.md` into OpenCode session instructions.
- Three coding standard rules: skeleton-then-replace, prefer-edit, prefer-master.
