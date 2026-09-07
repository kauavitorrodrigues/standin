import type { UserSummary } from "@standin/contracts";
import { MemberItem } from "@/features/chat/components/views/members/MemberItem";
import {
    MembersEmptyState,
    MembersErrorState,
    MembersLoadingState,
} from "@/features/chat/components/views/members/ContentStates";

type Props = {
    members: UserSummary[];
    isLoading: boolean;
    isError: boolean;
    onSelect: (member: UserSummary) => void;
};

export const Content = ({ members, isLoading, isError, onSelect }: Props) => {
    if (isLoading) return <MembersLoadingState />;
    if (isError) return <MembersErrorState />;
    if (members.length === 0) return <MembersEmptyState />;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {members.map((member) => (
                <MemberItem key={member.id} member={member} onSelect={onSelect} />
            ))}
        </div>
    );
};
