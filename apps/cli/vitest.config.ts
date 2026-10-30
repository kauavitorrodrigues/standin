import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { nodeVitestConfig } from "@standin/vitest-config/node";

// No .env is loaded here: the tests build their own environment.
export default defineConfig({
    ...nodeVitestConfig,
    resolve: {
        // Only the end-to-end integration test loads the API in-process, and
        // the API imports itself with "@/". Nothing in the CLI uses that alias.
        alias: { "@": resolve(__dirname, "../api/src") },
    },
});
