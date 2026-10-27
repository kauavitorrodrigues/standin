import {
    ICE_RESTART_CONNECT_TIMEOUT_MS,
    ICE_RESTART_MAX_ATTEMPTS,
} from "../consts/connection";
import type { IceRestarterOptions } from "../types/iceRestarter";
import { backoffDelay } from "../utils/backoffDelay";

/**
 * Recovers one transport with ICE restarts before the session is given up.
 *
 * Each attempt waits a backoff delay, asks the server for new ICE parameters,
 * applies them and waits for the transport to be connected again. When the
 * attempts run out, or the server refuses, `onBroken` is called once so the
 * owner builds the session again. Only one recovery runs at a time, so a
 * failure and a grace period that expire together start a single one.
 */
export class IceRestarter {
    private readonly options: IceRestarterOptions;
    private running = false;
    private closed = false;
    private connected = false;
    private timers = new Set<ReturnType<typeof setTimeout>>();
    private wake: (() => void) | null = null;

    constructor(options: IceRestarterOptions) {
        this.options = options;
    }

    /** The transport failed or stayed disconnected. Starts a recovery. */
    trigger(): void {
        if (this.closed || this.running) return;
        this.running = true;
        void this.run();
    }

    /** The transport is connected, which ends the wait of a restart. */
    notifyConnected(): void {
        this.connected = true;
        this.wake?.();
    }

    /** Stops any recovery in progress. */
    close(): void {
        this.closed = true;
        this.timers.forEach(clearTimeout);
        this.timers.clear();
        this.wake?.();
    }

    private async run(): Promise<void> {
        const maxAttempts = this.options.maxAttempts ?? ICE_RESTART_MAX_ATTEMPTS;
        const delay = this.options.delay ?? backoffDelay;
        try {
            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
                await this.pause(Math.max(0, delay(attempt)));
                if (this.closed) return;
                const restarted = await this.restartOnce();
                if (this.closed) return;
                if (restarted === "refused") break;
                if (restarted === "connected") return;
            }
            this.options.onBroken();
        } finally {
            this.running = false;
        }
    }

    private async restartOnce(): Promise<"connected" | "timeout" | "refused"> {
        try {
            const iceParameters = await this.options.requestIceParameters();
            if (this.closed) return "refused";
            this.connected = false;
            this.options.setReason("iceRestart");
            await this.options.restartIce(iceParameters);
        } catch {
            return "refused";
        }
        const connected = await this.waitConnected();
        return connected ? "connected" : "timeout";
    }

    private pause(ms: number): Promise<void> {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this.timers.delete(timer);
                resolve();
            }, ms);
            this.timers.add(timer);
        });
    }

    private waitConnected(): Promise<boolean> {
        if (this.connected) return Promise.resolve(true);
        const timeoutMs =
            this.options.connectTimeoutMs ?? ICE_RESTART_CONNECT_TIMEOUT_MS;
        return new Promise((resolve) => {
            const finish = () => {
                clearTimeout(timer);
                this.timers.delete(timer);
                this.wake = null;
                resolve(this.connected);
            };
            const timer = setTimeout(finish, timeoutMs);
            this.timers.add(timer);
            this.wake = finish;
        });
    }
}
