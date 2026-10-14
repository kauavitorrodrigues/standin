import { useMemo } from "react";
import { DeleteControl } from "@/features/editor/components/views/object-toolbar/DeleteControl";
import { ObjectToolbarBar } from "@/features/editor/components/views/object-toolbar/ObjectToolbarBar";
import { ZoneNotice } from "@/features/editor/components/views/zone-toolbar/ZoneNotice";
import { ZoneRenameControl } from "@/features/editor/components/views/zone-toolbar/ZoneRenameControl";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { findEditableZone } from "@/features/editor/utils/findEditableZone";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { isEditable } from "@/features/editor/utils/isEditable";

// The controls of the selected zone: the name of an area and delete. Nothing
// shows for no zone, while zones are hidden (the zones toggle hides this bar
// too), or without the lock. Removing the last spawn is refused by the draft
// and the reason shows beside the controls.
export const ZoneToolbarControls = () => {
    const store = useEditorStore();
    const selection = useEditorSelector((state) => state.selection);
    const notice = useEditorSelector((state) => state.selectionNotice);
    const zonesVisible = useEditorSelector((state) => state.zonesVisible);
    const editable = useEditorSelector((state) => isEditable(state));
    const layout = useDraftSelector((state) => state.draft.layout);

    const zoneId = getSelectedZoneId(selection);
    const zone = useMemo(
        () => (zoneId === null ? null : findEditableZone(layout, zoneId)),
        [layout, zoneId]
    );

    if (!zone || !zonesVisible || !editable) return null;

    return (
        <ObjectToolbarBar>
            <ZoneRenameControl
                zone={zone}
                onRename={store.renameSelectedZone}
            />
            <DeleteControl onDelete={store.removeSelection} />
            <ZoneNotice notice={notice} />
        </ObjectToolbarBar>
    );
};
