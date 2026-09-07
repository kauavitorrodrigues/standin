import { ConversationList } from "@/features/chat/components/instances/ConversationList";
import type { SidebarBodyProps } from "@/features/chat/components/layout/SidebarBodyProps";

export const ListBody = ({ space, onSelectConversation }: SidebarBodyProps) => (
    <ConversationList space={space} onSelect={onSelectConversation} />
);
