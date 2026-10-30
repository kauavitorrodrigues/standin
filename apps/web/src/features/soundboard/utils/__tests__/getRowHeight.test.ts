import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import {
    SOUNDBOARD_HEADER_ROW_HEIGHT_PX,
    SOUNDBOARD_PANEL_STATE_ROW_HEIGHT_PX,
    SOUNDBOARD_STATE_ROW_HEIGHT_PX,
    SOUNDBOARD_TILE_ROW_HEIGHT_PX,
} from "../../consts/grid";
import { getRowHeight } from "../getRowHeight";
import { makeClips } from "./clipFixtures";

const scope = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;

describe("getRowHeight", () => {
    it("has a height for each kind of row", () => {
        expect(
            getRowHeight({
                kind: "header",
                key: "h",
                scope,
                label: "",
                isOpen: true,
            })
        ).toBe(SOUNDBOARD_HEADER_ROW_HEIGHT_PX);
        expect(
            getRowHeight({
                kind: "tiles",
                key: "t",
                scope,
                clips: makeClips(1),
                isCollapsed: false,
            })
        ).toBe(SOUNDBOARD_TILE_ROW_HEIGHT_PX);
        expect(
            getRowHeight({
                kind: "state",
                key: "s",
                scope,
                state: "loading",
                isCollapsed: false,
            })
        ).toBe(SOUNDBOARD_STATE_ROW_HEIGHT_PX);
        expect(getRowHeight({ kind: "panel", key: "p", state: "empty" })).toBe(
            SOUNDBOARD_PANEL_STATE_ROW_HEIGHT_PX
        );
    });

    it("has no height for a row of a folded group, whatever its kind", () => {
        expect(
            getRowHeight({
                kind: "tiles",
                key: "t",
                scope,
                clips: makeClips(1),
                isCollapsed: true,
            })
        ).toBe(0);
        expect(
            getRowHeight({
                kind: "state",
                key: "s",
                scope,
                state: "more",
                isCollapsed: true,
            })
        ).toBe(0);
    });

    it("keeps the height of the header of a folded group", () => {
        expect(
            getRowHeight({
                kind: "header",
                key: "h",
                scope,
                label: "",
                isOpen: false,
            })
        ).toBe(SOUNDBOARD_HEADER_ROW_HEIGHT_PX);
    });

    it("has the height the layout gives a line of tiles", () => {
        expect(
            getRowHeight(
                {
                    kind: "tiles",
                    key: "t",
                    scope,
                    clips: makeClips(1),
                    isCollapsed: false,
                },
                44
            )
        ).toBe(44);
    });

    it("keeps the other rows the same whatever the layout", () => {
        expect(
            getRowHeight(
                {
                    kind: "header",
                    key: "h",
                    scope,
                    label: "",
                    isOpen: true,
                },
                200
            )
        ).toBe(SOUNDBOARD_HEADER_ROW_HEIGHT_PX);
    });

    it("folds a line to nothing whatever its height", () => {
        expect(
            getRowHeight(
                {
                    kind: "tiles",
                    key: "t",
                    scope,
                    clips: makeClips(1),
                    isCollapsed: true,
                },
                200
            )
        ).toBe(0);
    });

    it("has one for a row that is gone", () => {
        expect(getRowHeight(undefined)).toBe(SOUNDBOARD_STATE_ROW_HEIGHT_PX);
    });
});
