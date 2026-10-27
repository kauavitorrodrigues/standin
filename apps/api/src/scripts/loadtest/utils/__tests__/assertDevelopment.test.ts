import { describe, expect, it } from "vitest";
import { assertDevelopment } from "../assertDevelopment";

const local = {
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://u:p@localhost:5436/standin",
};

describe("assertDevelopment", () => {
    it("allows a local database and a local API", () => {
        expect(() =>
            assertDevelopment("http://localhost:3001", local)
        ).not.toThrow();
        expect(() =>
            assertDevelopment("http://127.0.0.1:3001", {
                DATABASE_URL: "postgresql://u:p@127.0.0.1:5436/standin",
            })
        ).not.toThrow();
    });

    it("refuses production", () => {
        expect(() =>
            assertDevelopment("http://localhost:3001", {
                ...local,
                NODE_ENV: "production",
            })
        ).toThrow(/production/);
    });

    it("refuses a database that is not local, even with no NODE_ENV", () => {
        expect(() =>
            assertDevelopment("http://localhost:3001", {
                DATABASE_URL: "postgresql://u:p@db.example.com:5432/app",
            })
        ).toThrow(/local database/);
    });

    it("refuses a missing or invalid database url", () => {
        expect(() => assertDevelopment("http://localhost:3001", {})).toThrow(
            /local database/
        );
        expect(() =>
            assertDevelopment("http://localhost:3001", {
                DATABASE_URL: "not a url",
            })
        ).toThrow(/local database/);
    });

    it("refuses a remote API", () => {
        expect(() =>
            assertDevelopment("https://app.example.com", local)
        ).toThrow(/local API/);
    });
});
