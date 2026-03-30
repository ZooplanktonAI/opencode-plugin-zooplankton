import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ZooplanktonPlugin } from "../.opencode/plugins/opencode-plugin-zooplankton.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const expectedPath = path.join(repoRoot, "instructions", "coding-standards.md");
const codingStandardsContent = fs.readFileSync(expectedPath, "utf8").trim();

describe("ZooplanktonPlugin", () => {
  let plugin;

  beforeEach(async () => {
    plugin = await ZooplanktonPlugin();
  });

  describe("config hook", () => {
    it("initializes config.instructions when absent", async () => {
      const config = {};
      await plugin.config(config);

      assert.ok(
        Array.isArray(config.instructions),
        "instructions should be an array",
      );
      assert.equal(config.instructions.length, 1);
    });

    it("appends to existing config.instructions without overwriting", async () => {
      const config = { instructions: ["existing.md"] };
      await plugin.config(config);

      assert.equal(config.instructions.length, 2);
      assert.equal(config.instructions[0], "existing.md");
      assert.equal(config.instructions[1], expectedPath);
    });

    it("pushes the correct path to coding-standards.md", async () => {
      const config = {};
      await plugin.config(config);

      assert.equal(config.instructions[0], expectedPath);
    });

    it("pushes a path that points to a real file on disk", async () => {
      const config = {};
      await plugin.config(config);

      assert.ok(
        fs.existsSync(config.instructions[0]),
        `expected file to exist: ${config.instructions[0]}`,
      );
    });
  });

  describe("experimental.chat.system.transform hook", () => {
    const hookName = "experimental.chat.system.transform";

    it("injects coding standards into empty system array", async () => {
      const output = { system: [] };
      await plugin[hookName]({}, output);

      assert.equal(output.system.length, 1);
      assert.equal(output.system[0], codingStandardsContent);
    });

    it("appends to existing system entries", async () => {
      const output = { system: ["You are a helpful assistant."] };
      await plugin[hookName]({}, output);

      assert.equal(output.system.length, 2);
      assert.equal(output.system[0], "You are a helpful assistant.");
      assert.equal(output.system[1], codingStandardsContent);
    });

    it("skips injection when content is already present", async () => {
      const output = {
        system: ["Instructions from: ...\n" + codingStandardsContent],
      };
      await plugin[hookName]({}, output);

      assert.equal(output.system.length, 1);
    });

    it("skips injection when content is embedded in a longer entry", async () => {
      const output = {
        system: [
          "Some preamble\n\n" + codingStandardsContent + "\n\nMore text",
        ],
      };
      await plugin[hookName]({}, output);

      assert.equal(output.system.length, 1);
    });

    it("works with subagent-like input containing sessionID", async () => {
      const input = { sessionID: "ses_abc123", model: { id: "test-model" } };
      const output = { system: ["Subagent prompt content."] };
      await plugin[hookName](input, output);

      assert.equal(output.system.length, 2);
      assert.equal(output.system[1], codingStandardsContent);
    });

    it("does not duplicate on repeated calls", async () => {
      const output = { system: [] };
      await plugin[hookName]({}, output);
      await plugin[hookName]({}, output);

      // Second call should detect content is already present and skip
      assert.equal(output.system.length, 1);
    });
  });

  describe("coding-standards.md content", () => {
    it("contains skeleton-then-replace rule", () => {
      assert.ok(codingStandardsContent.includes("Skeleton-then-Replace"));
    });

    it("contains prefer-edit rule", () => {
      assert.ok(codingStandardsContent.includes("Prefer Edit Over Write"));
    });

    it("contains prefer-master rule", () => {
      assert.ok(
        codingStandardsContent.includes("Prefer `master` Over `main`"),
      );
    });
  });
});
