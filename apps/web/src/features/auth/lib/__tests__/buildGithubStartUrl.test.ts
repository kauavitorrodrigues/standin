import { describe, expect, it, vi } from "vitest";

// The module reads the API address from the environment when it loads.
vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://localhost:3001" }));
import { buildGithubStartUrl } from "../buildGithubStartUrl";

describe("buildGithubStartUrl", () => {
    it("puts the path behind the API origin", () => {
        expect(buildGithubStartUrl("http://localhost:3001")).toBe(
            "http://localhost:3001/auth/github"
        );
    });

    it("ignores a trailing slash of the base", () => {
        expect(buildGithubStartUrl("http://localhost:3001/")).toBe(
            "http://localhost:3001/auth/github"
        );
    });

    it("uses the proxy prefix of the LAN mode", () => {
        expect(buildGithubStartUrl("/api")).toBe("/api/auth/github");
    });
});
