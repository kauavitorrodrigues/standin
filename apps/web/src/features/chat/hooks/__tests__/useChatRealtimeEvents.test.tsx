import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const { fake } = vi.hoisted(() => {
    type Handler = (...args: unknown[]) => void;
    const table = () => new Map<string, Set<Handler>>();
    const add = (map: Map<string, Set<Handler>>, event: string, fn: Handler) =>
        map.set(event, (map.get(event) ?? new Set()).add(fn));
    const remove = (
        map: Map<string, Set<Handler>>,
        event: string,
        fn: Handler
    ) => map.get(event)?.delete(fn);
    const socketHandlers = table();
    const managerHandlers = table();
    return {
        fake: {
            socketHandlers,
            managerHandlers,
            socket: {
                on: (event: string, fn: Handler) => add(socketHandlers, event, fn),
                off: (event: string, fn: Handler) =>
                    remove(socketHandlers, event, fn),
                io: {
                    on: (event: string, fn: Handler) =>
                        add(managerHandlers, event, fn),
                    off: (event: string, fn: Handler) =>
                        remove(managerHandlers, event, fn),
                },
            },
        },
    };
});

vi.mock("@/features/realtime/socket", () => ({ realtimeSocket: fake.socket }));
vi.mock("@/features/auth/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "me" } }),
}));
vi.mock("@/features/organizations/hooks/useOrganization", () => ({
    useOrganization: () => ({ organization: { id: "org" } }),
}));

import { useChatRealtimeEvents } from "../useChatRealtimeEvents";
import {
    conversationsQueryKey,
    conversationsSearchQueryKey,
    unreadCountsQueryKey,
} from "@/features/chat/queries/queryKey";

const Probe = () => {
    useChatRealtimeEvents();
    return null;
};

describe("useChatRealtimeEvents", () => {
    let queryClient: QueryClient;
    let unmount: () => void;

    beforeEach(async () => {
        fake.socketHandlers.clear();
        fake.managerHandlers.clear();
        queryClient = new QueryClient();
        const root = createRoot(document.createElement("div"));
        await act(async () => {
            root.render(
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    createElement(Probe)
                )
            );
        });
        unmount = () => act(() => root.unmount());
    });

    afterEach(() => vi.restoreAllMocks());

    it("fetches the unread counts and the conversations again after a reconnect", async () => {
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");

        const handlers = [...(fake.managerHandlers.get("reconnect") ?? [])];
        expect(handlers).toHaveLength(1);
        await act(async () => handlers[0]());

        const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
        expect(keys).toContainEqual(unreadCountsQueryKey("org"));
        expect(keys).toContainEqual(conversationsQueryKey("org"));
    });

    it("stops listening for the reconnect once unmounted", async () => {
        await unmount();
        expect(fake.managerHandlers.get("reconnect")?.size ?? 0).toBe(0);
    });

    it("applies the unread count of a new message without fetching the counts", async () => {
        queryClient.setQueryData(unreadCountsQueryKey("org"), {
            counts: { a: 1 },
            total: 1,
        });
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");

        const [handler] = [...(fake.socketHandlers.get("chat:message-created") ?? [])];
        await act(async () =>
            handler({
                conversationId: "b",
                message: { id: "m" },
                sender: { id: "other" },
                unreadCount: 4,
            })
        );

        expect(queryClient.getQueryData(unreadCountsQueryKey("org"))).toEqual({
            counts: { a: 1, b: 4 },
            total: 5,
        });
        const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
        expect(keys).not.toContainEqual(unreadCountsQueryKey("org"));
    });

    it("patches the conversation list with a new message instead of fetching it", async () => {
        queryClient.setQueryData(conversationsQueryKey("org"), {
            conversations: [{ id: "b", lastMessage: null, unreadCount: 0 }],
        });
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");

        const [handler] = [...(fake.socketHandlers.get("chat:message-created") ?? [])];
        await act(async () =>
            handler({
                conversationId: "b",
                message: { id: "m", content: "oi", senderId: "other", createdAt: "x" },
                sender: { id: "other" },
                unreadCount: 2,
            })
        );

        expect(
            queryClient.getQueryData<{ conversations: { unreadCount: number }[] }>(
                conversationsQueryKey("org")
            )?.conversations[0].unreadCount
        ).toBe(2);
        expect(invalidate).not.toHaveBeenCalled();
    });

    it("fetches the list only when the conversation is not in it yet", async () => {
        queryClient.setQueryData(conversationsQueryKey("org"), { conversations: [] });
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");

        const [handler] = [...(fake.socketHandlers.get("chat:message-created") ?? [])];
        await act(async () =>
            handler({
                conversationId: "new",
                message: { id: "m", content: "oi", senderId: "other", createdAt: "x" },
                sender: { id: "other" },
                unreadCount: 1,
            })
        );

        const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
        expect(keys).toContainEqual(conversationsQueryKey("org"));
    });

    it("patches a cached search result with a new message too", async () => {
        const searchKey = conversationsSearchQueryKey("org", "ana");
        queryClient.setQueryData(conversationsQueryKey("org"), {
            conversations: [{ id: "b", lastMessage: null, unreadCount: 0 }],
        });
        queryClient.setQueryData(searchKey, {
            conversations: [{ id: "b", lastMessage: null, unreadCount: 0 }],
        });

        const [handler] = [...(fake.socketHandlers.get("chat:message-created") ?? [])];
        await act(async () =>
            handler({
                conversationId: "b",
                message: { id: "m", content: "oi", senderId: "other", createdAt: "x" },
                sender: { id: "other" },
                unreadCount: 3,
            })
        );

        const found = queryClient.getQueryData<{
            conversations: { unreadCount: number; lastMessage: { id: string } }[];
        }>(searchKey);
        expect(found?.conversations[0].unreadCount).toBe(3);
        expect(found?.conversations[0].lastMessage.id).toBe("m");
    });
});
