import { LockIcon } from "lucide-react";
import type { HoverState } from "@/features/game/types/hover";

type LockedDeskMarkProps = {
    hover: HoverState;
    // What the mark says: whose desk it is.
    text: string;
};

// Over a desk that cannot be chosen, with the lock and who holds it. It lets
// the pointer through, so it never gets in the way of the map.
export const LockedDeskMark = ({ hover, text }: LockedDeskMarkProps) => (
    <div
        role="status"
        className="pointer-events-none absolute z-20 flex items-center justify-center"
        style={{
            left: hover.screen.x,
            top: hover.screen.y,
            width: hover.screen.width,
            height: hover.screen.height,
        }}
    >
        <span className="flex items-center gap-1.5 rounded-lg bg-black/85 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-md">
            <LockIcon className="size-3.5" />
            {text}
        </span>
    </div>
);
