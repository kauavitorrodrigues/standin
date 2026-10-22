import { createServer } from "node:http";
import { createApp } from "./app";
import { validateEnv } from "@/utils/validateEnv";
import { createSocketServer } from "@/lib/socket/createSocketServer";
import { startLockSweeper } from "@/lib/socket/startLockSweeper";
import { startGuestSweeper } from "@/lib/socket/startGuestSweeper";
import { SocketManager } from "@/lib/socket/socketManager";
import { ShutdownError, ShutdownTimeoutError } from "@/errors/ShutdownError";

validateEnv(["JWT_SECRET", "DATABASE_URL", "FRONTEND_URL"]);

const server = createServer(createApp());

createSocketServer(server);

const stopLockSweeper = startLockSweeper();
const stopGuestSweeper = startGuestSweeper();

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

    stopLockSweeper();
    stopGuestSweeper();

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
