import type { UserSummary } from "@standin/contracts";
import { UserAvatarInfo } from "@/features/users/components/UserAvatarInfo";

type Props = { participant: UserSummary };

export const ParticipantItem = ({ participant }: Props) => (
    <UserAvatarInfo
        id={participant.id}
        name={participant.name}
        avatar={participant.avatarUrl}
        size="sm"
        className="p-2"
    />
);
