import { Trash2Icon } from "lucide-react";
import { ToolbarSection } from "@/components/editor/ToolbarSection";
import { ToolbarButton } from "@/components/editor/ToolbarButton";
import { OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX } from "@/features/maps/__shared__/consts/object-toolbar";

type DeleteControlProps = {
    onDelete: () => void;
};

// Always there. A claimed desk asks for confirmation before it goes.
export const DeleteControl = ({ onDelete }: DeleteControlProps) => (
    <ToolbarSection>
        <ToolbarButton
            label="Apagar"
            icon={Trash2Icon}
            shortcut="Del"
            side="top"
            sideOffset={OBJECT_TOOLBAR_TOOLTIP_OFFSET_PX}
            onClick={onDelete}
        />
    </ToolbarSection>
);
