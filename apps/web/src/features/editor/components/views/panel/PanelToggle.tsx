import { PanelToggleButton } from "@/features/editor/components/views/PanelToggleButton";
import { MAP_EDITOR_KEYS } from "@/features/editor/consts/editorKeys";

type PanelToggleProps = {
    open: boolean;
    onToggle: () => void;
};

// Opens and closes the side panel.
export const PanelToggle = ({ open, onToggle }: PanelToggleProps) => (
    <PanelToggleButton
        label="Painel de objetos e tiles"
        shortcut={MAP_EDITOR_KEYS.TOGGLE_PANEL[0].toUpperCase()}
        open={open}
        onToggle={onToggle}
    />
);
