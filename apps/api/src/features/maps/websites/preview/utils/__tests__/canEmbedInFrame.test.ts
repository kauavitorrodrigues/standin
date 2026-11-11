import { describe, expect, it } from "vitest";
import { canEmbedInFrame } from "../canEmbedInFrame";

const APP = "https://standin.example";
const headers = (
    xFrameOptions: string | null,
    contentSecurityPolicy: string | null = null
) => ({ xFrameOptions, contentSecurityPolicy });

describe("canEmbedInFrame", () => {
    it("accepts a site that sends neither header", () => {
        expect(canEmbedInFrame(headers(null), APP)).toBe(true);
    });

    describe("X-Frame-Options", () => {
        it.each(["DENY", "deny", "SAMEORIGIN", " sameorigin ", "DENY, DENY"])(
            "refuses %s",
            (value) => {
                expect(canEmbedInFrame(headers(value), APP)).toBe(false);
            }
        );

        it("ignores the obsolete ALLOW-FROM, as browsers do", () => {
            expect(
                canEmbedInFrame(headers("ALLOW-FROM https://a.example"), APP)
            ).toBe(true);
        });
    });

    describe("frame-ancestors", () => {
        it.each([
            ["none", "frame-ancestors 'none'"],
            ["self only", "frame-ancestors 'self'"],
            ["another site", "frame-ancestors https://other.example"],
            ["another port", "frame-ancestors https://standin.example:8443"],
            ["a wildcard on another domain", "frame-ancestors *.other.example"],
            [
                "a policy after another that allows",
                "frame-ancestors *, frame-ancestors 'none'",
            ],
        ])("refuses %s", (_name, csp) => {
            expect(canEmbedInFrame(headers(null, csp), APP)).toBe(false);
        });

        it.each([
            ["everyone", "frame-ancestors *"],
            ["the app", "frame-ancestors https://standin.example"],
            [
                "the app among others",
                "frame-ancestors 'self' https://standin.example",
            ],
            ["a wildcard host", "frame-ancestors https://*.example"],
            ["the scheme alone", "frame-ancestors https:"],
            ["any port", "frame-ancestors https://standin.example:*"],
            [
                "the scheme and a default port",
                "frame-ancestors https://standin.example:443",
            ],
            ["http that upgrades", "frame-ancestors http://standin.example"],
            [
                "a policy with other directives",
                "default-src 'self'; frame-ancestors *; img-src *",
            ],
            ["a policy that says nothing about frames", "default-src 'self'"],
        ])("accepts %s", (_name, csp) => {
            expect(canEmbedInFrame(headers(null, csp), APP)).toBe(true);
        });

        it("does not take a secure source for an insecure app", () => {
            expect(
                canEmbedInFrame(
                    headers(null, "frame-ancestors https://localhost:5173"),
                    "http://localhost:5173"
                )
            ).toBe(false);
        });

        it("matches a non-default port of the app", () => {
            expect(
                canEmbedInFrame(
                    headers(null, "frame-ancestors http://localhost:5173"),
                    "http://localhost:5173"
                )
            ).toBe(true);
            expect(
                canEmbedInFrame(
                    headers(null, "frame-ancestors http://localhost"),
                    "http://localhost:5173"
                )
            ).toBe(false);
        });

        it("applies every policy that was sent", () => {
            expect(
                canEmbedInFrame(
                    headers(null, "frame-ancestors *, frame-ancestors 'none'"),
                    APP
                )
            ).toBe(false);
        });

        it("lets only a policy for everyone pass when the app has no address", () => {
            expect(
                canEmbedInFrame(headers(null, "frame-ancestors *"), "")
            ).toBe(true);
            expect(
                canEmbedInFrame(
                    headers(null, "frame-ancestors https://standin.example"),
                    ""
                )
            ).toBe(false);
        });
    });

    it("refuses when either header refuses", () => {
        expect(canEmbedInFrame(headers("DENY", "frame-ancestors *"), APP)).toBe(
            false
        );
    });
});
