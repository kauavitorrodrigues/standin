import { HistoryButtons } from "@/components/editor/HistoryButtons";
import { ToolbarDivider } from "@/components/editor/ToolbarDivider";
import { ClearSelectionButton } from "@/features/maps/__shared__/components/views/toolbar/ClearSelectionButton";
import { ToolRail } from "@/features/maps/__shared__/components/views/toolbar/ToolRail";
import { ViewToggles } from "@/features/maps/__shared__/components/views/toolbar/ViewToggles";
import { useDraftStore } from "@/features/maps/__shared__/hooks/useDraftStore";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { VerticalToolbar } from "@/components/editor/VerticalToolbar";

// The tools of the map editor: one over the other, then the clear button, then
// undo and redo, then the grid and the zones.
export const EditorToolRail = () => {
    const store = useEditorStore();
    const draftStore = useDraftStore();
    const tool = useEditorSelector((state) => state.tool);
    const gridVisible = useEditorSelector((state) => state.gridVisible);
    const zonesVisible = useEditorSelector((state) => state.zonesVisible);
    const { canUndo, canRedo } = useEditorSelector((state) => state.draft);
    const locked = useEditorSelector((state) => state.locked);
    const canClear = useEditorSelector(
        (state) => state.placing !== null || state.selection.length > 0
    );

    return (
        <VerticalToolbar>
            <ToolRail
                tool={tool}
                locked={locked}
                onToolChange={store.setTool}
            />
            <ClearSelectionButton
                canClear={canClear && !locked}
                onClear={store.clearSelectionAndPlacing}
            />
            <ToolbarDivider />
            <HistoryButtons
                canUndo={canUndo && !locked}
                canRedo={canRedo && !locked}
                onUndo={draftStore.undo}
                onRedo={draftStore.redo}
            />
            <ToolbarDivider />
            <ViewToggles
                gridVisible={gridVisible}
                zonesVisible={zonesVisible}
                onToggleGrid={store.toggleGrid}
                onToggleZones={store.toggleZones}
            />
        </VerticalToolbar>
    );
};
