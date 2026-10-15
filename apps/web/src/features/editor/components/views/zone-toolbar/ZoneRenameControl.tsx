import type { Zone } from "@standin/contracts";
import { ToolbarSection } from "@/features/editor/components/layout/ToolbarSection";
import { ZoneRenameForm } from "@/features/editor/components/forms/ZoneRenameForm";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";

const hasName = (zone: Zone): boolean => {
    switch (zone.kind) {
        case ZONE_KINDS.AREA:
        case ZONE_KINDS.ROOM:
            return true;
        default:
            return false;
    }
};

type ZoneRenameControlProps = {
    zone: Zone;
    onRename: (label: string) => void;
};

// The name field of an area or a room. A spawn has no name, so nothing shows
// for it.
// The form restarts when the zone or its name changes (undo, another zone).
export const ZoneRenameControl = ({
    zone,
    onRename,
}: ZoneRenameControlProps) => {
    if (!hasName(zone)) return null;

    return (
        <ToolbarSection>
            <ZoneRenameForm
                key={`${zone.id}:${zone.label}`}
                label={zone.label ?? ""}
                onRename={onRename}
            />
        </ToolbarSection>
    );
};
