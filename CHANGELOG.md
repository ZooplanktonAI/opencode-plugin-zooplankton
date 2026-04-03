# Changelog

All notable changes to this project will be documented in this file.

## [0.2.2] — 2026-04-03

### Fixed
- Added `typeof content === "string"` and `typeof filePath === "string"` guards in `_createPlugin`. OpenCode's plugin loader iterates `Object.values(mod)` and calls every exported function as a plugin; without the guards, `_createPlugin` was called with wrong argument types, causing `undefined` to be pushed into `config.instructions` and crashing OpenCode with `undefined.startsWith`.

## [0.2.1] — 2026-04-03

### Changed
- Version bump only (no functional changes from 0.2.0; published to npm as part of CI validation).

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
