import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios/api";
import { useDeleteServiceToken } from "../useDeleteServiceToken";
import { useRevokeServiceToken } from "../useRevokeServiceToken";

type CapturedOptions = { mutationFn: (tokenId: string) => Promise<void> };

const captured = vi.hoisted(() => ({ options: null as unknown }));

vi.mock("@/lib/axios/api", () => ({
    api: { post: vi.fn(), delete: vi.fn() },
}));
vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({}),
    useMutation: (options: unknown) => {
        captured.options = options;
        return {};
    },
}));

describe("revoke and delete mutations", () => {
    beforeEach(() => vi.clearAllMocks());

    it("revokes with a POST to the revoke route", async () => {
        useRevokeServiceToken();
        await (captured.options as CapturedOptions).mutationFn("t1");

        expect(api.post).toHaveBeenCalledWith("/service-tokens/t1/revoke");
        expect(api.delete).not.toHaveBeenCalled();
    });

    it("deletes with a DELETE on the token", async () => {
        useDeleteServiceToken();
        await (captured.options as CapturedOptions).mutationFn("t1");

        expect(api.delete).toHaveBeenCalledWith("/service-tokens/t1");
        expect(api.post).not.toHaveBeenCalled();
    });
});
