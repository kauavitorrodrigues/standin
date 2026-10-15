import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/server.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    noExternal: [
        "@standin/auth",
        "@standin/contracts",
        "@standin/core",
        "@standin/database",
    ],
});
