import { describe, expect, it, vi } from "vitest";
import {
    onSpaceGuestEvent,
    publishSpaceGuestEvent,
} from "../utils/guestEvents";

const event = { type: "removed", spaceId: "s1", userId: "u1" } as const;

describe("space guest events", () => {
    it("reaches every listener", async () => {
        const first = vi.fn();
        const second = vi.fn();
        const stopFirst = onSpaceGuestEvent(first);
        const stopSecond = onSpaceGuestEvent(second);

        await publishSpaceGuestEvent(event);

        expect(first).toHaveBeenCalledWith(event);
        expect(second).toHaveBeenCalledWith(event);
        stopFirst();
        stopSecond();
    });

    it("keeps going when a listener throws", async () => {
        const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
        const broken = vi.fn().mockRejectedValue(new Error("boom"));
        const healthy = vi.fn();
        const stopBroken = onSpaceGuestEvent(broken);
        const stopHealthy = onSpaceGuestEvent(healthy);

        await publishSpaceGuestEvent(event);

        expect(healthy).toHaveBeenCalledWith(event);
        stopBroken();
        stopHealthy();
        quiet.mockRestore();
    });

    it("stops calling a listener that was removed", async () => {
        const listener = vi.fn();
        const stop = onSpaceGuestEvent(listener);
        stop();

        await publishSpaceGuestEvent(event);

        expect(listener).not.toHaveBeenCalled();
    });
});
