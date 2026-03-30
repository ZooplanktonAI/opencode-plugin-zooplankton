# TODO

Unaddressed advisory issues from code reviews, tracked for future consideration.

## TODO-1: Add a "Development" section to README.md

**Source:** PR #1, Round 2 (orchestrator advisory #3); Round 1 (claude-sonnet-4.6 advisory #3)

Add a short "Development" or "Testing" section to `README.md` mentioning `npm test`.
This helps first-time contributors discover how to run the test suite.

Skipped in the test-only PR to keep the diff focused.

## TODO-2: Add defensive guards to the plugin config hook

**Source:** PR #1, Round 1 (qwen3.5-plus advisory #3)

Consider adding `if (!config || typeof config !== 'object') return;` and
`if (!Array.isArray(config.instructions)) config.instructions = [];` to the plugin's
config hook for defensive programming.

Currently unnecessary because the OpenCode framework guarantees a valid config object,
but could improve robustness if the plugin is ever used outside that context.
