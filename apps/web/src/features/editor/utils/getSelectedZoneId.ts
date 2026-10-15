import { parseZoneSelectionId } from "@/features/editor/utils/parseZoneSelectionId";

// The zone the selection holds, when it holds exactly one thing and that is a
// zone.
export const getSelectedZoneId = (
    selection: readonly string[]
): number | null => {
    if (selection.length !== 1) return null;
    return parseZoneSelectionId(selection[0]);
};
