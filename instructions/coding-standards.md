# ZooplanktonAI Coding Standards

These rules apply to every ZooplanktonAI project. Follow them in all sessions.

## 1. Skeleton-then-Replace for Large Files

When writing or substantially rewriting a file that exceeds ~80 lines:

1. **First pass — skeleton:** Write the file structure with stub implementations (empty function bodies, placeholder comments, `// TODO` markers). This establishes the shape and makes review easy.
2. **Second pass — fill in:** Replace each stub with the real implementation, one section at a time, using the Edit tool.

This prevents context-window blowout from dumping 200+ lines in a single Write call, and makes each chunk independently reviewable.

**Exception:** Files under ~80 lines can be written in one shot.

## 2. Prefer Edit Over Write for Existing Files

When modifying an existing file:

- **Always use the Edit tool** (targeted find-and-replace) instead of the Write tool (full file rewrite).
- Read the file first, identify the exact lines to change, then apply a surgical edit.
- Only fall back to Write when the changes are so pervasive that targeted edits would be harder to follow than a full rewrite (rare — typically >60% of lines changing).

**Why:** Edit preserves unchanged lines exactly, avoids accidental deletions, and produces minimal diffs that are easy to review.
