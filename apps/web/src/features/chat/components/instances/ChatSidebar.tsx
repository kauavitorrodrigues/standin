import { useState } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { useSidebar } from "@/components/ui/sidebar";
import { ChatQueries } from "@/features/chat/queries";
import { ChatSidebarHeader } from "@/features/chat/components/layout/ChatSidebarHeader";
import type { ThreadParticipant } from "@/features/chat/components/layout/SidebarBodyProps";
import { BODY_BY_VIEW } from "@/features/chat/consts/bodyByView";
import {
    CHAT_SIDEBAR_VIEWS,
    type ChatSidebarView,
} from "@/features/chat/consts/sidebarView";

type Props = { space: SpaceDetails };

export const ChatSidebar = ({ space }: Props) => {
    const { setOpen } = useSidebar();
    const refreshMessages = ChatQueries.useRefresh();

    const [view, setView] = useState<ChatSidebarView>(CHAT_SIDEBAR_VIEWS.LIST);
    const [conversationId, setConversationId] = useState<string | null>(null);
    // Display name for the thread header: the space name, or the other DM
    // participant's name. Set explicitly by whoever opens the thread
    // instead of looked up from the conversations list, so it's correct
    // immediately for a DM that was just created (before that list refetches).
    const [threadTitle, setThreadTitle] = useState(space.name);
    // Only set for a DM thread (see ThreadParticipant), null for the space
    // conversation, so the header knows when to render an avatar.
    const [threadAvatar, setThreadAvatar] = useState<ThreadParticipant | null>(
        null
    );
    const { participants } = ChatQueries.useParticipants(conversationId ?? "");

    const openThread = (
        id: string,
        title: string,
        avatar: ThreadParticipant | null = null
    ) => {
        setConversationId(id);
        setThreadTitle(title);
        setThreadAvatar(avatar);
        setView(CHAT_SIDEBAR_VIEWS.THREAD);
    };

    const Body = BODY_BY_VIEW[view];

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <ChatSidebarHeader
                view={view}
                threadTitle={threadTitle}
                threadAvatar={threadAvatar}
                participantsCount={participants.length}
                onBackToList={() => setView(CHAT_SIDEBAR_VIEWS.LIST)}
                onBackToThread={() => setView(CHAT_SIDEBAR_VIEWS.THREAD)}
                onOpenParticipants={() =>
                    setView(CHAT_SIDEBAR_VIEWS.PARTICIPANTS)
                }
                onOpenNewConversation={() =>
                    setView(CHAT_SIDEBAR_VIEWS.NEW_CONVERSATION)
                }
                onRefresh={refreshMessages}
                onClose={() => setOpen(false)}
            />
            <Body
                space={space}
                conversationId={conversationId}
                onSelectConversation={openThread}
            />
        </div>
    );
};
