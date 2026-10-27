import { describe, expect, it } from "vitest";
import { formatByEvent } from "../formatByEvent";

describe("formatByEvent", () => {
    it("lists the heaviest event first with its share", () => {
        const text = formatByEvent(
            {
                "space:emote": { messages: 100, bytes: 4000 },
                "space:positions": { messages: 300, bytes: 36000 },
            },
            10
        );
        const lines = text.split("\n");

        expect(lines[2]).toContain("space:positions");
        expect(lines[3]).toContain("space:emote");
        // 300 of 400 messages and 36000 of 40000 bytes.
        expect(lines[2]).toContain("75.0");
        expect(lines[2]).toContain("90.0");
        // 300 messages over 10 s, and 120 bytes per message.
        expect(lines[2]).toContain("30");
        expect(lines[2]).toContain("120");
    });

    it("does not divide by zero with no messages", () => {
        expect(() => formatByEvent({}, 10)).not.toThrow();
    });
});
