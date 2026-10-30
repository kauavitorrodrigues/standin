import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClipScope } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import {
    ADMIN_PAGE_LIBRARY,
    ORGANIZATION_LIBRARY,
    ORGANIZATION_PAGE_LIBRARY,
} from "../../consts/library";
import type { SoundboardLibrary } from "../../types/library";

type Mocks = { library: SoundboardLibrary; useClips: ReturnType<typeof vi.fn> };

const mocks = vi.hoisted((): Mocks => ({
    // Overwritten by each test before anything reads it.
    library: {
        kind: "organization",
        scopes: [],
        uploadScope: "ORGANIZATION",
        showGroupHeaders: true,
    },
    useClips: vi.fn(),
}));

vi.mock("../useSoundboardLibrary", () => ({
    useSoundboardLibrary: () => mocks.library,
}));
vi.mock("@/features/organizations/hooks/useOrganization", () => ({
    useOrganization: () => ({ organization: { name: "Acme" } }),
}));
vi.mock("../../queries", () => ({
    SoundboardQueries: { useClips: mocks.useClips },
}));

import { useClipGroups } from "../useClipGroups";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

const answer = () => ({
    clips: [],
    isPending: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
});

const enabledFor = (scope: SoundboardClipScope) =>
    mocks.useClips.mock.calls
        .map((call) => call.at(0))
        .find((filters) => filters?.scope === scope)?.enabled;

describe("useClipGroups", () => {
    beforeEach(() => {
        mocks.useClips.mockReset();
        mocks.useClips.mockImplementation(answer);
    });

    afterEach(() => unmountAllHooks());

    it("has the organization group first, named after it, then the default one", () => {
        mocks.library = ORGANIZATION_LIBRARY;
        const { result } = renderHook(() => useClipGroups(""));

        expect(result.current.map((group) => group.scope)).toEqual([
            ORG,
            DEFAULT,
        ]);
        expect(result.current.map((group) => group.label)).toEqual([
            "Acme",
            "Sons padrão",
        ]);
    });

    it("has only the default group in the admin's library", () => {
        mocks.library = ADMIN_PAGE_LIBRARY;
        const { result } = renderHook(() => useClipGroups(""));

        expect(result.current.map((group) => group.scope)).toEqual([DEFAULT]);
        expect(result.current.at(0)?.label).toBe("Sons padrão");
    });

    it("fetches both groups for an organization", () => {
        mocks.library = ORGANIZATION_LIBRARY;
        renderHook(() => useClipGroups(""));

        expect(enabledFor(ORG)).toBe(true);
        expect(enabledFor(DEFAULT)).toBe(true);
    });

    it("does not fetch the organization group for the admin", () => {
        mocks.library = ADMIN_PAGE_LIBRARY;
        renderHook(() => useClipGroups(""));

        expect(enabledFor(ORG)).toBe(false);
        expect(enabledFor(DEFAULT)).toBe(true);
    });

    it("has only the organization group on the page of the organization", () => {
        mocks.library = ORGANIZATION_PAGE_LIBRARY;
        const { result } = renderHook(() => useClipGroups(""));

        expect(result.current.map((group) => group.scope)).toEqual([ORG]);
        expect(result.current.at(0)?.label).toBe("Acme");
    });

    it("does not fetch the default clips on the page of the organization", () => {
        mocks.library = ORGANIZATION_PAGE_LIBRARY;
        renderHook(() => useClipGroups(""));

        expect(enabledFor(ORG)).toBe(true);
        expect(enabledFor(DEFAULT)).toBe(false);
    });

    it("passes the search to the groups", () => {
        mocks.library = ADMIN_PAGE_LIBRARY;
        renderHook(() => useClipGroups("buzina"));

        expect(
            mocks.useClips.mock.calls.every(
                (call) => call.at(0)?.search === "buzina"
            )
        ).toBe(true);
    });
});
