import type { ReactNode } from "react";
import type { SpaceDetails } from "@standin/contracts";
import { ChatPage } from "@/features/chat/components";
import type { PeerChatContextType } from "@/features/chat/contexts/PeerChatContext";
import {
    ChatPageContext,
    type ChatPageContextType,
} from "@/features/chat/contexts/ChatPageContext";
import { PeerChatContext } from "@/features/chat/contexts/PeerChatContext";
import type { PeerTypingContextType } from "@/features/chat/contexts/PeerTypingContext";
import { PeerTypingContext } from "@/features/chat/contexts/PeerTypingContext";
import { Rail } from "@/features/spaces/components/pages/space-page/sidebar/Rail";
import type { ChatPageMode } from "@/features/chat/consts/chatPage";
import type { SelectConversation } from "@/features/chat/types/chatPage";
import { SPACE_VIEWS, type SpaceView } from "@/features/spaces/consts/view";

type Props = {
    space: SpaceDetails;
    view: SpaceView;
    onSelectView: (view: SpaceView) => void;
    isPeopleOpen: boolean;
    onTogglePeople: () => void;
    conversationId: string | undefined;
    chatMode: ChatPageMode;
    onSelectConversation: SelectConversation;
    onChatModeChange: (mode: ChatPageMode) => void;
    peerChat: PeerChatContextType;
    peerTyping: PeerTypingContextType;
    chatPage: ChatPageContextType;
    // Rendered at the bottom of the chat conversation list.
    chatFooter: ReactNode;
};

// The whole left side of the space: the fixed rail and the views that cover
// the office. New rail items and views are added here, not in SpacePage.
export const SpaceSidebar = ({
    space,
    view,
    onSelectView,
    isPeopleOpen,
    onTogglePeople,
    conversationId,
    chatMode,
    onSelectConversation,
    onChatModeChange,
    peerChat,
    peerTyping,
    chatPage,
    chatFooter,
}: Props) => {
    return (
        <>
            <Rail
                view={view}
                onSelectView={onSelectView}
                isPeopleOpen={isPeopleOpen}
                onTogglePeople={onTogglePeople}
            />
            <PeerChatContext.Provider value={peerChat}>
                <PeerTypingContext.Provider value={peerTyping}>
                    <ChatPageContext.Provider value={chatPage}>
                        <ChatPage
                            space={space}
                            visible={view === SPACE_VIEWS.CHAT}
                            conversationId={conversationId}
                            mode={chatMode}
                            onSelectConversation={onSelectConversation}
                            onModeChange={onChatModeChange}
                            footer={chatFooter}
                        />
                    </ChatPageContext.Provider>
                </PeerTypingContext.Provider>
            </PeerChatContext.Provider>
        </>
    );
};
