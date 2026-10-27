import { describe, expect, it } from "vitest";
import {
    SpaceSettingsSchema,
    SpaceSettingsUpdateSchema,
} from "../space-settings.schema";

describe("SpaceSettingsSchema", () => {
    it("applies the defaults to an empty object", () => {
        expect(SpaceSettingsSchema.parse({})).toEqual({
            enableSendNearbyInMapView: true,
        });
    });

    it("keeps a saved value", () => {
        expect(
            SpaceSettingsSchema.parse({ enableSendNearbyInMapView: false })
        ).toEqual({ enableSendNearbyInMapView: false });
    });

    it("rejects a value that is not a boolean", () => {
        expect(
            SpaceSettingsSchema.safeParse({ enableSendNearbyInMapView: "no" })
                .success
        ).toBe(false);
    });
});

describe("SpaceSettingsUpdateSchema", () => {
    it("accepts a partial save without filling the defaults", () => {
        expect(SpaceSettingsUpdateSchema.parse({})).toEqual({});
    });

    it("rejects a key that is not a setting", () => {
        expect(SpaceSettingsUpdateSchema.safeParse({ roles: true }).success).toBe(
            false
        );
    });
});
