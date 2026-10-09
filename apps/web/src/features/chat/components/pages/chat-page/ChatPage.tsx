import { useEffect, type ReactNode } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { ChatQueries } from "@/features/chat/queries";
import { ConversationsSidebar } from "@/features/chat/components/pages/chat-page/sidebar";
import { Main } from "@/features/chat/components/pages/chat-page/main";
import {
    CHAT_PAGE_MODES,
    type ChatPageMode,
} from "@/features/chat/consts/chatPage";
import { useSelectedConversation } from "@/features/chat/hooks/useSelectedConversation";
import type { SelectConversation } from "@/features/chat/types/chatPage";
import { acquireGameInputLock } from "@/features/game/utils/inputLock";

type Props = {
    space: SpaceDetails;
    visible: boolean;
    // From the URL. Missing means the space conversation.
    conversationId: string | undefined;
    mode: ChatPageMode;
    onSelectConversation: SelectConversation;
    onModeChange: (mode: ChatPageMode) => void;
    // Pinned to the bottom of the conversation list.
    footer: ReactNode;
};

// Covers the whole office while open. The game keeps running underneath, so
// the character must not walk around behind it.
export const ChatPage = ({ space, visible, ...props }: Props) => {
    if (!visible) return null;
    return <ChatPageContent space={space} {...props} />;
};

type ContentProps = Omit<Props, "space" | "visible"> & {
    space: SpaceDetails;
};

const ChatPageContent = ({
    space,
    conversationId,
    mode,
    onSelectConversation,
    onModeChange,
    footer,
}: ContentProps) => {
    const refreshMessages = ChatQueries.useRefresh();
    const conversation = useSelectedConversation(space, conversationId);

    useEffect(() => acquireGameInputLock(), []);

    return (
        <div className="absolute inset-y-0 right-0 left-(--rail-width) z-20 flex gap-2 bg-background p-1.5">
            <ConversationsSidebar
                space={space}
                selectedConversationId={conversation.id}
                onSelectConversation={onSelectConversation}
                onRefresh={refreshMessages}
                onNewConversation={() =>
                    onModeChange(CHAT_PAGE_MODES.NEW_CONVERSATION)
                }
                footer={footer}
            />
            <Main
                space={space}
                mode={mode}
                conversation={conversation}
                onModeChange={onModeChange}
                onSelectConversation={onSelectConversation}
            />
        </div>
    );
};
