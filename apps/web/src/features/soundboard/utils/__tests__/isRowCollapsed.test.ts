import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { isRowCollapsed } from "../isRowCollapsed";
import { makeClips } from "./clipFixtures";

const scope = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;

describe("isRowCollapsed", () => {
    it("is true for tile and state rows of a folded group", () => {
        expect(
            isRowCollapsed({
                kind: "tiles",
                key: "t",
                scope,
                clips: makeClips(1),
                isCollapsed: true,
            })
        ).toBe(true);
        expect(
            isRowCollapsed({
                kind: "state",
                key: "s",
                scope,
                state: "more",
                isCollapsed: true,
            })
        ).toBe(true);
    });

    it("is false for the same rows of an open group", () => {
        expect(
            isRowCollapsed({
                kind: "tiles",
                key: "t",
                scope,
                clips: makeClips(1),
                isCollapsed: false,
            })
        ).toBe(false);
    });

    it("is false for a header, even of a folded group, and for the panel", () => {
        expect(
            isRowCollapsed({
                kind: "header",
                key: "h",
                scope,
                label: "",
                isOpen: false,
            })
        ).toBe(false);
        expect(
            isRowCollapsed({ kind: "panel", key: "p", state: "empty" })
        ).toBe(false);
    });

    it("is false for a row that is gone", () => {
        expect(isRowCollapsed(undefined)).toBe(false);
    });
});
