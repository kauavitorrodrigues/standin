import { describe, expect, it } from "vitest";
import { GlobalSettingsUpdateSchema } from "../schemas/global-settings.update.schema";

describe("GlobalSettingsUpdateSchema", () => {
    it("takes one or more switches", () => {
        expect(
            GlobalSettingsUpdateSchema.safeParse({ allowSignup: false }).success
        ).toBe(true);
    });

    it("refuses an empty body, an unknown key and a non boolean", () => {
        expect(GlobalSettingsUpdateSchema.safeParse({}).success).toBe(false);
        expect(
            GlobalSettingsUpdateSchema.safeParse({ other: true }).success
        ).toBe(false);
        expect(
            GlobalSettingsUpdateSchema.safeParse({ allowSignup: "no" }).success
        ).toBe(false);
    });
});
