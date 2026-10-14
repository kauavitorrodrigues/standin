import { RotateCwIcon } from "lucide-react";
import { ToolbarSection } from "@/components/editor/ToolbarSection";
import { ToolbarButton } from "@/components/editor/ToolbarButton";
import { OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX } from "@/features/maps/__shared__/consts/object-toolbar";
import { MAP_EDITOR_KEYS } from "@/features/maps/__shared__/consts/editorKeys";

type RotateControlProps = {
    show: boolean;
    onRotate: () => void;
};

// Turns the object to the next rotation of its family. Nothing when the
// family has no other rotation.
export const RotateControl = ({ show, onRotate }: RotateControlProps) => {
    if (!show) return null;

    return (
        <ToolbarSection>
            <ToolbarButton
                label="Girar"
                icon={RotateCwIcon}
                shortcut={MAP_EDITOR_KEYS.ROTATE[0].toUpperCase()}
                side="top"
                sideOffset={OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX}
                onClick={onRotate}
            />
        </ToolbarSection>
    );
};
