import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { AVATAR_SLOTS } from "@standin/contracts";
import { RANDOM_MAX_PAGES } from "../../consts/editor/random";

const get = vi.hoisted(() => vi.fn());
vi.mock("@/lib/axios/api", () => ({ api: { get } }));
vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://api.test" }));

import { loadAllCategoryParts } from "../loadAllCategoryParts";
import { categoryPartsInfiniteOptions } from "../useCategoryParts";

const page = (id: string, nextCursor: string | null) => ({
    items: [{ id, name: id, previewUrl: `/files/${id}`, variations: [] }],
    nextCursor,
});

// Serves pages "p1", "p2", ... until `total`, each pointing at the next.
const servePages = (total: number) =>
    get.mockImplementation(
        async (_path: string, config: { params: { cursor?: string } }) => {
            const index = Number(config.params.cursor ?? "0") + 1;
            const next = index < total ? String(index) : null;
            return { data: page(`p${index}`, next) };
        }
    );

describe("loadAllCategoryParts", () => {
    beforeEach(() => {
        get.mockReset();
    });

    it("follows the cursor to the last page", async () => {
        servePages(3);
        const items = await loadAllCategoryParts(
            new QueryClient(),
            AVATAR_SLOTS.HAIR
        );
        expect(items.map((entry) => entry.id)).toEqual(["p1", "p2", "p3"]);
        expect(get).toHaveBeenCalledTimes(3);
    });

    it("reads a list that was walked to its end from the cache", async () => {
        servePages(2);
        const client = new QueryClient();
        await loadAllCategoryParts(client, AVATAR_SLOTS.HAIR);
        get.mockClear();

        const items = await loadAllCategoryParts(client, AVATAR_SLOTS.HAIR);

        expect(items).toHaveLength(2);
        expect(get).not.toHaveBeenCalled();
    });

    it("stops at the page limit", async () => {
        servePages(RANDOM_MAX_PAGES + 10);
        const items = await loadAllCategoryParts(
            new QueryClient(),
            AVATAR_SLOTS.HAIR
        );
        expect(items).toHaveLength(RANDOM_MAX_PAGES);
    });

    it("ignores the app stale time when the cache holds only page 1", async () => {
        servePages(3);
        const client = new QueryClient({
            defaultOptions: { queries: { staleTime: 300000 } },
        });
        await client.fetchInfiniteQuery({
            ...categoryPartsInfiniteOptions(AVATAR_SLOTS.HAIR),
            pages: 1,
        });

        const items = await loadAllCategoryParts(client, AVATAR_SLOTS.HAIR);

        expect(items).toHaveLength(3);
    });

    it("gets every page when the list is already being fetched", async () => {
        servePages(3);
        const client = new QueryClient({
            defaultOptions: { queries: { staleTime: 300000 } },
        });
        // Page 1 in flight, as when the editor opens.
        const inFlight = client.fetchInfiniteQuery({
            ...categoryPartsInfiniteOptions(AVATAR_SLOTS.HAIR),
            pages: 1,
        });

        const items = await loadAllCategoryParts(client, AVATAR_SLOTS.HAIR);
        await inFlight;

        expect(items).toHaveLength(3);
    });
});
