import { defineConfig } from "vitest/config";
import { nodeVitestConfig } from "@standin/vitest-config/node";

// No .env is loaded here: the tests build their own environment.
export default defineConfig(nodeVitestConfig);
