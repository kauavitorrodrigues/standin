import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import {
    ADMIN_PAGE_LIBRARY,
    ORGANIZATION_LIBRARY,
    ORGANIZATION_PAGE_LIBRARY,
} from "../library";

describe("the libraries", () => {
    it("lists the organization's clips first and the default ones after", () => {
        expect(ORGANIZATION_LIBRARY.scopes).toEqual([
            SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
            SOUNDBOARD_CLIP_SCOPES.DEFAULT,
        ]);
    });

    it("uploads to the organization from the organization's library", () => {
        expect(ORGANIZATION_LIBRARY.uploadScope).toBe(
            SOUNDBOARD_CLIP_SCOPES.ORGANIZATION
        );
    });

    it("has group headers in the library of the panel and the dialog", () => {
        expect(ORGANIZATION_LIBRARY.showGroupHeaders).toBe(true);
    });

    it("lists only the organization's own clips on its page, with no group header", () => {
        expect(ORGANIZATION_PAGE_LIBRARY.scopes).toEqual([
            SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
        ]);
        expect(ORGANIZATION_PAGE_LIBRARY.uploadScope).toBe(
            SOUNDBOARD_CLIP_SCOPES.ORGANIZATION
        );
        expect(ORGANIZATION_PAGE_LIBRARY.showGroupHeaders).toBe(false);
    });

    it("lists only the default clips on the admin's page, with no group header, and uploads them", () => {
        expect(ADMIN_PAGE_LIBRARY.scopes).toEqual([
            SOUNDBOARD_CLIP_SCOPES.DEFAULT,
        ]);
        expect(ADMIN_PAGE_LIBRARY.uploadScope).toBe(
            SOUNDBOARD_CLIP_SCOPES.DEFAULT
        );
        expect(ADMIN_PAGE_LIBRARY.showGroupHeaders).toBe(false);
    });

    it("keeps the page of the organization on the organization's routes", () => {
        expect(ORGANIZATION_PAGE_LIBRARY.kind).toBe("organization");
    });

    it("tells the two apart by kind", () => {
        expect(ORGANIZATION_LIBRARY.kind).toBe("organization");
        expect(ADMIN_PAGE_LIBRARY.kind).toBe("admin");
    });
});
