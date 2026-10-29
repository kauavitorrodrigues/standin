import { describe, expect, it } from "vitest";

// The ping against a real Postgres. Off unless INTEGRATION_DATABASE_URL points
// at a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;

describe.skipIf(!enabled)("HealthRepository.ping (real database)", () => {
    it("resolves while the database answers", async () => {
        process.env.DATABASE_URL = url;
        const { HealthRepository } = await import("../index");

        await expect(HealthRepository.ping()).resolves.toBeUndefined();
    });
});
