import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { emitMock, socketState } = vi.hoisted(() => ({
    emitMock: vi.fn(),
    socketState: { connected: true },
}));

vi.mock("@/features/realtime/socket", () => ({
    realtimeSocket: {
        emit: emitMock,
        get connected() {
            return socketState.connected;
        },
    },
}));

import { OrganizationContext } from "@/features/organizations/hooks/useOrganization";
import { useRealtimeTypingBroadcast } from "@/features/chat/hooks/useRealtimeTypingBroadcast";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

const Harness = () => {
    const broadcast = useRealtimeTypingBroadcast();
    broadcast("c1", true);
    return null;
};

const render = (organization: { id: string } | null) =>
    act(() =>
        root.render(
            createElement(
                OrganizationContext.Provider,
                {
                    value: {
                        organization: organization as never,
                        setOrganization: () => undefined,
                    },
                },
                createElement(Harness)
            )
        )
    );

describe("useRealtimeTypingBroadcast", () => {
    beforeEach(() => {
        emitMock.mockClear();
        socketState.connected = true;
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => act(() => root.unmount()));

    it("sends typing with the organization through the app connection", () => {
        render({ id: "org-1" });

        expect(emitMock).toHaveBeenCalledWith("chat:typing", {
            conversationId: "c1",
            isTyping: true,
            organizationId: "org-1",
        });
    });

    it("sends nothing without an organization", () => {
        render(null);

        expect(emitMock).not.toHaveBeenCalled();
    });

    it("sends nothing while the connection is down", () => {
        socketState.connected = false;
        render({ id: "org-1" });

        expect(emitMock).not.toHaveBeenCalled();
    });
});
