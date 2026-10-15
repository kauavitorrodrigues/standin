import type { HoverState } from "@/features/game/types/hover";
import type { DeskCardAction } from "../../types/deskCard";
import { DeskCardButton } from "./DeskCardButton";

type DeskCardProps = {
    hover: HoverState;
    action: DeskCardAction;
    isBusy: boolean;
    onAction: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
};

// Covers the free desk so the button sits inside its outline, centered. The
// cover lets the pointer through to the canvas, so only the button and not
// the whole desk counts as the card. The label hangs under the desk, at its
// right corner, outside the outline.
export const DeskCard = ({
    hover,
    action,
    isBusy,
    onAction,
    onPointerEnter,
    onPointerLeave,
}: DeskCardProps) => (
    <div
        className="pointer-events-none absolute z-20 flex items-center justify-center"
        style={{
            left: hover.screen.x,
            top: hover.screen.y,
            width: hover.screen.width,
            height: hover.screen.height,
        }}
    >
        <DeskCardButton
            action={action}
            disabled={isBusy}
            onClick={onAction}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        />
        <span className="absolute top-full right-0 mt-1 rounded-md bg-black/70 px-2 py-1 text-xs whitespace-nowrap text-white">
            Mesa livre
        </span>
    </div>
);
