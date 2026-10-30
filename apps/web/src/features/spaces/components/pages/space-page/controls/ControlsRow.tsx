import type { ReactNode } from "react";
import { AnimatedCollapse } from "@/components/ui/animated-collapse";

type Props = { isOpen: boolean; children: ReactNode };

// A row of the control card that opens and closes above the buttons. The width
// is `w-0 min-w-full`: the row counts as zero wide when the card sizes itself,
// so the buttons decide the width, and then stretches to that width. Without
// it a wide row would make the whole card wider.
export const ControlsRow = ({ isOpen, children }: Props) => (
    <AnimatedCollapse open={isOpen} className="w-0 min-w-full">
        {children}
    </AnimatedCollapse>
);
