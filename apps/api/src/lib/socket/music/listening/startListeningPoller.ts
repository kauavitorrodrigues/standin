import { LISTENING_POLL_INTERVAL_MS } from "@standin/contracts";
import { pollListening } from "./pollListening";

/**
 * Polls Spotify on an interval. A tick never overlaps the one before it, since
 * a slow Spotify can take longer than the interval. Returns stop(), used by
 * tests and by the graceful shutdown.
 */
export function startListeningPoller(
    intervalMs: number = LISTENING_POLL_INTERVAL_MS
): () => void {
    let isRunning = false;

    const tick = async () => {
        if (isRunning) return;
        isRunning = true;
        try {
            await pollListening();
        } catch (error) {
            console.error(error);
        }
        isRunning = false;
    };

    const timer = setInterval(() => void tick(), intervalMs);
    timer.unref();

    return () => clearInterval(timer);
}
