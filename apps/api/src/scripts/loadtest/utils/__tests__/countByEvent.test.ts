import { describe, expect, it } from "vitest";
import { addToEvent, mergeByEvent, type ByEvent } from "../countByEvent";

describe("countByEvent", () => {
    it("counts messages and bytes per event", () => {
        const byEvent: ByEvent = {};
        addToEvent(byEvent, "a", 10);
        addToEvent(byEvent, "a", 5);
        addToEvent(byEvent, "b", 1);

        expect(byEvent).toEqual({
            a: { messages: 2, bytes: 15 },
            b: { messages: 1, bytes: 1 },
        });
    });

    it("adds the counts of several bots", () => {
        const merged = mergeByEvent([
            { a: { messages: 1, bytes: 10 } },
            { a: { messages: 2, bytes: 4 }, b: { messages: 1, bytes: 7 } },
        ]);

        expect(merged).toEqual({
            a: { messages: 3, bytes: 14 },
            b: { messages: 1, bytes: 7 },
        });
    });
});
