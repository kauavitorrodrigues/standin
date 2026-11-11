import { describe, expect, it } from "vitest";
import { buildBehaviorOps } from "@/features/editor/utils/buildBehaviorOps";
import { fromBehaviorDraft } from "@/features/editor/utils/fromBehaviorDraft";
import { toBehaviorDraft } from "@/features/editor/utils/toBehaviorDraft";

describe("behavior draft", () => {
    it("starts empty in url mode when there are no params", () => {
        expect(toBehaviorDraft(null)).toEqual({ mode: "url", text: "" });
    });

    it("reads the params in each mode", () => {
        expect(
            toBehaviorDraft({ mode: "url", url: "https://example.com" })
        ).toEqual({ mode: "url", text: "https://example.com" });
        expect(
            toBehaviorDraft({
                mode: "derived",
                prefix: "https://meet.example/room-",
            })
        ).toEqual({ mode: "derived", text: "https://meet.example/room-" });
    });

    it("writes only the field of the chosen mode", () => {
        expect(
            fromBehaviorDraft({ mode: "url", text: " https://example.com " })
        ).toEqual({ mode: "url", url: "https://example.com" });
        expect(
            fromBehaviorDraft({
                mode: "derived",
                text: "https://meet.example/room-",
            })
        ).toEqual({ mode: "derived", prefix: "https://meet.example/room-" });
    });

    it("builds one set_behavior op, with null to clear", () => {
        expect(buildBehaviorOps("a", null)).toEqual([
            { type: "set_behavior", id: "a", params: null },
        ]);
    });
});
