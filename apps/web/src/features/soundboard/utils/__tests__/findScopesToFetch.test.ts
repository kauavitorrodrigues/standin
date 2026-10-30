import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { SOUNDBOARD_FETCH_AHEAD_ROWS } from "../../consts/grid";
import { buildClipRows } from "../buildClipRows";
import { findScopesToFetch } from "../findScopesToFetch";
import { makeClips, makeGroup } from "./clipFixtures";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

const rowsWithMore = () =>
    buildClipRows({
        groups: [
            makeGroup(ORG, { clips: makeClips(30), hasNextPage: true }),
            makeGroup(DEFAULT, { clips: makeClips(3), hasNextPage: true }),
        ],
        columns: 3,
        collapsed: new Set(),
        hasSearch: false,
        showGroupHeaders: true,
    });

describe("findScopesToFetch", () => {
    it("asks for nothing while the end of the group is far", () => {
        expect(findScopesToFetch(rowsWithMore(), 0)).toEqual([]);
    });

    it("asks for the group whose last rows are close", () => {
        const rows = rowsWithMore();
        const moreIndex = rows.findIndex(
            (row) => row.kind === "state" && row.scope === ORG
        );

        expect(
            findScopesToFetch(rows, moreIndex - SOUNDBOARD_FETCH_AHEAD_ROWS)
        ).toEqual([ORG]);
    });

    it("asks for both when both ends are close", () => {
        const rows = rowsWithMore();

        expect(findScopesToFetch(rows, rows.length - 1)).toEqual([
            ORG,
            DEFAULT,
        ]);
    });

    it("never asks for a group with no more pages", () => {
        const rows = buildClipRows({
            groups: [makeGroup(ORG, { clips: makeClips(3) })],
            columns: 3,
            collapsed: new Set(),
            hasSearch: false,
            showGroupHeaders: true,
        });

        expect(findScopesToFetch(rows, rows.length - 1)).toEqual([]);
    });

    it("does not ask again for a group whose next page failed", () => {
        const rows = buildClipRows({
            groups: [
                makeGroup(ORG, {
                    clips: makeClips(3),
                    hasNextPage: true,
                    isNextPageError: true,
                }),
            ],
            columns: 3,
            collapsed: new Set(),
            hasSearch: false,
            showGroupHeaders: true,
        });

        expect(findScopesToFetch(rows, rows.length - 1)).toEqual([]);
    });

    it("does not ask for a collapsed group", () => {
        const rows = buildClipRows({
            groups: [
                makeGroup(ORG, { clips: makeClips(3), hasNextPage: true }),
            ],
            columns: 3,
            collapsed: new Set([ORG]),
            hasSearch: false,
            showGroupHeaders: true,
        });

        expect(findScopesToFetch(rows, rows.length - 1)).toEqual([]);
    });
});
