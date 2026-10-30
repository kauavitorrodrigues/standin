import { describe, expect, it, vi } from "vitest";
import { SOUNDBOARD_TILE_ROW_HEIGHT_PX } from "../../../consts/grid";
import { SOUNDBOARD_TABLE_ROW_HEIGHT_PX } from "../../../consts/listLayout";
import { getColumnCount } from "../../../utils/getColumnCount";

// Layouts import the rows, which reach the API client.
vi.mock("@/lib/api/url", () => ({
    API_BASE_URL: "http://api",
    SOCKET_URL: "http://api",
    SOCKET_PATH_OPTIONS: {},
}));

import { PANEL_LIST_LAYOUT, TABLE_LIST_LAYOUT } from "../listLayouts";

describe("list layouts", () => {
    it("has one clip to a row in the table, whatever the width", () => {
        expect(TABLE_LIST_LAYOUT.getColumnCount(0)).toBe(1);
        expect(TABLE_LIST_LAYOUT.getColumnCount(2000)).toBe(1);
    });

    it("has the row height of the table", () => {
        expect(TABLE_LIST_LAYOUT.getTilesRowHeight(900, 1)).toBe(
            SOUNDBOARD_TABLE_ROW_HEIGHT_PX
        );
    });

    it("has a column header for the table only", () => {
        expect(TABLE_LIST_LAYOUT.Header).not.toBe(PANEL_LIST_LAYOUT.Header);
    });

    it("keeps the panel as it was: three or two columns, its fixed row", () => {
        expect(PANEL_LIST_LAYOUT.getColumnCount(400)).toBe(getColumnCount(400));
        expect(PANEL_LIST_LAYOUT.getTilesRowHeight(400, 3)).toBe(
            SOUNDBOARD_TILE_ROW_HEIGHT_PX
        );
    });

    it("has its own row to draw in each layout", () => {
        expect(PANEL_LIST_LAYOUT.TilesRow).not.toBe(TABLE_LIST_LAYOUT.TilesRow);
    });
});
