import { NotebookPenIcon } from "lucide-react";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import type { ThreadParticipant } from "@/features/chat/types/chatPage";

const MAX_STACKED_AVATARS = 3;

type Props = {
    participants: ThreadParticipant[];
    // The conversation with yourself has no other participant to show.
    isNotes: boolean;
};

export const ParticipantAvatarStack = ({ participants, isNotes }: Props) => {
    if (isNotes) {
        return (
            <AvatarGroup>
                <AvatarGroupCount className="size-6">
                    <NotebookPenIcon />
                </AvatarGroupCount>
            </AvatarGroup>
        );
    }

    if (participants.length === 0) return null;

    const visible = participants.slice(0, MAX_STACKED_AVATARS);
    const hiddenCount = participants.length - visible.length;

    return (
        <AvatarGroup>
            {visible.map((participant) => (
                <UserAvatar
                    key={participant.id}
                    id={participant.id}
                    name={participant.name}
                    avatar={participant.profilePictureUrl}
                    size="xs"
                    className="size-6"
                />
            ))}
            <HiddenCount count={hiddenCount} />
        </AvatarGroup>
    );
};

const HiddenCount = ({ count }: { count: number }) => {
    if (count <= 0) return null;

    return <AvatarGroupCount className="size-6 text-xs">+{count}</AvatarGroupCount>;
};
