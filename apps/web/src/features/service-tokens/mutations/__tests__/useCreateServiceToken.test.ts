import type { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios/api";
import type { CreateTokenPayload } from "../../types";
import { useCreateServiceToken } from "../useCreateServiceToken";

type CapturedOptions = {
    gcTime: number;
    mutationFn: (payload: CreateTokenPayload) => Promise<string>;
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

const SECRET = "sit_clear-secret";

describe("useCreateServiceToken", () => {
    beforeEach(async () => {
        const actual = await vi.importActual<
            typeof import("@tanstack/react-query")
        >("@tanstack/react-query");
        queryClient.current = new actual.QueryClient();
        vi.mocked(api.post).mockResolvedValue({
            data: { token: SECRET, serviceToken: { id: "t1" } },
        });
    });

    it("resolves with the clear token alone and keeps nothing in the cache", async () => {
        useCreateServiceToken();
        const options = captured.options as CapturedOptions;

        const token = await options.mutationFn({
            name: "importer",
            scopes: ["library:write"],
        });

        expect(token).toBe(SECRET);
        // Dropped from the mutation cache as soon as nobody observes it.
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
