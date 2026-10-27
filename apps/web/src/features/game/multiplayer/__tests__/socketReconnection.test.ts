import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/url", () => ({
    SOCKET_URL: "http://localhost:3000",
    SOCKET_PATH_OPTIONS: {},
}));
import { socket } from "../socket";
import { realtimeSocket } from "@/features/realtime/socket";

// Reconnection options shared by both sockets.
describe.each([
    ["space socket", socket],
    ["realtime socket", realtimeSocket],
])("%s reconnection options", (_name, instance) => {
    it("uses the 1 s to 10 s backoff curve", () => {
        expect(instance.io.reconnectionDelay()).toBe(1000);
        expect(instance.io.reconnectionDelayMax()).toBe(10000);
        expect(instance.io.randomizationFactor()).toBe(0.5);
    });
});
