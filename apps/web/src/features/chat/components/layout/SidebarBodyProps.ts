import type { SpaceDetails } from "@standin/contracts";

export type SidebarBodyProps = {
    space: SpaceDetails;
    conversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
};
