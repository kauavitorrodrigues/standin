import { GridIcon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { ZonesToggle } from "@/features/editor/components/views/toolbar/ZonesToggle";
import { MAP_EDITOR_KEYS } from "@/features/editor/consts/editorKeys";

type ViewTogglesProps = {
    gridVisible: boolean;
    zonesVisible: boolean;
    onToggleGrid: () => void;
    onToggleZones: () => void;
    // An editor without zones leaves their toggle out.
    withZones?: boolean;
};

// Show or hide the grid and the zones over the map.
export const ViewToggles = ({
    gridVisible,
    zonesVisible,
    onToggleGrid,
    onToggleZones,
    withZones = true,
}: ViewTogglesProps) => (
    <>
        <ToolbarButton
            label="Alternar a grade"
            icon={GridIcon}
            shortcut={MAP_EDITOR_KEYS.TOGGLE_GRID[0].toUpperCase()}
            active={gridVisible}
            activeLook="toggle"
            onClick={onToggleGrid}
        />
        <ZonesToggle
            enabled={withZones}
            visible={zonesVisible}
            onToggle={onToggleZones}
        />
    </>
);
