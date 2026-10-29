import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "path";
import { defineConfig, type UserConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// `pnpm dev:lan`: serves the app over https on the local network so another
// computer can open it. https is required there because browsers only allow
// camera and microphone on secure origins (localhost counts, a LAN IP does
// not). The API is reached through the "/api" proxy below, which keeps the
// page, the API and the sockets on one origin and one certificate.
const isLan = process.env.VITE_LAN === "true";
const apiTarget = process.env.SERVER_URL || "http://localhost:3001";

const lanServer: UserConfig["server"] = {
    host: true,
    proxy: {
        "/api": {
            target: apiTarget,
            ws: true,
            rewrite: (path) => path.replace(/^\/api/, ""),
        },
    },
};

// Reads a line from git, or "" when git or the repository is not there, as in
// a docker build, which does not receive the .git folder.
const readGit = (command: string): string => {
    try {
        return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim();
    } catch {
        return "";
    }
};

// What the page tells about the build it came from. CI and docker pass it in
// the environment, and a local build asks git.
const resolveBuildInfo = () => {
    const packageVersion: string = JSON.parse(
        readFileSync(resolve(import.meta.dirname, "package.json"), "utf8")
    ).version;
    return {
        version: process.env.VITE_APP_VERSION || packageVersion,
        commit:
            process.env.VITE_APP_COMMIT ||
            readGit("git rev-parse --short HEAD"),
        commitTime:
            process.env.VITE_APP_COMMIT_TIME ||
            readGit("git show -s --format=%cI HEAD"),
    };
};

const buildInfo = resolveBuildInfo();

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(buildInfo.version),
        __APP_COMMIT__: JSON.stringify(buildInfo.commit),
        __APP_COMMIT_TIME__: JSON.stringify(buildInfo.commitTime),
    },
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
        ...(isLan ? [basicSsl()] : []),
    ],
    server: isLan ? lanServer : undefined,
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "./src"),
            "@assets": resolve(import.meta.dirname, "../../assets"),
        },
    },
});
