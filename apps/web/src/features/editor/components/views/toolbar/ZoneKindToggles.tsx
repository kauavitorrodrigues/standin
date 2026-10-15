import { ToolOptionToggle } from "@/features/editor/components/views/ToolOptionToggle";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneKind } from "@/features/editor/types/zone-kind";

type ZoneKindTogglesProps = {
    zoneKind: ZoneKind;
    onZoneKindChange: (zoneKind: ZoneKind) => void;
};

// Spawn or area: what the zone tool creates.
export const ZoneKindToggles = ({
    zoneKind,
    onZoneKindChange,
}: ZoneKindTogglesProps) => (
    <>
        <ToolOptionToggle
            label="Spawn"
            active={zoneKind === ZONE_KINDS.SPAWN}
            onClick={() => onZoneKindChange(ZONE_KINDS.SPAWN)}
        />
        <ToolOptionToggle
            label="Área"
            active={zoneKind === ZONE_KINDS.AREA}
            onClick={() => onZoneKindChange(ZONE_KINDS.AREA)}
        />
    </>
);
