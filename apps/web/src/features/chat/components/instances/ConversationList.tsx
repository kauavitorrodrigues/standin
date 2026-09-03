import type { SpaceDetails } from "@standin/contracts";
import { Content } from "@/features/chat/components/views/conversations/Content";

type Props = {
    space: SpaceDetails;
    onSelect: (conversationId: string) => void;
};

// The space conversation comes from the already loaded space details. Direct
// messages are not listed yet because there is no route to discover them.
export const ConversationList = ({ space, onSelect }: Props) => {
    return (
        <Content
            spaceName={space.name}
            onSelectSpaceConversation={() => onSelect(space.conversationId)}
        />
    );
};
