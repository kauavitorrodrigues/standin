import type { SpaceDetails } from "@standin/contracts";
import { NewConversationPanel } from "@/features/chat/components/pages/chat-page/main/NewConversationPanel";
import { ParticipantsPanel } from "@/features/chat/components/pages/chat-page/main/ParticipantsPanel";
import { ThreadPanel } from "@/features/chat/components/pages/chat-page/main/ThreadPanel";
import {
    CHAT_PAGE_MODES,
    type ChatPageMode,
} from "@/features/chat/consts/chatPage";
import type {
    SelectConversation,
    SelectedConversation,
} from "@/features/chat/types/chatPage";

type Props = {
    space: SpaceDetails;
    mode: ChatPageMode;
    conversation: SelectedConversation;
    onModeChange: (mode: ChatPageMode) => void;
    onSelectConversation: SelectConversation;
};

export const Main = ({
    space,
    mode,
    conversation,
    onModeChange,
    onSelectConversation,
}: Props) => {
    const backToThread = () => onModeChange(CHAT_PAGE_MODES.THREAD);

    const panels: Record<ChatPageMode, React.ReactNode> = {
        [CHAT_PAGE_MODES.THREAD]: (
            <ThreadPanel
                space={space}
                conversation={conversation}
                onOpenParticipants={() =>
                    onModeChange(CHAT_PAGE_MODES.PARTICIPANTS)
                }
            />
        ),
        [CHAT_PAGE_MODES.PARTICIPANTS]: (
            <ParticipantsPanel
                conversation={conversation}
                onBack={backToThread}
            />
        ),
        [CHAT_PAGE_MODES.NEW_CONVERSATION]: (
            <NewConversationPanel
                onSelectConversation={onSelectConversation}
                onBack={backToThread}
            />
        ),
    };

    return (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-card p-2 ring-1 ring-foreground/10">
            {panels[mode]}
        </main>
    );
};
