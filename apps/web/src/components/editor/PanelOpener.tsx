import { FloatingPanel } from "@/components/editor/FloatingPanel";
import { PanelToggleButton } from "@/components/editor/PanelToggleButton";

type Props = {
    label: string;
    shortcut: string;
    open: boolean;
    onToggle: () => void;
};

// The button that opens the side panel, floating on the top left of the
// canvas. It shows only while the panel is closed.
export const PanelOpener = ({ label, shortcut, open, onToggle }: Props) => (
    <FloatingPanel open={!open} className="top-3 left-3 overflow-hidden">
        <PanelToggleButton
            label={label}
            shortcut={shortcut}
            open={open}
            onToggle={onToggle}
        />
    </FloatingPanel>
);
