import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClipScope } from "@standin/contracts";
import type { ClipRow } from "../../types/row";
import { buildClipRows } from "../buildClipRows";
import { isRowCollapsed } from "../isRowCollapsed";
import { makeClips, makeGroup } from "./clipFixtures";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

const kinds = (rows: ClipRow[]) => rows.map((row) => row.kind);

const scopesOf = (rows: ClipRow[]) =>
    rows.flatMap((row) => (row.kind === "panel" ? [] : [row.scope]));

type Options = {
    columns?: number;
    collapsed?: ReadonlySet<SoundboardClipScope>;
    hasSearch?: boolean;
    showGroupHeaders?: boolean;
};

const build = (
    groups: Parameters<typeof buildClipRows>[0]["groups"],
    {
        columns = 3,
        collapsed = new Set(),
        hasSearch = false,
        showGroupHeaders = true,
    }: Options = {}
) =>
    buildClipRows({
        groups,
        columns,
        collapsed,
        hasSearch,
        showGroupHeaders,
    });

describe("buildClipRows", () => {
    it("puts each group header before its tiles, the organization first", () => {
        const rows = build([
            makeGroup(ORG, { clips: makeClips(4, "o") }),
            makeGroup(DEFAULT, { clips: makeClips(1, "d") }),
        ]);

        expect(kinds(rows)).toEqual([
            "header",
            "tiles",
            "tiles",
            "header",
            "tiles",
        ]);
        expect(scopesOf(rows)).toEqual([ORG, ORG, ORG, DEFAULT, DEFAULT]);
    });

    it("cuts the tiles into lines of the column count", () => {
        const rows = build([makeGroup(ORG, { clips: makeClips(7) })]);

        const sizes = rows.flatMap((row) =>
            row.kind === "tiles" ? [row.clips.length] : []
        );
        expect(sizes).toEqual([3, 3, 1]);
    });

    it("changes the lines with the column count", () => {
        const rows = build([makeGroup(ORG, { clips: makeClips(7) })], {
            columns: 2,
        });

        expect(rows.filter((row) => row.kind === "tiles")).toHaveLength(4);
    });

    it("keeps the rows of a folded group in the list, flagged", () => {
        const rows = build(
            [
                makeGroup(ORG, { clips: makeClips(5) }),
                makeGroup(DEFAULT, { clips: makeClips(5) }),
            ],
            { collapsed: new Set([ORG]) }
        );

        expect(kinds(rows)).toEqual([
            "header",
            "tiles",
            "tiles",
            "header",
            "tiles",
            "tiles",
        ]);
        const flags = rows.map((row) => isRowCollapsed(row));
        expect(flags).toEqual([false, true, true, false, false, false]);
        const [first] = rows;
        expect(first?.kind === "header" && first.isOpen).toBe(false);
    });

    it("keeps the state and the more row of a folded group flagged too", () => {
        const rows = build(
            [makeGroup(ORG, { clips: makeClips(3), hasNextPage: true })],
            { collapsed: new Set([ORG]) }
        );

        expect(kinds(rows)).toEqual(["header", "tiles", "state"]);
        expect(rows.map((row) => isRowCollapsed(row))).toEqual([
            false,
            true,
            true,
        ]);
    });

    it("keeps the keys of the rows the same whether the group is folded or not", () => {
        const groups = [makeGroup(ORG, { clips: makeClips(5) })];

        const open = build(groups);
        const folded = build(groups, { collapsed: new Set([ORG]) });

        expect(folded.map((row) => row.key)).toEqual(
            open.map((row) => row.key)
        );
    });

    it("has the same number of rows folded or not, so only their size changes", () => {
        const groups = [makeGroup(ORG, { clips: makeClips(8) })];

        expect(build(groups, { collapsed: new Set([ORG]) })).toHaveLength(
            build(groups).length
        );
    });

    it("leaves out a group that has no clips", () => {
        const rows = build([
            makeGroup(ORG),
            makeGroup(DEFAULT, { clips: makeClips(2) }),
        ]);

        expect(new Set(scopesOf(rows))).toEqual(new Set([DEFAULT]));
        expect(kinds(rows)).toEqual(["header", "tiles"]);
    });

    it("lists only the organization when the defaults have none", () => {
        const rows = build([
            makeGroup(ORG, { clips: makeClips(2) }),
            makeGroup(DEFAULT),
        ]);

        expect(new Set(scopesOf(rows))).toEqual(new Set([ORG]));
    });

    it("shows one empty state when neither group has clips", () => {
        const rows = build([makeGroup(ORG), makeGroup(DEFAULT)]);

        expect(rows).toEqual([
            { kind: "panel", key: "panel:empty", state: "empty" },
        ]);
    });

    it("shows no results instead when a search matched nothing", () => {
        const rows = build([makeGroup(ORG), makeGroup(DEFAULT)], {
            hasSearch: true,
        });

        expect(rows).toEqual([
            { kind: "panel", key: "panel:no-results", state: "no-results" },
        ]);
    });

    it("shows a loading row with no header while a group is not known", () => {
        const rows = build([
            makeGroup(ORG, { isLoading: true }),
            makeGroup(DEFAULT, { clips: makeClips(2) }),
        ]);

        expect(kinds(rows)).toEqual(["state", "header", "tiles"]);
        expect(rows.at(0)).toMatchObject({ state: "loading", scope: ORG });
    });

    it("does not call the panel empty while a group still loads", () => {
        const rows = build([
            makeGroup(ORG, { isLoading: true }),
            makeGroup(DEFAULT),
        ]);

        expect(kinds(rows)).toEqual(["state"]);
    });

    it("shows the error of one group without hiding the other", () => {
        const rows = build([
            makeGroup(ORG, { isError: true }),
            makeGroup(DEFAULT, { clips: makeClips(2) }),
        ]);

        expect(rows.at(0)).toMatchObject({ state: "error", scope: ORG });
        expect(kinds(rows)).toEqual(["state", "header", "tiles"]);
    });

    it("ends a group with more to come in a row that stands for them", () => {
        const rows = build([
            makeGroup(ORG, { clips: makeClips(3), hasNextPage: true }),
        ]);

        expect(rows.at(-1)).toMatchObject({ state: "more", scope: ORG });
    });

    it("offers a retry when the next page failed, keeping the tiles", () => {
        const rows = build([
            makeGroup(ORG, {
                clips: makeClips(3),
                hasNextPage: true,
                isNextPageError: true,
            }),
        ]);

        expect(kinds(rows)).toEqual(["header", "tiles", "state"]);
        expect(rows.at(-1)).toMatchObject({ state: "more-error" });
    });

    it("gives every row a key that is unique in the list", () => {
        const rows = build([
            makeGroup(ORG, { clips: makeClips(9) }),
            makeGroup(DEFAULT, { clips: makeClips(9) }),
        ]);

        expect(new Set(rows.map((row) => row.key)).size).toBe(rows.length);
    });

    describe("without group headers, as on a page", () => {
        const noHeaders = { showGroupHeaders: false };

        it("is rows alone, with no header row", () => {
            const rows = build(
                [makeGroup(ORG, { clips: makeClips(7) })],
                noHeaders
            );

            expect(kinds(rows)).toEqual(["tiles", "tiles", "tiles"]);
        });

        it("has the same tile lines as with headers, only without the header", () => {
            const groups = [makeGroup(ORG, { clips: makeClips(7) })];

            const withHeaders = build(groups);
            const without = build(groups, noHeaders);

            expect(without.map((row) => row.key)).toEqual(
                withHeaders
                    .filter((row) => row.kind !== "header")
                    .map((row) => row.key)
            );
        });

        it("never folds, since there is no header to fold it", () => {
            const rows = build([makeGroup(ORG, { clips: makeClips(4) })], {
                ...noHeaders,
                collapsed: new Set([ORG]),
            });

            expect(rows.map((row) => isRowCollapsed(row))).toEqual([
                false,
                false,
            ]);
        });

        it("keeps the loading row of a group not known yet", () => {
            const rows = build(
                [makeGroup(ORG, { isLoading: true })],
                noHeaders
            );

            expect(rows).toHaveLength(1);
            expect(rows.at(0)).toMatchObject({
                kind: "state",
                state: "loading",
            });
        });

        it("keeps the error row of a failed list", () => {
            const rows = build([makeGroup(ORG, { isError: true })], noHeaders);

            expect(rows.at(0)).toMatchObject({ kind: "state", state: "error" });
        });

        it("says there is nothing yet when the one scope is empty", () => {
            expect(build([makeGroup(ORG)], noHeaders)).toEqual([
                { kind: "panel", key: "panel:empty", state: "empty" },
            ]);
        });

        it("says nothing matched when a search finds nothing", () => {
            expect(
                build([makeGroup(ORG)], { ...noHeaders, hasSearch: true })
            ).toEqual([
                { kind: "panel", key: "panel:no-results", state: "no-results" },
            ]);
        });

        it("ends the list with the row of more pages to come", () => {
            const rows = build(
                [makeGroup(ORG, { clips: makeClips(3), hasNextPage: true })],
                noHeaders
            );

            expect(kinds(rows)).toEqual(["tiles", "state"]);
            expect(rows.at(-1)).toMatchObject({ state: "more" });
        });
    });
});
