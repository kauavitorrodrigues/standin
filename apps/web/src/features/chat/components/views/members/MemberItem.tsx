import type { UserSummary } from "@standin/contracts";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type Props = { member: UserSummary; onSelect: (member: UserSummary) => void };

export const MemberItem = ({ member, onSelect }: Props) => (
    <button
        type="button"
        onClick={() => onSelect(member)}
        className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
    >
        <UserAvatar id={member.id} avatar={member.avatarUrl} size="default" />
        <span className="truncate text-sm font-medium">{member.name}</span>
    </button>
);
