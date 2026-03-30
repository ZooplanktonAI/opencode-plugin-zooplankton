/**
 * opencode-plugin-zooplankton — Global coding standards for ZooplanktonAI.
 *
 * Injects instructions/coding-standards.md into every OpenCode session
 * via config.instructions. No agents, no skills, no commands — just rules.
 */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, "../..");

export const ZooplanktonPlugin = async () => ({
  config: async (config) => {
    config.instructions = config.instructions || [];
    config.instructions.push(
      path.join(pluginRoot, "instructions", "coding-standards.md"),
    );
  },
});
