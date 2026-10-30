import { describe, expect, it } from "vitest";
import { SOUNDBOARD_TABLE_ACTIONS_TRACK } from "../../consts/tableColumns";
import { buildTableTemplate } from "../buildTableTemplate";
import { getTableColumns } from "../getTableColumns";

describe("buildTableTemplate", () => {
    it("gives the name the room that is left", () => {
        expect(
            buildTableTemplate(getTableColumns(0)).startsWith("minmax(0, 1fr)")
        ).toBe(true);
    });

    it("puts the track of the buttons last, on every width", () => {
        for (const width of [0, 520, 900]) {
            expect(
                buildTableTemplate(getTableColumns(width)).endsWith(
                    SOUNDBOARD_TABLE_ACTIONS_TRACK
                )
            ).toBe(true);
        }
    });

    it("has the track of each column the list has room for", () => {
        const columns = getTableColumns(900);
        const template = buildTableTemplate(columns);

        expect(columns.every((column) => template.includes(column.track))).toBe(
            true
        );
    });

    it("is shorter on a narrower list, which has fewer columns", () => {
        expect(buildTableTemplate(getTableColumns(300)).length).toBeLessThan(
            buildTableTemplate(getTableColumns(900)).length
        );
    });
});
