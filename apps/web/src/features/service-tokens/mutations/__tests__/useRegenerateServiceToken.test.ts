import type { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios/api";
import { useRegenerateServiceToken } from "../useRegenerateServiceToken";

type CapturedOptions = {
    gcTime: number;
    mutationFn: (tokenId: string) => Promise<string>;
};

const captured = vi.hoisted(() => ({ options: null as unknown }));
const queryClient = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("@/lib/axios/api", () => ({ api: { post: vi.fn() } }));
// The hook is called outside React, so react-query only records the options.
vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => queryClient.current,
    useMutation: (options: unknown) => {
        captured.options = options;
        return {};
    },
}));

const SECRET = "sit_regenerated-secret";

describe("useRegenerateServiceToken", () => {
    beforeEach(async () => {
        const actual = await vi.importActual<
            typeof import("@tanstack/react-query")
        >("@tanstack/react-query");
        queryClient.current = new actual.QueryClient();
        vi.mocked(api.post).mockResolvedValue({
            data: { token: SECRET, serviceToken: { id: "t1" } },
        });
    });

    it("posts to the regenerate route and resolves with the secret alone", async () => {
        useRegenerateServiceToken();
        const options = captured.options as CapturedOptions;

        const token = await options.mutationFn("t1");

        expect(api.post).toHaveBeenCalledWith("/service-tokens/t1/regenerate");
        expect(token).toBe(SECRET);
        expect(options.gcTime).toBe(0);
        const client = queryClient.current as QueryClient;
        const cached = JSON.stringify(
            client
                .getQueryCache()
                .getAll()
                .map((query) => query.state.data)
        );
        expect(cached).not.toContain(SECRET);
    });
});
