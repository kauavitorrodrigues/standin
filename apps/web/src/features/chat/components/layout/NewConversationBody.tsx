import type { UserSummary } from "@standin/contracts";
import { NewConversationPicker } from "@/features/chat/components/instances/NewConversationPicker";
import { ChatMutations } from "@/features/chat/mutations";
import type { SidebarBodyProps } from "@/features/chat/components/layout/SidebarBodyProps";

export const NewConversationBody = ({
    onSelectConversation,
}: SidebarBodyProps) => {
    const { mutate: createDirectConversation, isPending } =
        ChatMutations.createDirectConversation();

    const handleSelect = (member: UserSummary) => {
        // Guards against a second click firing another POST while the
        // first is still in flight (find-or-create is idempotent server
        // side, but there's no reason to send it twice).
        if (isPending) return;

        createDirectConversation(member.id, {
            onSuccess: (conversation) =>
                onSelectConversation(conversation.id, member.name, {
                    id: member.id,
                    avatarUrl: member.avatarUrl,
                }),
        });
    };

    return <NewConversationPicker onSelect={handleSelect} />;
};
