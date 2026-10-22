import type { ReactNode } from "react";

type Props = {
    children?: ReactNode;
    // The stage toggle takes the top right corner while it is on screen, so the
    // stack starts below it.
    isBelowStageToggle: boolean;
};

// Everything that floats at the right edge of the space (the profile, the
// requests to enter a room, the requests of guests) goes in this one column, so
// each card lands under the one before it instead of on top of it. The column
// lets pointer events through to the canvas; each card opts back in.
export const RightStack = ({ children, isBelowStageToggle }: Props) => (
    <div
        data-below-toggle={isBelowStageToggle}
        className="pointer-events-none absolute top-3 right-3 z-40 flex w-80 flex-col gap-2 data-[below-toggle=true]:top-16"
    >
        {children}
    </div>
);
