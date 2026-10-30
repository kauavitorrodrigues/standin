import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { buildClipsPath, buildListPath } from "../buildPath";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

describe("buildListPath", () => {
    it("lists an organization through the organization", () => {
        expect(
            buildListPath({ kind: "organization", organizationId: "org-1" })
        ).toBe("/organizations/org-1/soundboard/clips");
    });

    it("lists the admin's library through the default clips", () => {
        expect(buildListPath({ kind: "admin", organizationId: "" })).toBe(
            "/soundboard/default-clips"
        );
    });

    it("does not need an organization for the admin's", () => {
        expect(buildListPath({ kind: "admin", organizationId: "org-1" })).toBe(
            buildListPath({ kind: "admin", organizationId: "" })
        );
    });
});

describe("buildClipsPath", () => {
    it("manages the organization's clips under the organization", () => {
        expect(buildClipsPath(ORG, "org-1")).toBe(
            "/organizations/org-1/soundboard/clips"
        );
    });

    it("manages the default clips on their own route, whatever the organization", () => {
        expect(buildClipsPath(DEFAULT, "org-1")).toBe(
            "/soundboard/default-clips"
        );
        expect(buildClipsPath(DEFAULT, "")).toBe("/soundboard/default-clips");
    });
});
