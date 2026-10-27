import { act, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/lib/axios/api", () => ({ api: { get: getMock } }));
vi.mock("@/features/organizations/hooks/useOrganization", () => ({
    useOrganization: () => ({ organization: { id: "org" } }),
}));

import { useSearchConversations } from "../useSearchConversations";

type Result = ReturnType<typeof useSearchConversations>;
let latest: Result;

const Probe = ({ search }: { search: string }) => {
    const value = useSearchConversations(search);
    useEffect(() => {
        latest = value;
    });
    return null;
};

const render = async (search: string) => {
    const root = createRoot(document.createElement("div"));
    await act(async () => {
        root.render(
            createElement(
                QueryClientProvider,
                { client: new QueryClient() },
                createElement(Probe, { search })
            )
        );
    });
};

describe("useSearchConversations", () => {
    beforeEach(() => getMock.mockReset());

    it("sends the search as a query param of the list endpoint", async () => {
        getMock.mockResolvedValue({
            data: { conversations: [{ id: "c1" }], hasMore: false },
        });

        await render("ana");

        expect(getMock).toHaveBeenCalledWith("/organizations/org/conversations", {
            params: { search: "ana" },
        });
        expect(latest.conversations).toEqual([{ id: "c1" }]);
    });

    it("stays idle without text", async () => {
        await render("");

        expect(getMock).not.toHaveBeenCalled();
        expect(latest.conversations).toEqual([]);
    });
});
