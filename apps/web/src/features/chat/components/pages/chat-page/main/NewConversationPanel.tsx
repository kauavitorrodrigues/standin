import type { UserSummary } from "@standin/contracts";
import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import { NewConversationPicker } from "@/features/chat/components/instances/NewConversationPicker";
import { ChatMutations } from "@/features/chat/mutations";
import type { SelectConversation } from "@/features/chat/types/chatPage";

type Props = {
    onSelectConversation: SelectConversation;
    onBack: () => void;
};

export const NewConversationPanel = ({
    onSelectConversation,
    onBack,
}: Props) => {
    const { mutate: createDirectConversation, isPending } =
        ChatMutations.createDirectConversation();

    const handleSelect = (member: UserSummary) => {
        // Guards against a second click firing another POST while the
        // first is still in flight (find-or-create is idempotent server
        // side, but there's no reason to send it twice).
        if (isPending) return;

        createDirectConversation(member.id, {
            onSuccess: (conversation) => onSelectConversation(conversation.id),
        });
    };

    return (
        <>
            <HeaderShell title="Nova conversa" onBack={onBack} />
            <NewConversationPicker onSelect={handleSelect} />
        </>
    );
};
