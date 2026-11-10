import { describe, expect, it } from "vitest";
import type { SettingsSpace } from "../../types";
import { isSectionOffered } from "../isSectionOffered";

const space = (overrides: Partial<SettingsSpace>): SettingsSpace => ({
    organizationId: "org-1",
    spaceId: "space-1",
    canInvite: false,
    canManage: false,
    canInviteGuests: false,
    onInvite: () => {},
    ...overrides,
});

describe("isSectionOffered", () => {
    it("always offers the preferences", () => {
        expect(isSectionOffered("general", undefined)).toBe(true);
    });

    it("offers no section of the space outside one", () => {
        expect(isSectionOffered("security", undefined)).toBe(false);
        expect(isSectionOffered("guests", undefined)).toBe(false);
    });

    it("offers the integrations inside a space only", () => {
        expect(isSectionOffered("integrations", undefined)).toBe(false);
        expect(isSectionOffered("integrations", space({}))).toBe(true);
    });

    it("keeps the settings of the space from who cannot manage it", () => {
        const member = space({});

        expect(isSectionOffered("apps", member)).toBe(false);
        expect(isSectionOffered("conversations", member)).toBe(false);
        expect(isSectionOffered("security", member)).toBe(false);
        expect(isSectionOffered("guests", member)).toBe(true);
    });

    it("offers every section to the owner", () => {
        const owner = space({ canInvite: true, canManage: true });

        expect(isSectionOffered("members", owner)).toBe(true);
        expect(isSectionOffered("conversations", owner)).toBe(true);
        expect(isSectionOffered("security", owner)).toBe(true);
        expect(isSectionOffered("apps", owner)).toBe(true);
    });
});
