import { BottomBar } from "@/features/editor/components/layout/BottomBar";
import { EditorStatusBadge } from "@/features/maps/__shared__/components/instances/EditorStatusBadge";
import { DiscardButton } from "@/features/editor/components/views/toolbar/DiscardButton";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { PublishButton } from "@/features/maps/__shared__/components/views/toolbar/PublishButton";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";

// Discard, the state of the draft and publish, on the bottom of the canvas.
export const EditorBottomBar = () => {
    const store = useEditorStore();
    const { hasChanges } = useEditorSelector((state) => state.draft);
    const panelOpen = useEditorSelector((state) => state.panelOpen);
    const locked = useEditorSelector((state) => state.locked);

    return (
        <BottomBar panelOpen={panelOpen}>
            <DiscardButton
                hasChanges={hasChanges}
                onDiscard={() => store.openDialog(EDITOR_DIALOG.DISCARD)}
            />
            <EditorStatusBadge />
            <PublishButton
                hasChanges={hasChanges && !locked}
                onPublish={store.requestPublish}
            />
        </BottomBar>
    );
};
