import { describe, expect, it } from "vitest";
import { getTableColumns } from "../getTableColumns";

const idsAt = (widthPx: number) =>
    getTableColumns(widthPx).map((column) => column.id);

describe("getTableColumns", () => {
    it("keeps only the name and the duration on a narrow list", () => {
        expect(idsAt(0)).toEqual(["name", "duration"]);
        expect(idsAt(400)).toEqual(["name", "duration"]);
    });

    it("adds the columns one by one as the list widens", () => {
        expect(idsAt(520)).toEqual(["name", "duration", "volume"]);
        expect(idsAt(640)).toEqual(["name", "duration", "volume", "uploader"]);
        expect(idsAt(760)).toEqual([
            "name",
            "duration",
            "volume",
            "uploader",
            "date",
        ]);
    });

    it("drops a column the moment the list is a pixel too narrow for it", () => {
        expect(idsAt(519)).not.toContain("volume");
        expect(idsAt(639)).not.toContain("uploader");
        expect(idsAt(759)).not.toContain("date");
    });

    it("always has the name first", () => {
        expect(idsAt(1600).at(0)).toBe("name");
    });
});
