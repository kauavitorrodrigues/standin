import type { SpaceDetails } from "@standin/contracts";
import { useSidebar } from "@/components/ui/sidebar";
import { ChatQueries } from "@/features/chat/queries";
import { ParticipantList } from "@/features/chat/components/instances/ParticipantList";
import { HeaderShell } from "@/features/chat/components/layout/HeaderShell";
import { CloseSidebarButton } from "@/features/chat/components/layout/CloseSidebarButton";

type Props = { space: SpaceDetails };

// Standalone sidebar tab for the space's full roster, separate from the
// participants view nested inside the chat thread header.
export const PeopleSidebar = ({ space }: Props) => {
    const { setOpen } = useSidebar();
    const { participants } = ChatQueries.useParticipants(
        space.conversationId
    );

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <HeaderShell title={`Participantes (${participants.length})`}>
                <CloseSidebarButton onClick={() => setOpen(false)} />
            </HeaderShell>
            <ParticipantList conversationId={space.conversationId} />
        </div>
    );
};
