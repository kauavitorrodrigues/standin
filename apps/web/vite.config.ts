import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
        // simple-peer's dependency chain (readable-stream, etc.) assumes
        // Node built-ins (events, util, stream, the `global`/Buffer
        // globals) that don't exist in the browser and that Vite doesn't
        // polyfill on its own.
        nodePolyfills({
            include: ["events", "util", "stream", "buffer"],
            // readable-stream also relies on the `global`, `process` and
            // `Buffer` globals, not just the module imports above. These
            // are already the plugin's defaults, pinned explicitly so a
            // future bundle-size trim doesn't disable one by accident.
            globals: { global: true, process: true, Buffer: true },
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "./src"),
        },
    },
});