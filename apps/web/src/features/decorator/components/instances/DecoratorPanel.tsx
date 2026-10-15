import { Panel } from "@/features/decorator/components/layout/Panel";
import { DecoratorObjects } from "@/features/decorator/components/instances/DecoratorObjects";
import { HistoryButtons } from "@/features/decorator/components/views/HistoryButtons";
import { PanelFooter } from "@/features/decorator/components/views/PanelFooter";
import { PanelHeader } from "@/features/decorator/components/views/PanelHeader";
import { UsageText } from "@/features/decorator/components/views/UsageText";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { useUsage } from "@/features/editor/hooks/useUsage";
import { isEditable } from "@/features/editor/utils/isEditable";

type DecoratorPanelProps = {
    mapId: string;
    // The X: closes the decorator and applies what was decorated.
    onClose: () => void;
};

// The panel on the right: the title with the X, the library, and on the foot
// undo, redo, discard and how much of the object limit is used. Undo, redo and discard wait
// while the decoration is applied or the lock is lost.
export const DecoratorPanel = ({ mapId, onClose }: DecoratorPanelProps) => {
    const store = useEditorStore();
    const draftStore = useDraftStore();
    const { hasChanges, canUndo, canRedo } = useEditorSelector(
        (state) => state.draft
    );
    const editable = useEditorSelector((state) => isEditable(state));
    const usage = useUsage();

    return (
        <Panel>
            <PanelHeader onClose={onClose} />
            <DecoratorObjects mapId={mapId} />
            <PanelFooter>
                <HistoryButtons
                    canUndo={canUndo && editable}
                    canRedo={canRedo && editable}
                    canDiscard={hasChanges && editable}
                    onUndo={() => draftStore.undo()}
                    onRedo={() => draftStore.redo()}
                    onDiscard={() => store.openDialog(EDITOR_DIALOG.DISCARD)}
                />
                <UsageText percent={usage.percent} level={usage.level} />
            </PanelFooter>
        </Panel>
    );
};
