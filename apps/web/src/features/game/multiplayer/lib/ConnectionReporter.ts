// What the signaling socket tells about itself, for a bug report. Times are
// epoch ms from the clock of the browser, null when it never happened.
export type ConnectionReport = {
    connected: boolean;
    lastConnectAt: number | null;
    lastDisconnectAt: number | null;
    lastDisconnectReason: string | null;
    // How often the server pings and how long it waits for the answer, as it
    // announced when the transport was opened. Null before the first connect.
    pingIntervalMs: number | null;
    pingTimeoutMs: number | null;
};

// The engine keeps what the server announced in private fields, which are -1
// until the handshake. A later version may make them public, so both names
// are read.
type EngineTimeouts = {
    pingInterval?: number;
    pingTimeout?: number;
    _pingInterval?: number;
    _pingTimeout?: number;
};

const readTimeout = (value: number | undefined): number | null =>
    typeof value === "number" && value > 0 ? value : null;

// The part of the socket the reporter reads, so a test can fake it.
type ListenTo = {
    (event: "connect", listener: () => void): unknown;
    (event: "disconnect", listener: (reason: string) => void): unknown;
};

export type ReporterSocket = {
    connected: boolean;
    on: ListenTo;
    off: ListenTo;
    // The engine does not declare the timeouts it receives from the server.
    io: { engine?: unknown };
};

/**
 * Keeps the last connect and disconnect of the signaling socket, so a failure
 * of the media transport can be read next to what the socket was doing. It
 * only listens, and nothing is sent anywhere.
 */
export class ConnectionReporter {
    private readonly socket: ReporterSocket;
    private readonly now: () => number;
    private lastConnectAt: number | null = null;
    private lastDisconnectAt: number | null = null;
    private lastDisconnectReason: string | null = null;

    constructor(socket: ReporterSocket, now: () => number = Date.now) {
        this.socket = socket;
        this.now = now;
    }

    start(): void {
        this.socket.on("connect", this.onConnect);
        this.socket.on("disconnect", this.onDisconnect);
    }

    stop(): void {
        this.socket.off("connect", this.onConnect);
        this.socket.off("disconnect", this.onDisconnect);
    }

    getReport = (): ConnectionReport => {
        const engine = this.socket.io.engine as EngineTimeouts | undefined;
        return {
            connected: this.socket.connected,
            lastConnectAt: this.lastConnectAt,
            lastDisconnectAt: this.lastDisconnectAt,
            lastDisconnectReason: this.lastDisconnectReason,
            pingIntervalMs: readTimeout(
                engine?.pingInterval ?? engine?._pingInterval
            ),
            pingTimeoutMs: readTimeout(
                engine?.pingTimeout ?? engine?._pingTimeout
            ),
        };
    };

    private onConnect = (): void => {
        this.lastConnectAt = this.now();
    };

    private onDisconnect = (reason?: string): void => {
        this.lastDisconnectAt = this.now();
        this.lastDisconnectReason = reason ?? null;
    };
}
