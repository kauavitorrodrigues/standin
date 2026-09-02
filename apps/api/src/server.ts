import { createServer } from "node:http";
import path from "node:path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router";
import { validateEnv } from "@/utils/validateEnv";
import { createSocketServer } from "@/lib/socket/createSocketServer";
import { SocketManager } from "@/lib/socket/socketManager";
import { ShutdownError, ShutdownTimeoutError } from "@/errors/ShutdownError";
import { httpCorsOptions } from "@/consts/server";

validateEnv(["JWT_SECRET", "DATABASE_URL", "FRONTEND_URL"]);

const app = express();

app.use(cors(httpCorsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(router);

const server = createServer(app);

createSocketServer(server);

const PORT = process.env.SERVER_PORT || 3001;

server.listen(PORT, () => {
    console.log(`✓ [API] - Server is running at: http://localhost:${PORT}`);
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n[API] - Received ${signal}, shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
        console.error(new ShutdownTimeoutError().message);
        process.exit(1);
    }, 5000);
    forceExitTimer.unref();

    try {
        // Closes the underlying httpServer too (it was handed to socket.io
        // in createSocketServer), so there is no separate server.close()
        // call here.
        await SocketManager.close();
    } catch (error) {
        console.error(new ShutdownError().message, error);
    }

    clearTimeout(forceExitTimer);
    process.exit(0);
}

process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
