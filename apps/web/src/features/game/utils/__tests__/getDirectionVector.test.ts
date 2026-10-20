import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "@standin/contracts";
import { getDirectionVector } from "@/features/game/utils/getDirectionVector";

describe("getDirectionVector", () => {
    it("is one tile in the direction", () => {
        expect(getDirectionVector(PLAYER_DIRECTIONS.UP)).toEqual({ x: 0, y: -1 });
        expect(getDirectionVector(PLAYER_DIRECTIONS.DOWN)).toEqual({ x: 0, y: 1 });
        expect(getDirectionVector(PLAYER_DIRECTIONS.LEFT)).toEqual({ x: -1, y: 0 });
        expect(getDirectionVector(PLAYER_DIRECTIONS.RIGHT)).toEqual({ x: 1, y: 0 });
    });
});
