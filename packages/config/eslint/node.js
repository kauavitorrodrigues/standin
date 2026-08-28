import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export const nodeConfig = defineConfig([
    globalIgnores(["dist", "node_modules"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            indent: ["error", 4],
            "no-tabs": "error",
        },
    },
]);
