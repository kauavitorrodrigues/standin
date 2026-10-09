import type { UserSummary } from "@standin/contracts";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-1">
                {participants.map((participant) => (
                    <ParticipantItem
                        key={participant.id}
                        participant={participant}
                    />
                ))}
            </div>
        </ScrollArea>
    );
};
