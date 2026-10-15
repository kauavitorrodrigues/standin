import { describe, expect, it } from "vitest";
import { buildAssetData } from "../buildData";
import { validateCreateAsset } from "../validateCreate";
import { createValues } from "./fixtures";

const seat = { dx: 16, dy: 8, facing: "DOWN" as const };

describe("action of a new asset", () => {
    it("sends no action without one", () => {
        const data = buildAssetData(createValues());
        expect(data.action).toBeUndefined();
        expect(data.actionParams).toBeUndefined();
    });

    it("sends the seats with the sit action", () => {
        const data = buildAssetData(
            createValues({ action: "SIT", seats: [seat] })
        );
        expect(data.action).toBe("SIT");
        expect(data.actionParams).toEqual({ seats: [seat] });
    });

    it("asks for a seat when the action is sit", () => {
        const errors = validateCreateAsset(
            createValues({ action: "SIT", seats: [] }),
            undefined
        );
        expect(errors.seats).toBeDefined();
    });

    it("does not ask for seats without the action", () => {
        const errors = validateCreateAsset(createValues(), undefined);
        expect(errors.seats).toBeUndefined();
    });
});
