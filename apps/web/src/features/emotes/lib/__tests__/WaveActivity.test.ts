import { describe, expect, it, vi } from "vitest";
import { WaveActivity } from "../WaveActivity";

describe("WaveActivity", () => {
    it("starts with no wave sent to a person", () => {
        expect(new WaveActivity().get("ana")).toEqual({ sentAt: null });
    });

    it("keeps when a wave was sent, per person", () => {
        const activity = new WaveActivity();
        activity.markSent("ana", 10);

        expect(activity.get("ana").sentAt).toBe(10);
        expect(activity.get("bia").sentAt).toBeNull();
    });

    it("replaces the record so a snapshot changes", () => {
        const activity = new WaveActivity();
        const before = activity.get("ana");
        activity.markSent("ana", 10);

        expect(activity.get("ana")).not.toBe(before);
    });

    it("tells the listeners of a sent wave until they unsubscribe", () => {
        const activity = new WaveActivity();
        const listener = vi.fn();
        const stop = activity.subscribe(listener);

        activity.markSent("ana", 1);
        stop();
        activity.markSent("ana", 2);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("announces a received wave with who sent it", () => {
        const activity = new WaveActivity();
        const listener = vi.fn();
        const stop = activity.onReceived(listener);

        activity.markReceived("ana");
        stop();
        activity.markReceived("bia");

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith("ana");
    });
});
