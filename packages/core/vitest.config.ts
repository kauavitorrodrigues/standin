import { defineConfig } from "vitest/config";
import { nodeVitestConfig } from "@standin/vitest-config/node";

try {
    process.loadEnvFile("../../.env");
} catch {
    // no root .env file, the integration tests need SERVER_URL set by hand
}

export default defineConfig(nodeVitestConfig);
