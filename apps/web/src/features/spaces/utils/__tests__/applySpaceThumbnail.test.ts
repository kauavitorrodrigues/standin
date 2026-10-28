import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import type { Space, SpaceDetails } from "@standin/contracts";
import { ORGANIZATION_SPACES_QUERY_KEY } from "../../queries/useByOrganization";
import { SPACE_DETAILS_QUERY_KEY } from "../../queries/useDetails";
import { applySpaceThumbnail } from "../applySpaceThumbnail";

vi.mock("@/lib/axios/api", () => ({ api: {} }));

const space = (id: string, thumbnailUrl: string | null): Space => ({
    id,
    name: id,
    organizationId: "org-1",
    mapId: `map-${id}`,
    guestAccess: "ALLOWED",
    thumbnailUrl,
    createdAt: "2026-10-28T10:00:00.000Z",
});

const details = (id: string): SpaceDetails =>
    ({
        id,
        conversationId: "c1",
        name: id,
        thumbnailUrl: null,
        map: { id: `map-${id}` },
    }) as SpaceDetails;

const listKey = [ORGANIZATION_SPACES_QUERY_KEY, "org-1"];
const detailsKey = (id: string) => [SPACE_DETAILS_QUERY_KEY, "org-1", id];

describe("applySpaceThumbnail", () => {
    const photo = "https://cdn/spaces/s1/thumbnail.png";

    it("puts the photo on the card of that space and leaves the others", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(listKey, [
            space("s1", null),
            space("s2", null),
        ]);

        applySpaceThumbnail(queryClient, "org-1", space("s1", photo));

        const list = queryClient.getQueryData<Space[]>(listKey)!;
        expect(list.map((s) => s.thumbnailUrl)).toEqual([photo, null]);
    });

    it("puts the photo on the detail of that space, keeping its map", () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(detailsKey("s1"), details("s1"));
        queryClient.setQueryData(detailsKey("s2"), details("s2"));
        const before = queryClient.getQueryData<SpaceDetails>(
            detailsKey("s1")
        )!;

        applySpaceThumbnail(queryClient, "org-1", space("s1", photo));

        const after = queryClient.getQueryData<SpaceDetails>(detailsKey("s1"))!;
        expect(after.thumbnailUrl).toBe(photo);
        expect(after.map).toBe(before.map);
        expect(
            queryClient.getQueryData<SpaceDetails>(detailsKey("s2"))!
                .thumbnailUrl
        ).toBeNull();
    });

    it("creates no cache entry for what was never loaded", () => {
        const queryClient = new QueryClient();

        applySpaceThumbnail(queryClient, "org-1", space("s1", photo));

        expect(queryClient.getQueryData(listKey)).toBeUndefined();
        expect(queryClient.getQueryData(detailsKey("s1"))).toBeUndefined();
    });

    it("does not touch the lists of other organizations", () => {
        const queryClient = new QueryClient();
        const other = [ORGANIZATION_SPACES_QUERY_KEY, "org-2"];
        queryClient.setQueryData(other, [space("s1", null)]);

        applySpaceThumbnail(queryClient, "org-1", space("s1", photo));

        expect(
            queryClient.getQueryData<Space[]>(other)![0].thumbnailUrl
        ).toBeNull();
    });
});
