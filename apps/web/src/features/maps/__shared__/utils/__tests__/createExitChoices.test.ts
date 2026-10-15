import { describe, expect, it, vi } from "vitest";
import { createExitChoices } from "@/features/maps/__shared__/utils/createExitChoices";

const build = (blocked = false) => {
    const calls: string[] = [];
    const record = (name: string) => () => {
        calls.push(name);
    };
    const choices = createExitChoices({
        discard: vi.fn(async () => {
            calls.push("discard");
        }),
        publishAndExit: record("publishAndExit"),
        onExit: record("onExit"),
        close: record("close"),
        blocked,
        proceedBlocked: record("proceedBlocked"),
        stayBlocked: record("stayBlocked"),
        release: record("release"),
    });
    return { choices, calls };
};

describe("createExitChoices", () => {
    it("publish and exit closes and starts the publish", () => {
        const { choices, calls } = build();

        choices.publishAndLeave();

        expect(calls).toEqual(["close", "publishAndExit"]);
    });

    it("keep and exit leaves without touching the draft", () => {
        const { choices, calls } = build();

        choices.keepAndLeave();

        expect(calls).toEqual(["close", "release", "onExit"]);
    });

    it("discard and exit discards before leaving", async () => {
        const { choices, calls } = build();

        await choices.discardAndLeave();

        expect(calls).toEqual([
            "release",
            "discard",
            "close",
            "release",
            "onExit",
        ]);
    });

    it("keep editing only closes", () => {
        const { choices, calls } = build();

        choices.keepEditing();

        expect(calls).toEqual(["close"]);
    });

    it("goes where the router was heading when it blocked", () => {
        const { choices, calls } = build(true);

        choices.keepAndLeave();

        expect(calls).toEqual(["close", "proceedBlocked"]);
    });

    it("stays when the router blocked and the user keeps editing", () => {
        const { choices, calls } = build(true);

        choices.keepEditing();

        expect(calls).toEqual(["close", "stayBlocked"]);
    });
});
