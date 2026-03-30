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

const codingStandardsPath = path.join(
  pluginRoot,
  "instructions",
  "coding-standards.md",
);

// Read and cache the coding standards content at module load time.
// Falls back to empty string if the file is missing (graceful degradation).
const codingStandardsContent = fs.existsSync(codingStandardsPath)
  ? fs.readFileSync(codingStandardsPath, "utf8").trim()
  : "";

export const ZooplanktonPlugin = async () => ({
  config: async (config) => {
    if (!config || typeof config !== "object") return;
    // Primary session: register file path so OpenCode shows the "Instructions from:" banner
    config.instructions = config.instructions || [];
    config.instructions.push(codingStandardsPath);
  },

  "experimental.chat.system.transform": async (_input, output) => {
    // Inject coding standards into every LLM call's system array (including subagents).
    // Skip if content is empty (file missing) or already present (avoid duplication
    // with config.instructions which also injects the same content for primary sessions).
    if (
      !codingStandardsContent ||
      output.system.some((s) => s.includes(codingStandardsContent))
    ) {
      return;
    }
    output.system.push(codingStandardsContent);
  },
});
