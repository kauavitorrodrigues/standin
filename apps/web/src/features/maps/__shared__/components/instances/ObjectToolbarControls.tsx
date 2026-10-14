import { useMemo } from "react";
import type { AssetDefinition } from "@standin/contracts";
import { ColorControl } from "@/features/maps/__shared__/components/views/object-toolbar/ColorControl";
import { DeleteControl } from "@/features/maps/__shared__/components/views/object-toolbar/DeleteControl";
import { ModelControl } from "@/features/maps/__shared__/components/views/object-toolbar/ModelControl";
import { ObjectToolbarBar } from "@/features/maps/__shared__/components/views/object-toolbar/ObjectToolbarBar";
import { RotateControl } from "@/features/maps/__shared__/components/views/object-toolbar/RotateControl";
import { useDraftSelector } from "@/features/maps/__shared__/hooks/useDraftSelector";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { getObjectToolbarControls } from "@/features/maps/__shared__/utils/getObjectToolbarControls";
import { isEditable } from "@/features/maps/__shared__/utils/isEditable";

// The controls of the selected object: model, color, turn and delete, only
// the ones that apply. Each swap is ONE gesture. Nothing shows for zero or
// several selected, while an object is being placed, or without the lock.
export const ObjectToolbarControls = () => {
    const store = useEditorStore();
    const selection = useEditorSelector((state) => state.selection);
    const placing = useEditorSelector((state) => state.placing);
    const editable = useEditorSelector((state) => isEditable(state));
    const model = useDraftSelector((state) => state.draft);

    const id = selection.length === 1 ? selection[0] : null;
    const controls = useMemo(
        () => (id === null ? null : getObjectToolbarControls(model, id)),
        [model, id]
    );

    if (!controls || !editable || placing !== null) return null;

    const handleReplace = (asset: AssetDefinition) =>
        store.replaceSelection(asset.id);

    return (
        <ObjectToolbarBar>
            <ModelControl
                show={controls.showModel}
                current={controls.current}
                models={controls.modelChoices}
                onSelect={handleReplace}
            />
            <ColorControl
                show={controls.showColor}
                current={controls.current}
                colors={controls.alternatives.colors}
                onSelect={handleReplace}
            />
            <RotateControl
                show={controls.showRotate}
                onRotate={store.rotateSelection}
            />
            <DeleteControl onDelete={store.removeSelection} />
        </ObjectToolbarBar>
    );
};
