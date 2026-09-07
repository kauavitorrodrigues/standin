import { ChatQueries } from "@/features/chat/queries";
import { Content } from "@/features/chat/components/views/participants/Content";

type Props = { conversationId: string };

export const ParticipantList = ({ conversationId }: Props) => {
    const { participants, isLoading, isError } =
        ChatQueries.useParticipants(conversationId);

    return (
        <Content
            participants={participants}
            isLoading={isLoading}
            isError={isError}
        />
    );
};
