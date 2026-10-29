import { ICE_DISCONNECTED_GRACE_MS } from "../consts/connection";
import type { ConnectionReport } from "./ConnectionReporter";

// Error taxonomy of the transport. There is no telemetry sink yet, so errors
// reach the owner through onError and a console warning.
export const TransportErrorType = {
    FailedState: "FailedState",
    UnstableConnection: "UnstableConnection",
    Disconnected: "Disconnected",
    ICERestartFailure: "ICERestartFailure",
    FailedToConnect: "FailedToConnect",
} as const;

export type TransportErrorType =
    (typeof TransportErrorType)[keyof typeof TransportErrorType];

export type TransportErrorPayload = {
    id: string;
    connectionState: string;
};

export type MonitorReason = "initialConnect" | "iceRestart";

export type TransportConnectionMonitorOptions = {
    id: string;
    onError: (type: TransportErrorType, payload: TransportErrorPayload) => void;
    // Called when the grace period ran out and the transport is still not
    // connected, after the error was published. The owner decides whether
    // to restart.
    onGraceExpired?: () => void;
    // What the signaling socket was doing, added to the warning of an error.
    describeConnection?: () => ConnectionReport;
};

// Transport agnostic connection monitor. "disconnected" does not panic:
// the browser gets the grace period to heal on its own, and only then is
// an error published. "failed" is terminal and published immediately.
export class TransportConnectionMonitor {
    private readonly id: string;
    private readonly onError: TransportConnectionMonitorOptions["onError"];
    private readonly onGraceExpired: (() => void) | undefined;
    private readonly describeConnection: (() => ConnectionReport) | undefined;

    private currentState = "new";
    private lastConnectedAt = 0;
    private sawQuickDisconnect = false;
    private monitorReason: MonitorReason = "initialConnect";
    private timer: ReturnType<typeof setTimeout> | null = null;

    constructor({
        id,
        onError,
        onGraceExpired,
        describeConnection,
    }: TransportConnectionMonitorOptions) {
        this.id = id;
        this.describeConnection = describeConnection;
        this.onError = onError;
        this.onGraceExpired = onGraceExpired;
    }

    // Set when restartIce is called, so a failure after it is reported as
    // ICERestartFailure instead of FailedToConnect.
    setMonitorReason(reason: MonitorReason): void {
        this.monitorReason = reason;
    }

    onConnectionStateChanged(connectionState: string): void {
        this.currentState = connectionState;

        switch (connectionState) {
            case "failed":
                this.publish(TransportErrorType.FailedState);
                return;
            case "connected":
                this.lastConnectedAt = Date.now();
                this.clearTimer();
                return;
            case "disconnected":
                this.onDisconnected();
                return;
            default:
                return;
        }
    }

    // Dev only entry point for the failure scenario harness: reports an
    // error without any real connection state change behind it.
    publishSimulated(type: TransportErrorType): void {
        this.publish(type);
    }

    dispose(): void {
        this.clearTimer();
    }

    private onDisconnected(): void {
        if (!this.lastConnectedAt) {
            console.warn(
                "[multiplayer] missing lastConnectedAt, ignoring disconnected state"
            );
            return;
        }

        // Quick, repeated drops (under the grace period between them) mean
        // an unstable connection rather than a single outage.
        if (Date.now() - this.lastConnectedAt < ICE_DISCONNECTED_GRACE_MS) {
            if (this.sawQuickDisconnect) {
                this.publish(TransportErrorType.UnstableConnection);
            } else {
                this.sawQuickDisconnect = true;
            }
        } else {
            this.sawQuickDisconnect = false;
        }

        this.startTimerIfNeeded();
    }

    private startTimerIfNeeded(): void {
        if (this.timer) return;

        this.timer = setTimeout(() => {
            this.timer = null;
            if (this.currentState === "connected") return;

            this.publish(this.resolveExpiryError());
            this.onGraceExpired?.();
        }, ICE_DISCONNECTED_GRACE_MS);
    }

    private resolveExpiryError(): TransportErrorType {
        if (this.sawQuickDisconnect) return TransportErrorType.UnstableConnection;
        if (this.lastConnectedAt !== 0) return TransportErrorType.Disconnected;
        if (this.monitorReason === "iceRestart") {
            return TransportErrorType.ICERestartFailure;
        }
        return TransportErrorType.FailedToConnect;
    }

    private publish(type: TransportErrorType): void {
        const payload = { id: this.id, connectionState: this.currentState };
        const report = this.describeConnection?.();
        if (report) {
            console.warn("[multiplayer] transport error", type, payload, report);
        } else {
            console.warn("[multiplayer] transport error", type, payload);
        }
        this.onError(type, payload);
    }

    private clearTimer(): void {
        if (!this.timer) return;

        clearTimeout(this.timer);
        this.timer = null;
    }
}
