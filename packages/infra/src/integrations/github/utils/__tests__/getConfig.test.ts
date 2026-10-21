import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getConfig } from "../getConfig";

const NAMES = [
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CALLBACK_URL",
] as const;

describe("getConfig", () => {
    const saved: Record<string, string | undefined> = {};

    beforeEach(() => {
        for (const name of NAMES) {
            saved[name] = process.env[name];
            delete process.env[name];
        }
    });

    afterEach(() => {
        for (const name of NAMES) {
            if (saved[name] === undefined) delete process.env[name];
            else process.env[name] = saved[name];
        }
    });

    const setAll = () => {
        process.env.GITHUB_CLIENT_ID = "id";
        process.env.GITHUB_CLIENT_SECRET = "secret";
        process.env.GITHUB_CALLBACK_URL =
            "http://localhost:3001/auth/github/callback";
    };

    it("is on when the three variables are set", () => {
        setAll();

        expect(getConfig()).toEqual({
            clientId: "id",
            clientSecret: "secret",
            callbackUrl: "http://localhost:3001/auth/github/callback",
        });
    });

    it("is off with no variables", () => {
        expect(getConfig()).toBeNull();
    });

    it.each(NAMES)("is off when %s is missing", (name) => {
        setAll();
        delete process.env[name];

        expect(getConfig()).toBeNull();
    });

    it("is off when a variable is only blanks", () => {
        setAll();
        process.env.GITHUB_CLIENT_SECRET = "   ";

        expect(getConfig()).toBeNull();
    });
});
