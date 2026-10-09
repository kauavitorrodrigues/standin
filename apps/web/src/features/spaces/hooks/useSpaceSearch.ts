import { useCallback } from "react";
import { Route } from "@/routes/_app/spaces/$spaceId";
import {
    CHAT_PAGE_MODES,
    type ChatPageMode,
} from "@/features/chat/consts/chatPage";
import { SPACE_VIEWS, type SpaceView } from "@/features/spaces/consts/view";

// The view, the open conversation and the chat mode live in the URL, so a
// reload or a shared link lands on the same screen. Defaults are dropped from
// the URL to keep it short.
export const useSpaceSearch = () => {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const selectView = useCallback(
        (next: SpaceView) =>
            navigate({
                // Lets the control bar travel between the space and the chat.
                viewTransition: true,
                search: (prev) => ({
                    ...prev,
                    view: next === SPACE_VIEWS.SPACE ? undefined : next,
                    // Leaving the chat forgets what was open in it.
                    ...(next === SPACE_VIEWS.SPACE && {
                        conversation: undefined,
                        chatMode: undefined,
                    }),
                }),
            }),
        [navigate]
    );

    const selectConversation = useCallback(
        (conversationId: string) =>
            navigate({
                search: (prev) => ({
                    ...prev,
                    view: SPACE_VIEWS.CHAT,
                    conversation: conversationId,
                    chatMode: undefined,
                }),
            }),
        [navigate]
    );

    const selectChatMode = useCallback(
        (next: ChatPageMode) =>
            navigate({
                search: (prev) => ({
                    ...prev,
                    chatMode:
                        next === CHAT_PAGE_MODES.THREAD ? undefined : next,
                }),
            }),
        [navigate]
    );

    const getConversationLink = useCallback((conversationId: string) => {
        const url = new URL(window.location.href);
        url.search = new URLSearchParams({
            view: SPACE_VIEWS.CHAT,
            conversation: conversationId,
        }).toString();
        return url.toString();
    }, []);

    return {
        getConversationLink,
        view: search.view ?? SPACE_VIEWS.SPACE,
        conversationId: search.conversation,
        chatMode: search.chatMode ?? CHAT_PAGE_MODES.THREAD,
        selectView,
        selectConversation,
        selectChatMode,
    };
};
