import { CheckIcon } from "lucide-react";
import type { UserSummary } from "@standin/contracts";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type Props = {
    member: UserSummary;
    selected: boolean;
    onToggle: (member: UserSummary) => void;
};

export const MemberItem = ({ member, selected, onToggle }: Props) => (
    <button
        type="button"
        onClick={() => onToggle(member)}
        aria-pressed={selected}
        className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted aria-pressed:bg-muted"
    >
        <UserAvatar
            id={member.id}
            name={member.name}
            avatar={member.profilePictureUrl}
            size="default"
        />
        <span className="flex-1 truncate text-sm font-medium">
            {member.name}
        </span>
        <SelectedMark selected={selected} />
    </button>
);

const SelectedMark = ({ selected }: { selected: boolean }) => {
    if (!selected) return null;

    return <CheckIcon className="size-4 shrink-0 text-primary" />;
};
