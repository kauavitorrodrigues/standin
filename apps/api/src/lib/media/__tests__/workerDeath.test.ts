import { afterAll, describe, expect, it, vi } from "vitest";
import { SocketManager } from "@/lib/socket/socketManager";
import { MEDIA_RESTART_DELAY_MS } from "../consts/media";
import { MediaRuntime } from "../MediaRuntime";

// The worker is a separate process. When it dies the API has to start a new
// one and tell every client to build its media session again, while the rest
// of the server keeps working.
describe("media worker death", () => {
    const emitted: string[] = [];
    SocketManager.set({
        emit: (event: string) => emitted.push(event),
    } as never);

    afterAll(() => MediaRuntime.stop());

    it("starts a new worker and tells the clients to rebuild", async () => {
        const quiet = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        await MediaRuntime.start({
            listenIp: "127.0.0.1",
            listenPort: 44888,
            logLevel: "error",
        });
        const firstPid = MediaRuntime.workerPid();
        expect(firstPid).toBeTypeOf("number");

        await MediaRuntime.acquireRoom("space-1");
        process.kill(firstPid!, "SIGKILL");

        await vi.waitFor(() => expect(emitted).toContain("media:reset"));
        await vi.waitFor(
            () => {
                const next = MediaRuntime.workerPid();
                expect(next).toBeTypeOf("number");
                expect(next).not.toBe(firstPid);
            },
            { timeout: MEDIA_RESTART_DELAY_MS * 8 }
        );

        // The new worker serves rooms again, with none of the old state.
        const room = await MediaRuntime.acquireRoom("space-1");
        expect(room.peerCount()).toBe(0);
        quiet.mockRestore();
    });
});
