// @vitest-environment jsdom
import { act, createElement } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEMPLATES_QUERY_KEY } from "../../queries/useAll";
import { TEMPLATE_DETAILS_QUERY_KEY } from "../../queries/useDetails";
import { TemplateMutations } from "../index";

const put = vi.hoisted(() => vi.fn());

vi.mock("@/lib/axios/api", () => ({ api: { put } }));

const result = { template: { id: "t1" }, warnings: [] };

describe("TemplateMutations.setThumbnail", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        put.mockReset();
        put.mockResolvedValue({ data: result });
    });
    afterEach(() => vi.unstubAllGlobals());

    const run = async () => {
        const queryClient = new QueryClient();
        const invalidate = vi
            .spyOn(queryClient, "invalidateQueries")
            .mockResolvedValue(undefined);
        let mutateAsync!: ReturnType<
            typeof TemplateMutations.setThumbnail
        >["mutateAsync"];

        const Probe = () => {
            mutateAsync = TemplateMutations.setThumbnail().mutateAsync;
            return null;
        };
        const wrapper = (children: ReactNode) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                children
            );

        const root = createRoot(document.createElement("div"));
        act(() => root.render(wrapper(createElement(Probe))));

        const png = new Blob(["png"], { type: "image/png" });
        let response: unknown;
        await act(async () => {
            response = await mutateAsync({ templateId: "t1", thumbnail: png });
        });
        act(() => root.unmount());
        return { response, invalidate };
    };

    it("puts the PNG in the thumbnail field and returns the template", async () => {
        const { response } = await run();

        expect(response).toEqual(result);
        const [url, body] = put.mock.calls[0];
        expect(url).toBe("/templates/t1/thumbnail");
        const file = (body as FormData).get("thumbnail") as File;
        expect(file).toBeInstanceOf(File);
        expect(file.type).toBe("image/png");
        expect(file.name).toBe("thumbnail.png");
    });

    it("invalidates the list and the detail on success", async () => {
        const { invalidate } = await run();

        expect(invalidate).toHaveBeenCalledWith({
            queryKey: [TEMPLATES_QUERY_KEY],
        });
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: [TEMPLATE_DETAILS_QUERY_KEY],
        });
    });
});
