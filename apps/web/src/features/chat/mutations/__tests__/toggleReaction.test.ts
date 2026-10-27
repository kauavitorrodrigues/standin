import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const post = vi.fn();
const del = vi.fn();
vi.mock("@/lib/axios/api", () => ({
    api: {
        post: (...args: unknown[]) => post(...args),
        delete: (...args: unknown[]) => del(...args),
    },
}));
vi.mock("@/features/organizations/hooks/useOrganization", () => ({
    useOrganization: () => ({ organization: { id: "org" } }),
}));

import { messagesQueryKey } from "@/features/chat/queries";
import { useToggleReaction } from "../toggleReaction";
import { useDeleteMessage } from "../delete";

const input = {
    conversationId: "c",
    messageId: "m",
    emoji: "x",
    reactedByMe: false,
};

const mountHook = <T>(useHook: () => T) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const current: { value: T } = { value: undefined as T };
    const Probe = () => {
        current.value = useHook();
        return null;
    };
    const client = new QueryClient();
    client.setQueryData(messagesQueryKey("c"), {
        pages: [{ messages: [] }],
        pageParams: [],
    });
    const wrap = (node: ReactNode) =>
        createElement(QueryClientProvider, { client }, node);
    const root = createRoot(document.createElement("div"));
    act(() => root.render(wrap(createElement(Probe))));
    return current;
};

describe("chat mutations", () => {
    beforeEach(() => {
        post.mockReset();
        del.mockReset();
    });

    it("sends one request on a fast double click", async () => {
        let resolve!: () => void;
        post.mockReturnValue(new Promise<void>((r) => (resolve = r)));
        const hook = mountHook(() => useToggleReaction());

        await act(async () => {
            hook.value.mutate(input);
            hook.value.mutate(input);
        });
        await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));

        await act(async () => resolve());
        await act(async () => hook.value.mutate(input));
        await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    });

    it("sends the delete request with a 10000 ms timeout", async () => {
        del.mockResolvedValue({});
        const hook = mountHook(() => useDeleteMessage());

        await act(async () => {
            hook.value.mutate({ conversationId: "c", messageId: "m" });
        });
        await vi.waitFor(() => expect(del).toHaveBeenCalled());
        expect(del.mock.calls[0][1]).toEqual({ timeout: 10000 });
    });
});
