import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import { HEADER_ACTIONS_BY_VIEW } from "@/features/chat/consts/headerActionsByView";
import {
    CHAT_SIDEBAR_VIEWS,
    type ChatSidebarView,
} from "@/features/chat/consts/sidebarView";

type Context = {
    view: ChatSidebarView;
    spaceName: string;
    participantsCount: number;
    onBackToList: () => void;
    onBackToThread: () => void;
    onOpenParticipants: () => void;
    onRefresh: () => void;
    onClose: () => void;
};

type HeaderContent = { title: string; onBack?: () => void };

const HEADER_CONTENT_BY_VIEW: Record<
    ChatSidebarView,
    (context: Context) => HeaderContent
> = {
    [CHAT_SIDEBAR_VIEWS.LIST]: () => ({ title: "Chat" }),
    [CHAT_SIDEBAR_VIEWS.THREAD]: (context) => ({
        title: context.spaceName,
        onBack: context.onBackToList,
    }),
    [CHAT_SIDEBAR_VIEWS.PARTICIPANTS]: (context) => ({
        title: `Participantes (${context.participantsCount})`,
        onBack: context.onBackToThread,
    }),
};

export const ChatSidebarHeader = (context: Context) => {
    const { title, onBack } = HEADER_CONTENT_BY_VIEW[context.view](context);
    const Actions = HEADER_ACTIONS_BY_VIEW[context.view];
    return (
        <HeaderShell title={title} onBack={onBack}>
            <Actions
                participantsCount={context.participantsCount}
                onRefresh={context.onRefresh}
                onClose={context.onClose}
                onOpenParticipants={context.onOpenParticipants}
            />
        </HeaderShell>
    );
};
