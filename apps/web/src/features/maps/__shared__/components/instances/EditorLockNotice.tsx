import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDITOR_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { useDismissable } from "@/features/maps/__shared__/hooks/useDismissable";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";

// Tells, when the editor opens, that nobody else can edit or use the desks
// until the user leaves. It floats above the bottom bar, centered in the room
// the side panel leaves, fades in and stays until the user confirms.
export const EditorLockNotice = () => {
    const panelOpen = useEditorSelector((state) => state.panelOpen);
    const { visible, dismiss } = useDismissable();

    return (
        <div
            data-panel-open={panelOpen}
            className="pointer-events-none absolute inset-x-0 bottom-[4.75rem] z-99 flex justify-center data-[panel-open=true]:left-[calc(18rem+1.5rem)]"
        >
            <div
                role="status"
                data-visible={visible}
                inert={!visible}
                className="bg-background/90 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto flex items-center gap-3 rounded-lg border py-2 pr-2 pl-3 text-sm shadow-sm backdrop-blur transition-opacity duration-150 data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0"
            >
                <InfoIcon className="text-muted-foreground size-4 shrink-0" />
                {EDITOR_MESSAGES.LOCK_GRANTED}
                <Button variant="outline" size="sm" onClick={dismiss}>
                    {EDITOR_MESSAGES.LOCK_GRANTED_CONFIRM}
                </Button>
            </div>
        </div>
    );
};
