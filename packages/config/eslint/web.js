import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export const webConfig = defineConfig([
    globalIgnores(["dist", "src/routeTree.gen.ts"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            indent: ["error", 4],
            "no-tabs": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { ignoreRestSiblings: true },
            ],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    },
    {
        files: ["src/routes/**/*.tsx"],
        rules: {
            "react-refresh/only-export-components": "off",
        },
    },
]);
