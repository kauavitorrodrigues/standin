import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { webVitestConfig } from "@standin/vitest-config/web";

export default defineConfig({
    ...webVitestConfig,
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "./src"),
        },
    },
});
