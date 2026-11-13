import { describe, expect, it } from "vitest";
import {
    SpaceSettingsSchema,
    SpaceSettingsUpdateSchema,
} from "../space-settings.schema";

describe("SpaceSettingsSchema", () => {
    it("applies the defaults to an empty object", () => {
        expect(SpaceSettingsSchema.parse({})).toEqual({
            enableSendNearbyInMapView: true,
            proximityPreset: "Long",
            ambientRange: "short",
            membersCanInvite: false,
        });
    });

    it("keeps a saved value", () => {
        expect(
            SpaceSettingsSchema.parse({ enableSendNearbyInMapView: false })
        ).toEqual({
            enableSendNearbyInMapView: false,
            proximityPreset: "Long",
            ambientRange: "short",
            membersCanInvite: false,
        });
    });

    it("keeps a saved preset and rejects one that does not exist", () => {
        expect(
            SpaceSettingsSchema.parse({ proximityPreset: "Short" })
                .proximityPreset
        ).toBe("Short");
        expect(
            SpaceSettingsSchema.safeParse({ proximityPreset: "Huge" }).success
        ).toBe(false);
    });

    it("keeps a saved ambient range and rejects one that does not exist", () => {
        expect(SpaceSettingsSchema.parse({}).ambientRange).toBe("short");
        expect(
            SpaceSettingsSchema.parse({ ambientRange: "off" }).ambientRange
        ).toBe("off");
        expect(
            SpaceSettingsSchema.safeParse({ ambientRange: "huge" }).success
        ).toBe(false);
        expect(
            SpaceSettingsUpdateSchema.safeParse({ ambientRange: "long" }).success
        ).toBe(true);
    });

    it("keeps members from inviting until the setting is saved", () => {
        expect(SpaceSettingsSchema.parse({}).membersCanInvite).toBe(false);
        expect(
            SpaceSettingsSchema.parse({ membersCanInvite: true })
                .membersCanInvite
        ).toBe(true);
        expect(
            SpaceSettingsSchema.safeParse({ membersCanInvite: "yes" }).success
        ).toBe(false);
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
