import type { ReactNode } from "react";

type ObjectToolbarBarProps = {
    children: ReactNode;
};

// The strip the groups sit in, over the object. It has no padding of its own:
// each group (ToolbarSection) pads itself, so the lines between groups touch
// the top and the bottom of the strip.
export const ObjectToolbarBar = ({ children }: ObjectToolbarBarProps) => (
    <div className="bg-background/90 pointer-events-auto flex items-stretch divide-x overflow-hidden rounded-lg border shadow-sm backdrop-blur">
        {children}
    </div>
);
