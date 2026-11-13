import { AMBIENT_EVENTS } from "@/features/ambient/consts/ambientConversation";
import { useHoverTarget } from "@/features/game/hooks/useHoverTarget";
import type { GameEngineHandle } from "@/features/game/types/game";

type AmbientConversationLabelProps = {
    handle: GameEngineHandle | null;
};

// "Conversa por perto" over the avatar of a person whose conversation is
// overheard, like the label of a zone but at the top edge of the avatar.
export const AmbientConversationLabel = ({
    handle,
}: AmbientConversationLabelProps) => {
    const { hover } = useHoverTarget(handle, AMBIENT_EVENTS.HOVER_CHANGED);
    if (!hover?.label) return null;

    const { screen, label } = hover;
    return (
        <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-1"
            style={{ left: screen.x + screen.width / 2, top: screen.y }}
        >
            <div className="rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background shadow-lg">
                {label}
            </div>
        </div>
    );
};
