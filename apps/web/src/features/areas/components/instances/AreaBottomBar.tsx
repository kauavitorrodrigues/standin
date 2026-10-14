import { BottomBar } from "@/features/editor/components/layout/BottomBar";
import { DiscardButton } from "@/features/editor/components/views/toolbar/DiscardButton";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { getAreaStatus } from "../../utils/getAreaStatus";
import { AreaStatusBadge } from "../views/AreaStatusBadge";
import { SaveButton } from "../views/SaveButton";

type Props = {
    isDirty: boolean;
    isSaving: boolean;
    onSave: () => void;
};

// Discard, the state of the composer and save, on the bottom of the canvas.
export const AreaBottomBar = ({ isDirty, isSaving, onSave }: Props) => {
    const store = useEditorStore();
    const panelOpen = useEditorSelector((state) => state.panelOpen);

    return (
        <BottomBar panelOpen={panelOpen}>
            <DiscardButton
                hasChanges={isDirty && !isSaving}
                onDiscard={() => store.openDialog(EDITOR_DIALOG.DISCARD)}
            />
            <AreaStatusBadge status={getAreaStatus({ isDirty, isSaving })} />
            <SaveButton disabled={!isDirty || isSaving} onSave={onSave} />
        </BottomBar>
    );
};
