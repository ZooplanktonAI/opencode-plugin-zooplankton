import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ZooplanktonPlugin, _createPlugin } from "../.opencode/plugins/opencode-plugin-zooplankton.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const expectedPath = path.join(repoRoot, "instructions", "coding-standards.md");
const codingStandardsContent = fs.readFileSync(expectedPath, "utf8").trim();

describe("ZooplanktonPlugin", () => {
  let plugin;

  beforeEach(async () => {
    plugin = await ZooplanktonPlugin();
  });

  it("exports both config and experimental.chat.system.transform as functions", async () => {
    assert.equal(typeof plugin.config, "function");
    assert.equal(typeof plugin["experimental.chat.system.transform"], "function");
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

    it("handles null config without throwing", async () => {
      await assert.doesNotReject(() => plugin.config(null));
    });

    it("handles non-object config without throwing", async () => {
      await assert.doesNotReject(() => plugin.config("str"));
      await assert.doesNotReject(() => plugin.config(42));
      await assert.doesNotReject(() => plugin.config(undefined));
    });

    it("replaces non-array config.instructions with an array", async () => {
      const config = { instructions: "not-an-array" };
      await plugin.config(config);

      assert.ok(
        Array.isArray(config.instructions),
        "instructions should be normalized to an array",
      );
      assert.equal(config.instructions.length, 1);
      assert.equal(config.instructions[0], expectedPath);
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

    it("handles null output without throwing", async () => {
      await assert.doesNotReject(() => plugin[hookName]({}, null));
    });

    it("handles output with missing system array without throwing", async () => {
      await assert.doesNotReject(() => plugin[hookName]({}, {}));
      await assert.doesNotReject(() => plugin[hookName]({}, { system: "str" }));
    });

    it("handles non-string elements in system array without throwing", async () => {
      const output = { system: [42, null, "__UNRELATED_MARKER__"] };
      await assert.doesNotReject(() => plugin[hookName]({}, output));
      // Should still append since no string element contains the coding standards
      assert.equal(output.system.length, 4);
      assert.equal(output.system[3], codingStandardsContent);
    });

    it("deduplicates correctly with CRLF line endings in system entries", async () => {
      const crlfContent = codingStandardsContent.replace(/\n/g, "\r\n");
      const output = { system: [crlfContent] };
      await plugin[hookName]({}, output);
      // Should detect as duplicate despite CRLF vs LF difference
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

  describe("config hook deduplication", () => {
    it("does not push duplicate paths on repeated config calls", async () => {
      const config = {};
      await plugin.config(config);
      await plugin.config(config);
      assert.equal(config.instructions.length, 1);
    });
  });
});

describe("_createPlugin with empty content (file-missing degradation)", () => {
  const hookName = "experimental.chat.system.transform";
  let emptyPlugin;

  beforeEach(() => {
    emptyPlugin = _createPlugin("", "/fake/path/coding-standards.md");
  });

  it("config hook does not push path when content is empty", async () => {
    const config = {};
    await emptyPlugin.config(config);
    assert.deepEqual(config.instructions, []);
  });

  it("config hook still normalizes instructions to array when content is empty", async () => {
    const config = {};
    await emptyPlugin.config(config);
    assert.ok(Array.isArray(config.instructions));
  });

  it("transform hook does not inject when content is empty", async () => {
    const output = { system: ["existing"] };
    await emptyPlugin[hookName]({}, output);
    assert.equal(output.system.length, 1);
    assert.equal(output.system[0], "existing");
  });

  it("transform hook does not inject into empty system array when content is empty", async () => {
    const output = { system: [] };
    await emptyPlugin[hookName]({}, output);
    assert.equal(output.system.length, 0);
  });
});
