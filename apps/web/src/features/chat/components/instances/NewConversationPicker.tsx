import type { UserSummary } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationsQueries } from "@/features/organizations/queries";
import { Content } from "@/features/chat/components/views/members/Content";

type Props = { onSelect: (member: UserSummary) => void };

export const NewConversationPicker = ({ onSelect }: Props) => {
    const { user } = useAuth();
    const { members, isLoading, isError } = OrganizationsQueries.useMembers();

    return (
        <Content
            members={members.filter((member) => member.id !== user.id)}
            isLoading={isLoading}
            isError={isError}
            onSelect={onSelect}
        />
    );
};
