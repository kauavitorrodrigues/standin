import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import {
    buildClipsQueryKey,
    buildLibraryCacheKey,
} from "../buildClipsQueryKey";
import type { ClipListSource } from "../../types/library";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

const org = (organizationId: string): ClipListSource => ({
    kind: "organization",
    organizationId,
});
const admin: ClipListSource = { kind: "admin", organizationId: "" };

describe("buildLibraryCacheKey", () => {
    it("is the organization for an organization's library", () => {
        expect(buildLibraryCacheKey(org("org-1"))).toBe("org-1");
    });

    it("is the global one for the admin's, whatever organization is selected", () => {
        expect(buildLibraryCacheKey(admin)).toBe("global");
        expect(
            buildLibraryCacheKey({ kind: "admin", organizationId: "org-1" })
        ).toBe("global");
    });
});

describe("buildClipsQueryKey", () => {
    it("has the library, the scope and the search", () => {
        expect(
            buildClipsQueryKey(org("org-1"), { scope: ORG, search: "a" })
        ).toEqual(["soundboardClips", "org-1", ORG, "a"]);
    });

    it("keeps the default clips of the admin apart from the ones an organization lists", () => {
        const asAdmin = buildClipsQueryKey(admin, {
            scope: DEFAULT,
            search: "",
        });
        const asOrganization = buildClipsQueryKey(org("org-1"), {
            scope: DEFAULT,
            search: "",
        });

        expect(asAdmin).not.toEqual(asOrganization);
    });

    it("keeps one organization apart from another", () => {
        expect(
            buildClipsQueryKey(org("org-1"), { scope: ORG, search: "" })
        ).not.toEqual(
            buildClipsQueryKey(org("org-2"), { scope: ORG, search: "" })
        );
    });

    it("keeps the scopes and the searches apart", () => {
        const base = buildClipsQueryKey(org("o"), { scope: ORG, search: "" });

        expect(base).not.toEqual(
            buildClipsQueryKey(org("o"), { scope: DEFAULT, search: "" })
        );
        expect(base).not.toEqual(
            buildClipsQueryKey(org("o"), { scope: ORG, search: "x" })
        );
    });
});
