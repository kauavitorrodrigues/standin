import type { MonitorReason } from "../lib/TransportConnectionMonitor";

export type IceRestarterOptions = {
    // Asks the server for new ICE parameters. Rejects when it refuses.
    requestIceParameters: () => Promise<Record<string, unknown>>;
    // Applies the new ICE parameters to the transport of the browser.
    restartIce: (iceParameters: Record<string, unknown>) => Promise<void>;
    setReason: (reason: MonitorReason) => void;
    // The restarts ran out or the server refused, so the session is rebuilt.
    onBroken: () => void;
    // Pause before an attempt, by the number of the attempt starting at 0.
    delay?: (attempt: number) => number;
    maxAttempts?: number;
    connectTimeoutMs?: number;
};
