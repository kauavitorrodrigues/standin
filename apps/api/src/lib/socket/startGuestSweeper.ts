import { SPACE_GUEST_SWEEP_INTERVAL_MS } from "@standin/contracts";
import { SpaceGuestService } from "@standin/core";

/**
 * Writes down, on an interval, the requests and admissions that outlived their
 * 24h. The core tells the guests and cuts the sockets of the admitted ones.
 * A failure is logged and never stops the next sweep. Returns stop(), used by
 * tests and by the graceful shutdown.
 */
export function startGuestSweeper(
    intervalMs: number = SPACE_GUEST_SWEEP_INTERVAL_MS
): () => void {
    const sweep = async () => {
        try {
            await SpaceGuestService.expireDue();
        } catch (error) {
            console.error(error);
        }
    };

    const timer = setInterval(() => void sweep(), intervalMs);
    timer.unref();

    return () => clearInterval(timer);
}
