import { describe, expect, it, vi } from "vitest";
import { getReplyHandler } from "../getReplyHandler";

describe("getReplyHandler", () => {
    it("opens the thread of a top-level message", () => {
        const onOpenThread = vi.fn();

        getReplyHandler({ id: "m1", threadParentId: null }, false, onOpenThread)?.();

        expect(onOpenThread).toHaveBeenCalledWith("m1");
    });

    it("gives nothing for a reply, a pending message or a list without threads", () => {
        const onOpenThread = vi.fn();

        expect(
            getReplyHandler({ id: "r1", threadParentId: "m1" }, false, onOpenThread)
        ).toBeUndefined();
        expect(
            getReplyHandler({ id: "m1", threadParentId: null }, true, onOpenThread)
        ).toBeUndefined();
        expect(
            getReplyHandler({ id: "m1", threadParentId: null }, false, undefined)
        ).toBeUndefined();
    });
});
