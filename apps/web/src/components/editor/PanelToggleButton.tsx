import { PanelLeftIcon } from "lucide-react";
import { ToolbarButton } from "@/components/editor/ToolbarButton";

type Props = {
    label: string;
    // The key that does the same, as shown to the user.
    shortcut: string;
    open: boolean;
    onToggle: () => void;
};

// Opens and closes the side panel of an editor.
export const PanelToggleButton = ({
    label,
    shortcut,
    open,
    onToggle,
}: Props) => (
    <ToolbarButton
        label={label}
        icon={PanelLeftIcon}
        shortcut={shortcut}
        active={open}
        activeLook="toggle"
        side="right"
        onClick={onToggle}
    />
);
