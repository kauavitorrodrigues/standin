import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { nodeVitestConfig } from "@standin/vitest-config/node";

try {
    process.loadEnvFile("../../.env");
} catch {
    // no root .env file, fall back to the defaults below
}

export default defineConfig({
    ...nodeVitestConfig,
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
});
