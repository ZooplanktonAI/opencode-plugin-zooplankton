# Changelog

All notable changes to this project will be documented in this file.

## [0.2.4] — 2026-04-17

### Fixed
- Removed `config` hook from `_createPlugin`. OpenCode ≤1.4.7 crashes with `TypeError: undefined is not an object (evaluating 'R.startsWith')` in `systemPaths()` when any element of `config.instructions` is `undefined`. The `experimental.chat.system.transform` hook already injects coding standards into every LLM call with full deduplication, making the `config.instructions` path redundant. Dropping it eliminates the crash entirely.

## [0.2.3] — 2026-04-17

### Fixed
- Migrated to OpenCode v1 plugin format (`export default { id, server }`). OpenCode 1.4.7 changed `getLegacyPlugins` to throw a `TypeError` when any named export is not a function. With v1 format, OpenCode uses only `mod.default` and skips the legacy path entirely, preventing any future crash from named utility exports.

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
