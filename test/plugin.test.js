import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ZooplanktonPlugin } from "../.opencode/plugins/opencode-plugin-zooplankton.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const expectedPath = path.join(repoRoot, "instructions", "coding-standards.md");

describe("ZooplanktonPlugin config hook", () => {
  it("initializes config.instructions when absent", async () => {
    const plugin = await ZooplanktonPlugin();
    const config = {};

    await plugin.config(config);

    assert.ok(Array.isArray(config.instructions), "instructions should be an array");
    assert.equal(config.instructions.length, 1);
  });

  it("appends to existing config.instructions without overwriting", async () => {
    const plugin = await ZooplanktonPlugin();
    const config = { instructions: ["existing.md"] };

    await plugin.config(config);

    assert.equal(config.instructions.length, 2);
    assert.equal(config.instructions[0], "existing.md");
    assert.equal(config.instructions[1], expectedPath);
  });

  it("pushes the correct path to coding-standards.md", async () => {
    const plugin = await ZooplanktonPlugin();
    const config = {};

    await plugin.config(config);

    assert.equal(config.instructions[0], expectedPath);
  });

  it("pushes a path that points to a real file on disk", async () => {
    const plugin = await ZooplanktonPlugin();
    const config = {};

    await plugin.config(config);

    assert.ok(
      fs.existsSync(config.instructions[0]),
      `expected file to exist: ${config.instructions[0]}`,
    );
  });

  // The plugin intentionally does NOT deduplicate — each call appends.
  // This documents the expected behavior so future maintainers know it's by design.
  it("pushes the path again on repeated calls (not idempotent)", async () => {
    const plugin = await ZooplanktonPlugin();
    const config = {};

    await plugin.config(config);
    await plugin.config(config);

    assert.equal(config.instructions.length, 2);
    assert.equal(config.instructions[0], expectedPath);
    assert.equal(config.instructions[1], expectedPath);
  });
});
