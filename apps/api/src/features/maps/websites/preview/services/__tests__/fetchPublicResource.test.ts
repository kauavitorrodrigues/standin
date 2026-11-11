import { describe, expect, it } from "vitest";
import {
    WebsitePreviewBlockedAddressError,
    WebsitePreviewRequestError,
} from "@standin/contracts";
import { HTML_TYPES, WEBSITE_PREVIEW_LIMITS } from "../../consts";
import { fetchPublicResource } from "../fetchPublicResource";

const options = {
    acceptedTypes: HTML_TYPES,
    maxBytes: WEBSITE_PREVIEW_LIMITS.MAX_HTML_BYTES,
    overflow: "truncate",
} as const;

// None of these reach the network: each is refused before a socket opens, or
// by the check on the addresses the name resolves to.
describe("fetchPublicResource refusals", () => {
    it.each([
        ["loopback", "https://127.0.0.1/"],
        ["private network", "https://10.0.0.5/admin"],
        ["cloud metadata", "https://169.254.169.254/latest/meta-data/"],
        ["ipv6 loopback", "https://[::1]/"],
        ["ipv4 mapped loopback", "https://[::ffff:127.0.0.1]/"],
        ["localhost", "https://localhost/"],
        ["a name that means loopback", "https://localhost./"],
    ])("refuses %s", async (_name, url) => {
        await expect(fetchPublicResource(url, options)).rejects.toBeInstanceOf(
            WebsitePreviewBlockedAddressError
        );
    });

    it.each([
        ["plain http", "http://example.com/"],
        ["another port", "https://example.com:8443/"],
        ["a login in the address", "https://user:pass@example.com/"],
        ["a script scheme", "javascript:alert(1)"],
        ["a data scheme", "data:text/html,hi"],
        ["a file scheme", "file:///etc/passwd"],
        ["no address at all", "not a url"],
    ])("refuses %s", async (_name, url) => {
        await expect(fetchPublicResource(url, options)).rejects.toBeInstanceOf(
            WebsitePreviewRequestError
        );
    });
});
