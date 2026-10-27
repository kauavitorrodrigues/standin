import { Controller, useForm } from "react-hook-form";
import { MAX_DIRECT_CONVERSATION_MEMBERS } from "@standin/contracts";
import type { UserSummary } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationsQueries } from "@/features/organizations/queries";
import { Content } from "@/features/chat/components/views/members/Content";
import { getNewConversationSubmitLabel } from "@/features/chat/utils/getNewConversationSubmitLabel";

type Props = {
    isPending: boolean;
    onSubmit: (recipientUserIds: string[]) => void;
};

type NewConversationValues = { recipientUserIds: string[] };

// Picking nobody is the conversation with yourself, picking one is a 1:1 and
// picking more is a group. The creator counts toward the cap.
export const NewConversationPicker = ({ isPending, onSubmit }: Props) => {
    const { user } = useAuth();
    const { members, isLoading, isError } = OrganizationsQueries.useMembers();
    const form = useForm<NewConversationValues>({
        defaultValues: { recipientUserIds: [] },
    });

    return (
        <form
            className="flex min-h-0 flex-1 flex-col gap-2"
            onSubmit={form.handleSubmit(({ recipientUserIds }) =>
                onSubmit(recipientUserIds)
            )}
        >
            <Controller
                control={form.control}
                name="recipientUserIds"
                render={({ field }) => (
                    <>
                        <Content
                            members={members.filter(
                                (member) => member.id !== user.id
                            )}
                            isLoading={isLoading}
                            isError={isError}
                            selectedIds={field.value}
                            onToggle={(member: UserSummary) =>
                                field.onChange(
                                    toggleRecipient(field.value, member.id)
                                )
                            }
                        />
                        <Button type="submit" disabled={isPending}>
                            {getNewConversationSubmitLabel(field.value.length)}
                        </Button>
                    </>
                )}
            />
        </form>
    );
};

const toggleRecipient = (selectedIds: string[], memberId: string): string[] => {
    if (selectedIds.includes(memberId)) {
        return selectedIds.filter((id) => id !== memberId);
    }

    // The cap counts the creator, who is not in the list.
    if (selectedIds.length >= MAX_DIRECT_CONVERSATION_MEMBERS - 1) {
        return selectedIds;
    }

    return [...selectedIds, memberId];
};
