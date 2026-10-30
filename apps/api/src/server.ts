import { createServer } from "node:http";
import { GlobalSettingsService } from "@standin/core";
import { createApp } from "./app";
import { validateEnv } from "@/utils/validateEnv";
import { createSocketServer } from "@/lib/socket/createSocketServer";
import { startLockSweeper } from "@/lib/socket/startLockSweeper";
import { startGuestSweeper } from "@/lib/socket/startGuestSweeper";
import { startPositionTicker } from "@/lib/socket/realtime/startPositionTicker";
import { MediaRuntime } from "@/lib/media/MediaRuntime";
import { readMediaConfig } from "@/lib/media/readMediaConfig";
import { startMediaTicker } from "@/lib/media/startMediaTicker";
import { MediaLogMessages } from "@/lib/media/consts/messages";
import { SocketManager } from "@/lib/socket/socketManager";
import { ShutdownError, ShutdownTimeoutError } from "@/errors/ShutdownError";

validateEnv(["JWT_SECRET", "DATABASE_URL", "FRONTEND_URL"]);

const server = createServer(createApp());

createSocketServer(server);

const stopLockSweeper = startLockSweeper();
const stopGuestSweeper = startGuestSweeper();
const stopPositionTicker = startPositionTicker();
const stopMediaTicker = startMediaTicker();

const mediaConfig = readMediaConfig();
if (mediaConfig.enabled) {
    MediaRuntime.start(mediaConfig.options)
        .then(() =>
            MediaRuntime.startTelemetry((usage) =>
                console.log(MediaLogMessages.usage, JSON.stringify(usage))
            )
        )
        .catch((error) => console.error(MediaLogMessages.restartFailed, error));
}

// Seeds the settings of a fresh instance from the environment. A later read
// would do it too, this only makes it happen at start.
GlobalSettingsService.get().catch((error) =>
    console.error("[API] - could not read the instance settings", error)
);

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
    stopPositionTicker();
    stopMediaTicker();
    MediaRuntime.stop();

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
