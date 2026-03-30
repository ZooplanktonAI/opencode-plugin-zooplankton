# TODO

Unaddressed advisory issues from code reviews, tracked for future consideration.

## TODO-1: Add clone and npm install steps to README Development section

**Source:** PR #2, Final Round (reviewer-minimax advisory #5)

The README "Development" section currently only shows `npm test`. Consider adding
explicit `git clone` and `npm install` steps for first-time contributors who may
not be familiar with the workflow. Currently skipped because `npm install` is a
no-op for this zero-dependency project and clone instructions are generic, but
mentioning them could lower the barrier for newcomers.
