import type { UserSummary } from "@standin/contracts";
import { ParticipantItem } from "@/features/chat/components/views/participants/ParticipantItem";
import {
    ParticipantsErrorState,
    ParticipantsLoadingState,
} from "@/features/chat/components/views/participants/ContentStates";

type Props = {
    participants: UserSummary[];
    isLoading: boolean;
    isError: boolean;
};

export const Content = ({ participants, isLoading, isError }: Props) => {
    if (isLoading) return <ParticipantsLoadingState />;
    if (isError) return <ParticipantsErrorState />;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {participants.map((participant) => (
                <ParticipantItem
                    key={participant.id}
                    participant={participant}
                />
            ))}
        </div>
    );
};
