import { describe, expect, it } from "vitest";
import { ConnectionReporter, type ReporterSocket } from "../ConnectionReporter";

type Listener = (...args: never[]) => void;

const fakeSocket = () => {
    const listeners = new Map<string, Listener>();
    const socket = {
        connected: false,
        on: (event: string, listener: Listener) => listeners.set(event, listener),
        off: (event: string) => listeners.delete(event),
        io: {} as ReporterSocket["io"],
    };
    const fire = (event: string, ...args: unknown[]) =>
        (listeners.get(event) as ((...a: unknown[]) => void) | undefined)?.(...args);
    return { socket, fire, listeners };
};

describe("ConnectionReporter", () => {
    it("starts with nothing known", () => {
        const { socket } = fakeSocket();
        const reporter = new ConnectionReporter(socket);
        reporter.start();

        expect(reporter.getReport()).toEqual({
            connected: false,
            lastConnectAt: null,
            lastDisconnectAt: null,
            lastDisconnectReason: null,
            pingIntervalMs: null,
            pingTimeoutMs: null,
        });
    });

    it("keeps the time of the last connect and disconnect and why it dropped", () => {
        const { socket, fire } = fakeSocket();
        let now = 1000;
        const reporter = new ConnectionReporter(socket, () => now);
        reporter.start();

        socket.connected = true;
        fire("connect");
        now = 5000;
        socket.connected = false;
        fire("disconnect", "transport close");
        now = 9000;
        socket.connected = true;
        fire("connect");

        expect(reporter.getReport()).toMatchObject({
            connected: true,
            lastConnectAt: 9000,
            lastDisconnectAt: 5000,
            lastDisconnectReason: "transport close",
        });
    });

    it("reads the Engine.IO timeouts the server announced", () => {
        const { socket } = fakeSocket();
        socket.io = { engine: { pingInterval: 25000, pingTimeout: 20000 } };
        const reporter = new ConnectionReporter(socket);

        expect(reporter.getReport()).toMatchObject({
            pingIntervalMs: 25000,
            pingTimeoutMs: 20000,
        });
    });

    it("reads the private fields of the engine and ignores them before the handshake", () => {
        const { socket } = fakeSocket();
        socket.io = { engine: { _pingInterval: -1, _pingTimeout: -1 } };
        const reporter = new ConnectionReporter(socket);
        expect(reporter.getReport()).toMatchObject({
            pingIntervalMs: null,
            pingTimeoutMs: null,
        });

        socket.io = { engine: { _pingInterval: 25000, _pingTimeout: 20000 } };
        expect(reporter.getReport()).toMatchObject({
            pingIntervalMs: 25000,
            pingTimeoutMs: 20000,
        });
    });

    it("stops listening", () => {
        const { socket, listeners } = fakeSocket();
        const reporter = new ConnectionReporter(socket);
        reporter.start();
        expect(listeners.size).toBe(2);
        reporter.stop();
        expect(listeners.size).toBe(0);
    });
});
