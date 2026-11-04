import { describe, expect, it } from "vitest";
import { buildMentionNotification } from "../buildMentionNotification";

describe("buildMentionNotification", () => {
    it("has its own text and is shown and heard whatever the settings say", () => {
        expect(buildMentionNotification("m1", "Ana", "oi @Bia")).toEqual({
            title: "Ana mencionou você",
            body: "oi @Bia",
            tag: "mention:m1",
            showNotification: true,
            playSound: true,
        });
    });

    it("falls back to a file when the message has no text", () => {
        expect(buildMentionNotification("m1", "Ana", null).body).toBe(
            "Enviou um arquivo"
        );
    });

    it("does not share a tag with the notification of the conversation", () => {
        const first = buildMentionNotification("m1", "Ana", "a");
        const second = buildMentionNotification("m2", "Ana", "b");
        expect(first.tag).not.toBe(second.tag);
        expect(first.tag).not.toBe("c1");
    });
});
