import { describe, expect, it } from "vitest";
import {
    SOUNDBOARD_GRID_GAP_PX,
    SOUNDBOARD_MAX_COLUMNS,
    SOUNDBOARD_MIN_COLUMNS,
    SOUNDBOARD_MIN_TILE_WIDTH_PX,
} from "../../consts/grid";
import { getColumnCount } from "../getColumnCount";

const WIDTH_FOR_MAX =
    SOUNDBOARD_MAX_COLUMNS * SOUNDBOARD_MIN_TILE_WIDTH_PX +
    (SOUNDBOARD_MAX_COLUMNS - 1) * SOUNDBOARD_GRID_GAP_PX;

describe("getColumnCount", () => {
    it("uses the most columns when the card is wide enough", () => {
        expect(getColumnCount(WIDTH_FOR_MAX)).toBe(SOUNDBOARD_MAX_COLUMNS);
        expect(getColumnCount(WIDTH_FOR_MAX + 200)).toBe(
            SOUNDBOARD_MAX_COLUMNS
        );
    });

    it("drops to two when three tiles would be too narrow", () => {
        expect(getColumnCount(WIDTH_FOR_MAX - 1)).toBe(SOUNDBOARD_MIN_COLUMNS);
    });

    it("never goes below two, even before the card is measured", () => {
        expect(getColumnCount(0)).toBe(SOUNDBOARD_MIN_COLUMNS);
        expect(getColumnCount(60)).toBe(SOUNDBOARD_MIN_COLUMNS);
    });
});
