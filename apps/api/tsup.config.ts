import { defineConfig } from "tsup";

export default defineConfig({
    // The bootstrap is a second entry so the production image, which has no tsx,
    // can run it with node.
    entry: {
        server: "src/server.ts",
        bootstrap: "src/scripts/bootstrap.ts",
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    noExternal: [
        "@standin/auth",
        "@standin/contracts",
        "@standin/core",
        "@standin/database",
        "@standin/infra",
        "@standin/media",
    ],
});
