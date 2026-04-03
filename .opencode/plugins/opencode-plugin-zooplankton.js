/**
 * opencode-plugin-zooplankton — Global coding standards for ZooplanktonAI.
 *
 * Injects instructions/coding-standards.md into every OpenCode session:
 * - config.instructions: ensures primary session loads the file (shows banner)
 * - experimental.chat.system.transform: injects into every LLM call (including
 *   subagents) for maximum salience, since subagent prompts can be very long
 *   and cause trailing instructions to be deprioritized by models.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, "../..");

/** Normalize line endings to LF for robust string comparison. */
const norm = (s) => s.replace(/\r\n?/g, "\n");

const codingStandardsPath = path.join(
  pluginRoot,
  "instructions",
  "coding-standards.md",
);

// Read and cache the coding standards content at module load time.
// Falls back to empty string if the file is missing (graceful degradation).
let codingStandardsContent = "";
if (fs.existsSync(codingStandardsPath)) {
  codingStandardsContent = fs.readFileSync(codingStandardsPath, "utf8").trim();
} else {
  console.warn(
    "[opencode-plugin-zooplankton] coding-standards.md not found at:",
    codingStandardsPath,
  );
}

/**
 * Internal factory that builds the plugin hooks for given content and path.
 * Exported (prefixed with _) for testing the file-missing degradation path.
 */
export const _createPlugin = (content, filePath) => ({
  config: async (config) => {
    if (!config || typeof config !== "object") return;
    // Primary session: register file path so OpenCode shows the "Instructions from:" banner
    config.instructions = Array.isArray(config.instructions) ? config.instructions : [];
    // Guard: filePath must be a non-empty string. Without this check, OpenCode's
    // plugin loader (which iterates Object.values(mod)) may call _createPlugin as
    // a plugin itself with wrong args, causing undefined to be pushed into
    // config.instructions and crashing OpenCode with "undefined.startsWith".
    if (
      content &&
      typeof content === "string" &&
      typeof filePath === "string" &&
      filePath &&
      !config.instructions.includes(filePath)
    ) {
      config.instructions.push(filePath);
    }
  },

  // NOTE: "experimental.chat.system.transform" is an experimental OpenCode hook
  // (available since OpenCode ≥0.1). Its API surface may change in future versions.
  "experimental.chat.system.transform": async (_input, output) => {
    // Inject coding standards into every LLM call's system array (including subagents).
    if (!output || !Array.isArray(output.system)) return;
    // Guard: content must be a non-empty string (same defense as config hook above).
    if (
      !content ||
      typeof content !== "string" ||
      output.system.some(
        (s) => typeof s === "string" && norm(s).includes(norm(content)),
      )
    ) {
      return;
    }
    output.system.push(content);
  },
});

export const ZooplanktonPlugin = async () =>
  _createPlugin(codingStandardsContent, codingStandardsPath);
