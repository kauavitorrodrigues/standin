import { ParticipantList } from "@/features/chat/components/instances/ParticipantList";
import type { SidebarBodyProps } from "@/features/chat/components/layout/SidebarBodyProps";

// Same reasoning as ThreadBody: guards itself against the still-nullable
// conversationId instead of the parent asserting it away.
export const ParticipantsBody = ({ conversationId }: SidebarBodyProps) => {
    if (!conversationId) return null;
    return <ParticipantList conversationId={conversationId} />;
};
