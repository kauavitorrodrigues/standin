import { MaximizeIcon } from "lucide-react";
import { FloatingIconButton } from "@/components/FloatingIconButton";
import { STAGE_OVERFLOW_LABELS } from "../../consts/stage";

// Same floating treatment as the game's own controls (center on character,
// zoom), but placed right beside the tiles it acts on, so it is obvious what
// it opens.
export const FloatingStageControls = ({
    onExpand,
}: {
    onExpand: () => void;
}) => (
    <div className="pointer-events-auto shrink-0">
        <FloatingIconButton
            icon={<MaximizeIcon />}
            label={STAGE_OVERFLOW_LABELS.expand}
            onClick={onExpand}
            tooltipSide="bottom"
            className="size-11 rounded-full shadow-lg backdrop-blur-md"
        />
    </div>
);
