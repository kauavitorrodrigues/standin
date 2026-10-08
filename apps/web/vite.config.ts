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

export default defineConfig({
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
        },
    },
});