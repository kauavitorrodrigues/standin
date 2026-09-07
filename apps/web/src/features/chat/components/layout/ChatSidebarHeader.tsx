import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import type { ThreadParticipant } from "@/features/chat/components/layout/SidebarBodyProps";
import { HEADER_ACTIONS_BY_VIEW } from "@/features/chat/consts/headerActionsByView";
import {
    CHAT_SIDEBAR_VIEWS,
    type ChatSidebarView,
} from "@/features/chat/consts/sidebarView";

type Context = {
    view: ChatSidebarView;
    threadTitle: string;
    // Only set (non-null) when the open thread is a DM, so the header
    // shows the other participant's avatar only for that case.
    threadAvatar: ThreadParticipant | null;
    participantsCount: number;
    onBackToList: () => void;
    onBackToThread: () => void;
    onOpenParticipants: () => void;
    onOpenNewConversation: () => void;
    onRefresh: () => void;
    onClose: () => void;
};

type HeaderContent = {
    title: string;
    onBack?: () => void;
    avatar?: ThreadParticipant | null;
};

const HEADER_CONTENT_BY_VIEW: Record<
    ChatSidebarView,
    (context: Context) => HeaderContent
> = {
    [CHAT_SIDEBAR_VIEWS.LIST]: () => ({ title: "Chat" }),
    [CHAT_SIDEBAR_VIEWS.THREAD]: (context) => ({
        title: context.threadTitle,
        onBack: context.onBackToList,
        avatar: context.threadAvatar,
    }),
    [CHAT_SIDEBAR_VIEWS.PARTICIPANTS]: (context) => ({
        title: `Participantes (${context.participantsCount})`,
        onBack: context.onBackToThread,
    }),
    [CHAT_SIDEBAR_VIEWS.NEW_CONVERSATION]: (context) => ({
        title: "Nova conversa",
        onBack: context.onBackToList,
    }),
};

export const ChatSidebarHeader = (context: Context) => {
    const { title, onBack, avatar } = HEADER_CONTENT_BY_VIEW[context.view](
        context
    );
    const Actions = HEADER_ACTIONS_BY_VIEW[context.view];
    return (
        <HeaderShell title={title} onBack={onBack} avatar={avatar}>
            <Actions
                participantsCount={context.participantsCount}
                onRefresh={context.onRefresh}
                onClose={context.onClose}
                onOpenParticipants={context.onOpenParticipants}
                onOpenNewConversation={context.onOpenNewConversation}
            />
        </HeaderShell>
    );
};
