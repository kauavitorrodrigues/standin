import { describe, expect, it, vi } from "vitest";
import { runWithoutLock } from "@/features/maps/__shared__/utils/runWithoutLock";

const setup = (
    overrides: { action?: () => Promise<void>; ack?: unknown } = {}
) => {
    const calls: string[] = [];
    const control = {
        release: vi.fn(async () => {
            calls.push("release");
        }),
        reacquire: vi.fn(async () => {
            calls.push("reacquire");
            return (overrides.ack ?? { ok: true }) as never;
        }),
        markLost: vi.fn(() => {
            calls.push("markLost");
        }),
    };
    const discard = vi.fn(async () => {
        calls.push("discard");
    });
    const action = vi.fn(
        overrides.action ??
            (async () => {
                calls.push("action");
            })
    );
    return { calls, control, discard, action };
};

describe("runWithoutLock", () => {
    it("releases, then runs the action", async () => {
        const { calls, control, discard, action } = setup();
        await runWithoutLock({ hasChanges: false, discard, control, action });
        expect(calls).toEqual(["release", "action"]);
        expect(discard).not.toHaveBeenCalled();
    });

    it("discards the draft before releasing when there are changes", async () => {
        const { calls, control, discard, action } = setup();
        await runWithoutLock({ hasChanges: true, discard, control, action });
        expect(calls).toEqual(["discard", "release", "action"]);
    });

    it("gets the lock back when the action fails and rethrows", async () => {
        const failure = new Error("409");
        const { calls, control, discard, action } = setup({
            action: async () => {
                throw failure;
            },
        });
        await expect(
            runWithoutLock({ hasChanges: false, discard, control, action })
        ).rejects.toBe(failure);
        expect(calls).toEqual(["release", "reacquire"]);
        expect(control.markLost).not.toHaveBeenCalled();
    });

    it("marks the lock lost when it cannot be got back", async () => {
        const { control, discard, action } = setup({
            action: async () => {
                throw new Error("network");
            },
            ack: { ok: false, code: "MAP_LOCKED" },
        });
        await expect(
            runWithoutLock({ hasChanges: false, discard, control, action })
        ).rejects.toThrow("network");
        expect(control.markLost).toHaveBeenCalledTimes(1);
    });
});
