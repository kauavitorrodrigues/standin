import type { ReactNode } from "react";
import { AnimatedCollapse } from "@/components/ui/animated-collapse";

type Props = {
    visible: boolean;
    children: ReactNode;
};

// A field the type forces is hidden with a smooth collapse. The negative top
// margin takes back the gap of the column while it is closed.
export const HideWhenLocked = ({ visible, children }: Props) => (
    <AnimatedCollapse open={visible} className="data-[state=closed]:-mt-4">
        {children}
    </AnimatedCollapse>
);
