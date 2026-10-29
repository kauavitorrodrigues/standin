import { describe, expect, it } from "vitest";
import type { UserSummary } from "@standin/contracts";
import { buildPeopleRows } from "../buildPeopleRows";

const person = (id: string): UserSummary =>
    ({ id, name: id, profilePictureUrl: null }) as UserSummary;

const ana = person("ana");
const bia = person("bia");
const caio = person("caio");

describe("buildPeopleRows", () => {
    it("puts a title before the people of each group", () => {
        const rows = buildPeopleRows([ana], [bia, caio], new Set());

        expect(rows.map((row) => row.key)).toEqual([
            "header:online",
            "online:ana",
            "header:offline",
            "offline:bia",
            "offline:caio",
        ]);
    });

    it("counts the people of the group in its title", () => {
        const [, , header] = buildPeopleRows([ana], [bia, caio], new Set());

        expect(header).toMatchObject({
            kind: "header",
            count: 2,
            isOpen: true,
        });
    });

    it("leaves out the people of a folded group but keeps its title", () => {
        const rows = buildPeopleRows([ana], [bia, caio], new Set(["offline"]));

        expect(rows.map((row) => row.key)).toEqual([
            "header:online",
            "online:ana",
            "header:offline",
        ]);
        expect(rows[2]).toMatchObject({ isOpen: false, count: 2 });
    });

    it("skips a group with nobody in it", () => {
        const rows = buildPeopleRows([], [bia], new Set());

        expect(rows.map((row) => row.key)).toEqual([
            "header:offline",
            "offline:bia",
        ]);
    });

    it("marks who is online", () => {
        const rows = buildPeopleRows([ana], [bia], new Set());

        expect(rows.filter((row) => row.kind === "person")).toMatchObject([
            { isOnline: true },
            { isOnline: false },
        ]);
    });

    it("has no rows with nobody", () => {
        expect(buildPeopleRows([], [], new Set())).toEqual([]);
    });
});
