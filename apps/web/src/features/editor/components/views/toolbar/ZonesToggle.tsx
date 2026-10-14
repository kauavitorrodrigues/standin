import { SquareDashedIcon } from "lucide-react";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { MAP_EDITOR_KEYS } from "@/features/editor/consts/editorKeys";

type ZonesToggleProps = {
    enabled: boolean;
    visible: boolean;
    onToggle: () => void;
};

export const ZonesToggle = ({
    enabled,
    visible,
    onToggle,
}: ZonesToggleProps) => {
    if (!enabled) return null;

    return (
        <ToolbarButton
            label="Alternar as zonas"
            icon={SquareDashedIcon}
            shortcut={MAP_EDITOR_KEYS.TOGGLE_ZONES[0].toUpperCase()}
            active={visible}
            activeLook="toggle"
            onClick={onToggle}
        />
    );
};
