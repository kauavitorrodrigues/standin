import { describe, expect, it } from "vitest";
import { buildMessageParts } from "../buildMessageParts";
import { previewMentions } from "../previewMentions";
import { refreshMentionLabels } from "../refreshMentionLabels";

const mentions = [{ userId: "u1", name: "Ana Nova" }];
const content = "oi [@Ana Velha](mention:u1)!";

describe("buildMessageParts", () => {
    it("draws the current name of a mention", () => {
        expect(buildMessageParts(content, mentions)).toEqual([
            { type: "text", text: "oi " },
            { type: "mention", userId: "u1", label: "@Ana Nova" },
            { type: "text", text: "!" },
        ]);
    });

    it("keeps the typed label when there is no current name", () => {
        expect(buildMessageParts(content, [])[1]).toEqual({
            type: "mention",
            userId: "u1",
            label: "@Ana Velha",
        });
    });
});

describe("previewMentions", () => {
    it("replaces the link with @Name", () => {
        expect(previewMentions(content, mentions)).toBe("oi @Ana Nova!");
    });

    it("never shows the raw link", () => {
        expect(previewMentions(content, [])).toBe("oi @Ana Velha!");
    });

    it("passes a missing content through", () => {
        expect(previewMentions(null, mentions)).toBeNull();
    });
});

describe("refreshMentionLabels", () => {
    it("rewrites the link with the current name", () => {
        expect(refreshMentionLabels(content, mentions)).toBe(
            "oi [@Ana Nova](mention:u1)!"
        );
    });

    it("keeps a link whose person is unknown", () => {
        expect(refreshMentionLabels(content, [])).toBe(content);
    });

    it("keeps content with no mention", () => {
        expect(refreshMentionLabels("a\nb", mentions)).toBe("a\nb");
    });
});
