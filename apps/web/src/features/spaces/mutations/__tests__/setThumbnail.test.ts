// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ORGANIZATION_SPACES_QUERY_KEY } from "../../queries/useByOrganization";
import { SpaceMutations } from "../index";

const put = vi.hoisted(() => vi.fn());

vi.mock("@/lib/axios/api", () => ({ api: { put } }));
vi.mock("@/features/organizations/hooks/useOrganizationId", () => ({
    useOrganizationId: () => "org-1",
}));

const space = { id: "s1", thumbnailUrl: "https://cdn/photo.png" };

describe("SpaceMutations.setThumbnail", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        put.mockReset();
        put.mockResolvedValue({ data: { space } });
    });
    afterEach(() => vi.unstubAllGlobals());

    const run = async () => {
        const queryClient = new QueryClient();
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        queryClient.setQueryData(
            [ORGANIZATION_SPACES_QUERY_KEY, "org-1"],
            [{ id: "s1", thumbnailUrl: null }]
        );
        let mutateAsync!: ReturnType<
            typeof SpaceMutations.setThumbnail
        >["mutateAsync"];

        const Probe = () => {
            mutateAsync = SpaceMutations.setThumbnail().mutateAsync;
            return null;
        };

        const root = createRoot(document.createElement("div"));
        act(() =>
            root.render(
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    createElement(Probe)
                )
            )
        );

        const png = new Blob(["png"], { type: "image/png" });
        let response: unknown;
        let failure: unknown;
        await act(async () => {
            try {
                response = await mutateAsync({ spaceId: "s1", thumbnail: png });
            } catch (error) {
                failure = error;
            }
        });
        act(() => root.unmount());
        return { response, failure, invalidate, queryClient };
    };

    it("puts the PNG in the thumbnail field of the space of the organization", async () => {
        await run();

        const [url, body, config] = put.mock.calls[0];
        expect(url).toBe("/organizations/org-1/spaces/s1/thumbnail");
        const file = (body as FormData).get("thumbnail") as File;
        expect(file).toBeInstanceOf(File);
        expect(file.type).toBe("image/png");
        expect(file.name).toBe("thumbnail.png");
        expect(config.headers["Content-Type"]).toBe("multipart/form-data");
    });

    it("returns the space with its new thumbnail", async () => {
        const { response } = await run();

        expect(response).toEqual(space);
    });

    it("puts the photo in the list from the answer, with no refetch", async () => {
        const { queryClient, invalidate } = await run();

        expect(
            queryClient.getQueryData<{ thumbnailUrl: string | null }[]>([
                ORGANIZATION_SPACES_QUERY_KEY,
                "org-1",
            ])![0].thumbnailUrl
        ).toBe(space.thumbnailUrl);
        expect(invalidate).not.toHaveBeenCalled();
    });

    it("leaves the queries alone when the upload fails", async () => {
        put.mockRejectedValue(new Error("boom"));

        const { failure, queryClient } = await run();

        expect(failure).toBeInstanceOf(Error);
        expect(
            queryClient.getQueryData<{ thumbnailUrl: string | null }[]>([
                ORGANIZATION_SPACES_QUERY_KEY,
                "org-1",
            ])![0].thumbnailUrl
        ).toBeNull();
    });
});
