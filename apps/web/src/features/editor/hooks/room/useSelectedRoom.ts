import { useMemo } from "react";
import type { Zone } from "@standin/contracts";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { findEditableZone } from "@/features/editor/utils/findEditableZone";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { isEditable } from "@/features/editor/utils/isEditable";

// The selected zone when it is a room the user can edit, else null. Same
// conditions as the bar over a zone: zones shown and the editing lock held.
export const useSelectedRoom = (): Zone | null => {
    const selection = useEditorSelector((state) => state.selection);
    const zonesVisible = useEditorSelector((state) => state.zonesVisible);
    const editable = useEditorSelector((state) => isEditable(state));
    const layout = useDraftSelector((state) => state.draft.layout);

    const zoneId = getSelectedZoneId(selection);
    const zone = useMemo(
        () => (zoneId === null ? null : findEditableZone(layout, zoneId)),
        [layout, zoneId]
    );

    if (!zone || !zonesVisible || !editable) return null;
    if (zone.kind !== ZONE_KINDS.ROOM || !zone.key) return null;
    return zone;
};
