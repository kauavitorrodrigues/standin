import { GridIcon, SquareDashedIcon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { MAP_EDITOR_KEYS } from "@/features/editor/consts/editorKeys";

type ViewTogglesProps = {
    gridVisible: boolean;
    zonesVisible: boolean;
    onToggleGrid: () => void;
    onToggleZones: () => void;
};

// Show or hide the grid and the zones over the map.
export const ViewToggles = ({
    gridVisible,
    zonesVisible,
    onToggleGrid,
    onToggleZones,
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
        <ToolbarButton
            label="Alternar as zonas"
            icon={SquareDashedIcon}
            shortcut={MAP_EDITOR_KEYS.TOGGLE_ZONES[0].toUpperCase()}
            active={zonesVisible}
            activeLook="toggle"
            onClick={onToggleZones}
        />
    </>
);
