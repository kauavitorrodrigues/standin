import { describe, expect, it } from "vitest";
import { readEventName } from "../readEventName";

describe("readEventName", () => {
    it("reads the name of an event", () => {
        expect(readEventName('2["space:positions",{"entered":[]}]')).toBe(
            "space:positions"
        );
    });

    it("reads past a namespace and an ack id", () => {
        expect(readEventName('2/chat,12["chat:typing",{}]')).toBe("chat:typing");
        expect(readEventName('212["space:emote",{}]')).toBe("space:emote");
    });

    it("reads a binary event", () => {
        expect(readEventName('51-["space:positions",{"_placeholder":true}]')).toBe(
            "space:positions"
        );
    });

    it("gives other for what is not an event", () => {
        expect(readEventName('0{"sid":"x"}')).toBe("other");
        expect(readEventName('3["ack"]')).toBe("other");
        expect(readEventName(new ArrayBuffer(4))).toBe("other");
        expect(readEventName(undefined)).toBe("other");
    });
});
