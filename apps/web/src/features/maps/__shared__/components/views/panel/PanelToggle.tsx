import { PanelToggleButton } from "@/components/editor/PanelToggleButton";
import { MAP_EDITOR_KEYS } from "@/features/maps/__shared__/consts/editorKeys";

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
