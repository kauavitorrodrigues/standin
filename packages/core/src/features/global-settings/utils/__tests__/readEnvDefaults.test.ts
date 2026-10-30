import { describe, expect, it } from "vitest";
import { readEnvDefaults } from "../readEnvDefaults";

describe("readEnvDefaults", () => {
    it("keeps everything open without variables", () => {
        expect(readEnvDefaults({})).toEqual({
            allowSignup: true,
            allowOrganizationCreation: true,
            allowSpaceCreation: true,
        });
    });

    it("closes only what the variables turn off", () => {
        expect(
            readEnvDefaults({
                ALLOW_SIGNUP: "false",
                ALLOW_SPACE_CREATION: "0",
            })
        ).toEqual({
            allowSignup: false,
            allowOrganizationCreation: true,
            allowSpaceCreation: false,
        });
    });

    it("accepts any case and spacing", () => {
        expect(readEnvDefaults({ ALLOW_SIGNUP: " FALSE " }).allowSignup).toBe(
            false
        );
        expect(readEnvDefaults({ ALLOW_SIGNUP: "On" }).allowSignup).toBe(true);
    });

    it("ignores a value it does not know, so a typo never closes the instance", () => {
        expect(readEnvDefaults({ ALLOW_SIGNUP: "nope" }).allowSignup).toBe(
            true
        );
        expect(readEnvDefaults({ ALLOW_SIGNUP: "" }).allowSignup).toBe(true);
    });
});
