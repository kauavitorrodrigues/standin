import { useState } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { useSidebar } from "@/components/ui/sidebar";
import { ChatQueries } from "@/features/chat/queries";
import { ChatSidebarHeader } from "@/features/chat/components/layout/ChatSidebarHeader";
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
    const { participants } = ChatQueries.useParticipants(conversationId ?? "");

    const openThread = (id: string) => {
        setConversationId(id);
        setView(CHAT_SIDEBAR_VIEWS.THREAD);
    };

    const Body = BODY_BY_VIEW[view];

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <ChatSidebarHeader
                view={view}
                spaceName={space.name}
                participantsCount={participants.length}
                onBackToList={() => setView(CHAT_SIDEBAR_VIEWS.LIST)}
                onBackToThread={() => setView(CHAT_SIDEBAR_VIEWS.THREAD)}
                onOpenParticipants={() =>
                    setView(CHAT_SIDEBAR_VIEWS.PARTICIPANTS)
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
